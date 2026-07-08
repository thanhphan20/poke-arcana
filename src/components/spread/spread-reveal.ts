import { MAJOR_CARD_THEME, ROMAN, SPREAD_POSITIONS, SUIT_CARD_THEME } from '../../lib/arcana/meanings';
import type { Suit } from '../../lib/arcana/types';

interface SpreadArcana {
  kind: 'major' | 'minor';
  name: string;
  suit?: Suit;
  majorNumber?: number;
}

interface SpreadCard {
  id: number;
  slug: string;
  name: string;
  sprite: string;
  arcana: SpreadArcana;
}

interface Slot {
  flip: HTMLElement;
  label: HTMLElement;
  revealed: boolean;
}

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    // Auto-flip reveal with a stagger: card i reveals at 350 + i*260 ms.
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
  }

  private buildSlot(card: SpreadCard, position: string, index: number) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `width:${this.slotWidth()};text-align:center;`;

    const flip = document.createElement('div');
    flip.style.cssText =
      'position:relative;width:100%;aspect-ratio:63/100;transform-style:preserve-3d;cursor:pointer;transform:rotateY(180deg);' +
      (REDUCED_MOTION ? '' : 'transition:transform .8s cubic-bezier(.4,.1,.2,1);');

    const back = document.createElement('div');
    back.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);';
    back.innerHTML =
      '<div class="card-back"><div class="card-back__field"><div class="card-back__ring"><span class="card-back__sigil">✦</span></div></div></div>';

    const front = document.createElement('div');
    front.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;';
    front.innerHTML = this.frontHtml(card);

    flip.append(back, front);

    const label = document.createElement('div');
    label.style.cssText =
      "margin-top:12px;font-family:'Cinzel',serif;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#5a5273;";
    label.textContent = position;

    // Click toggles this card's flip state.
    flip.addEventListener('click', () => this.setRevealed(index, !this.slots[index]?.revealed));

    wrapper.append(flip, label);
    return { el: wrapper, state: { flip, label, revealed: false } satisfies Slot };
  }

  private frontHtml(card: SpreadCard): string {
    const isMajor = card.arcana.kind === 'major';
    const theme = isMajor ? MAJOR_CARD_THEME : SUIT_CARD_THEME[card.arcana.suit ?? 'cups'];
    const kicker = isMajor ? (ROMAN[card.arcana.majorNumber ?? 0] ?? '✦') : (card.arcana.suit ?? '');
    const paddedId = String(card.id).padStart(3, '0');
    const name = escapeHtml(card.name);
    const arcanaName = escapeHtml(card.arcana.name);
    const slug = escapeHtml(card.slug);
    const sprite = escapeHtml(card.sprite);

    return `<a class="arcana-card is-link" style="--accent:${theme.accent}; --wash:${theme.wash};" href="/deck/${slug}">
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
          <img class="arcana-card__sprite" src="${sprite}" alt="${name}" loading="lazy">
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
