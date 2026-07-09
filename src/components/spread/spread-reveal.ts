import { MAJOR_CARD_THEME, ROMAN, SPREAD_POSITIONS, SUIT_CARD_THEME, SUIT_META } from '../../lib/arcana/meanings';
import { spriteUrl, SPRITE_FALLBACK } from '../../lib/sprites';
import type { Suit } from '../../lib/arcana/types';

interface SpreadArcana {
  kind: 'major' | 'minor';
  name: string;
  suit?: Suit;
  majorNumber?: number;
}

interface SpreadMember {
  id: number;
  name: string;
  slug: string;
}

interface SpreadCard {
  slug: string;
  arcana: SpreadArcana;
  members: SpreadMember[];
}

interface Slot {
  flip: HTMLElement;
  front: HTMLElement;
  label: HTMLElement;
  card: SpreadCard;
  position: string;
  /** Arcana face is showing (auto-revealed from face-down). */
  revealed: boolean;
  /** A Pokemon has been drawn for this card; terminal state. */
  drawn: boolean;
}

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Matches the flip transition duration set on each card below. */
const FLIP_MS = 800;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

class SpreadReveal extends HTMLElement {
  private deck: SpreadCard[] = [];
  private results!: HTMLElement;
  private spreadSize = 3;
  private hasDrawn = false;
  private slots: Slot[] = [];
  private timers: number[] = [];

  connectedCallback() {
    const initial = Number.parseInt(this.dataset.defaultSpread ?? '3', 10);
    if (initial === 1 || initial === 3 || initial === 10) this.spreadSize = initial;

    const dataScript = this.querySelector<HTMLScriptElement>('script[type="application/json"]');
    if (dataScript?.textContent) {
      try {
        this.deck = JSON.parse(dataScript.textContent) as SpreadCard[];
      } catch {
        this.deck = [];
      }
    }

    const container = this.querySelector<HTMLElement>('[data-results]');
    if (!container) return;
    this.results = container;

    this.onDocumentClick = this.onDocumentClick.bind(this);
    document.addEventListener('click', this.onDocumentClick);

    this.syncSpreadButtons();
    this.syncDrawLabel();
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.onDocumentClick);
    this.clearTimers();
  }

  private onDocumentClick(event: Event) {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const spreadBtn = target.closest<HTMLElement>('[data-spread]');
    if (spreadBtn) {
      const n = Number.parseInt(spreadBtn.dataset.spread ?? '', 10);
      if (n === 1 || n === 3 || n === 10) this.setSpread(n);
      return;
    }

    if (target.closest('[data-draw]')) {
      this.draw();
    }
  }

  private clearTimers() {
    for (const id of this.timers) clearTimeout(id);
    this.timers = [];
  }

  /** Update the pill group's active state to match the current spread size. */
  private syncSpreadButtons() {
    const buttons = document.querySelectorAll<HTMLElement>('[data-spread]');
    buttons.forEach((btn) => {
      const n = Number.parseInt(btn.dataset.spread ?? '', 10);
      btn.classList.toggle('is-active', n === this.spreadSize);
    });
  }

  private syncDrawLabel() {
    const btn = document.querySelector<HTMLElement>('[data-draw]');
    if (btn) btn.textContent = this.hasDrawn ? 'Draw Again' : 'Shuffle & Draw';
  }

  /** Changing the spread size resets any drawn cards. */
  private setSpread(n: number) {
    if (n === this.spreadSize) return;
    this.spreadSize = n;
    this.clearTimers();
    this.slots = [];
    this.results.replaceChildren();
    this.hasDrawn = false;
    this.syncSpreadButtons();
    this.syncDrawLabel();
  }

  private draw() {
    if (this.deck.length === 0) return;
    this.clearTimers();
    this.slots = [];
    this.results.replaceChildren();

    const n = Math.min(this.spreadSize, this.deck.length);
    const picked = this.shuffledIndices().slice(0, n);
    const positions = SPREAD_POSITIONS[this.spreadSize] ?? [];

    const fragment = document.createDocumentFragment();
    picked.forEach((deckIndex, i) => {
      const slot = this.buildSlot(this.deck[deckIndex], positions[i] ?? '', i);
      this.slots.push(slot.state);
      fragment.appendChild(slot.el);
    });
    this.results.appendChild(fragment);

    // Auto-flip reveal with a stagger: card i reveals its arcana face at 350 + i*260 ms.
    this.slots.forEach((_, i) => {
      const id = window.setTimeout(() => this.setRevealed(i, true), 350 + i * 260);
      this.timers.push(id);
    });

    this.hasDrawn = true;
    this.syncDrawLabel();
  }

  /** Fisher–Yates over deck indices. */
  private shuffledIndices(): number[] {
    const indices = this.deck.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }

  private slotWidth(): string {
    if (this.spreadSize === 10) return '150px';
    if (this.spreadSize === 1) return '260px';
    return '210px';
  }

  private setRevealed(index: number, revealed: boolean) {
    const slot = this.slots[index];
    if (!slot) return;
    slot.revealed = revealed;
    slot.flip.style.transform = revealed ? 'rotateY(0deg)' : 'rotateY(180deg)';
    slot.label.style.color = revealed ? '#e3cf95' : '#5a5273';
    this.updateLabel(slot);
  }

  /** Position label, plus a "tap to reveal" hint while the arcana face is showing and undrawn. */
  private updateLabel(slot: Slot) {
    const hint = slot.revealed && !slot.drawn ? ' · Tap to Reveal' : '';
    slot.label.textContent = `${slot.position}${hint}`;
  }

  private onCardTap(index: number) {
    const slot = this.slots[index];
    if (!slot || !slot.revealed || slot.drawn) return;
    this.drawPokemon(index);
  }

  /** Draws one Pokemon at random from the card's members and morphs the card to show it. */
  private drawPokemon(index: number) {
    const slot = this.slots[index];
    if (!slot || slot.drawn || slot.card.members.length === 0) return;
    const member = slot.card.members[Math.floor(Math.random() * slot.card.members.length)];
    slot.drawn = true;
    this.updateLabel(slot);

    if (REDUCED_MOTION) {
      slot.front.innerHTML = this.pokemonFrontHtml(slot.card, member);
      return;
    }

    slot.flip.style.transform = 'rotateY(180deg)';
    const id = window.setTimeout(() => {
      slot.front.innerHTML = this.pokemonFrontHtml(slot.card, member);
      slot.flip.style.transform = 'rotateY(0deg)';
    }, FLIP_MS);
    this.timers.push(id);
  }

  private buildSlot(card: SpreadCard, position: string, index: number) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `width:${this.slotWidth()};text-align:center;`;

    const flip = document.createElement('div');
    flip.style.cssText =
      'position:relative;width:100%;aspect-ratio:63/100;transform-style:preserve-3d;cursor:pointer;transform:rotateY(180deg);' +
      (REDUCED_MOTION ? '' : `transition:transform ${FLIP_MS}ms cubic-bezier(.4,.1,.2,1);`);

    const back = document.createElement('div');
    back.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);';
    back.innerHTML =
      '<div class="card-back"><div class="card-back__field"><div class="card-back__ring"><span class="card-back__sigil">✦</span></div></div></div>';

    const front = document.createElement('div');
    front.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;';
    front.innerHTML = this.emblemFrontHtml(card);

    flip.append(back, front);
    flip.addEventListener('click', () => this.onCardTap(index));

    const label = document.createElement('div');
    label.style.cssText =
      "margin-top:12px;font-family:'Cinzel',serif;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#5a5273;";
    label.textContent = position;

    wrapper.append(flip, label);
    return {
      el: wrapper,
      state: { flip, front, label, card, position, revealed: false, drawn: false } satisfies Slot,
    };
  }

  /** First-tier face: the arcana identity, no Pokemon yet. */
  private emblemFrontHtml(card: SpreadCard): string {
    const isMajor = card.arcana.kind === 'major';
    const theme = isMajor ? MAJOR_CARD_THEME : SUIT_CARD_THEME[card.arcana.suit ?? 'cups'];
    const kicker = isMajor ? (ROMAN[card.arcana.majorNumber ?? 0] ?? '✦') : (card.arcana.suit ?? '');
    const centerGlyph = isMajor
      ? (ROMAN[card.arcana.majorNumber ?? 0] ?? '✦')
      : (SUIT_META[card.arcana.suit ?? 'cups']?.glyph ?? '✦');
    const arcanaName = escapeHtml(card.arcana.name);

    return `<div class="arcana-card" style="--accent:${theme.accent}; --wash:${theme.wash};">
      <div class="arcana-card__paper">
        <div class="arcana-card__grain"></div>
        <div class="arcana-card__keyline"></div>
        <span class="arcana-card__flourish" style="top:5px;left:7px">✦</span>
        <span class="arcana-card__flourish" style="top:5px;right:7px">✦</span>
        <span class="arcana-card__flourish" style="bottom:5px;left:7px">✦</span>
        <span class="arcana-card__flourish" style="bottom:5px;right:7px">✦</span>
        <div class="arcana-card__kicker">${escapeHtml(kicker)}</div>
        <div class="arcana-card__vignette">
          <div class="arcana-card__rays"></div>
          <div class="arcana-card__horizon"></div>
          <span class="arcana-card__glyph">${escapeHtml(centerGlyph)}</span>
        </div>
        <div class="arcana-card__banner"><span class="arcana-card__star">✦</span><span class="arcana-card__arcana">${arcanaName}</span><span class="arcana-card__star">✦</span></div>
        <div class="arcana-card__footer"><span class="arcana-card__name">${arcanaName}</span></div>
      </div>
    </div>`;
  }

  /** Second-tier face: the drawn Pokemon, linking to its detail page. */
  private pokemonFrontHtml(card: SpreadCard, member: SpreadMember): string {
    const isMajor = card.arcana.kind === 'major';
    const theme = isMajor ? MAJOR_CARD_THEME : SUIT_CARD_THEME[card.arcana.suit ?? 'cups'];
    const kicker = isMajor ? (ROMAN[card.arcana.majorNumber ?? 0] ?? '✦') : (card.arcana.suit ?? '');
    const paddedId = String(member.id).padStart(3, '0');
    const name = escapeHtml(member.name);
    const arcanaName = escapeHtml(card.arcana.name);
    const slug = escapeHtml(member.slug);
    const sprite = escapeHtml(spriteUrl(member.id, 'artwork'));

    return `<a class="arcana-card is-link" style="--accent:${theme.accent}; --wash:${theme.wash};" href="/card/${slug}">
      <div class="arcana-card__paper">
        <div class="arcana-card__grain"></div>
        <div class="arcana-card__keyline"></div>
        <span class="arcana-card__flourish" style="top:5px;left:7px">✦</span>
        <span class="arcana-card__flourish" style="top:5px;right:7px">✦</span>
        <span class="arcana-card__flourish" style="bottom:5px;left:7px">✦</span>
        <span class="arcana-card__flourish" style="bottom:5px;right:7px">✦</span>
        <div class="arcana-card__kicker">${escapeHtml(kicker)}</div>
        <div class="arcana-card__vignette">
          <div class="arcana-card__rays"></div>
          <div class="arcana-card__horizon"></div>
          <img class="arcana-card__sprite" src="${sprite}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='${SPRITE_FALLBACK}';">
        </div>
        <div class="arcana-card__banner"><span class="arcana-card__star">✦</span><span class="arcana-card__arcana">${arcanaName}</span><span class="arcana-card__star">✦</span></div>
        <div class="arcana-card__footer"><span class="arcana-card__name">${name}</span><span class="arcana-card__id">№ ${paddedId}</span></div>
      </div>
    </a>`;
  }
}

if (!customElements.get('spread-reveal')) {
  customElements.define('spread-reveal', SpreadReveal);
}
