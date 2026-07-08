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
  private pickGrid!: HTMLElement;
  private pickStatus!: HTMLElement;
  private spreadSize = 3;
  private hasShuffled = false;
  private order: number[] = [];
  private picks: number[] = [];
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

    const results = this.querySelector<HTMLElement>('[data-results]');
    const pickGrid = this.querySelector<HTMLElement>('[data-pick-grid]');
    const pickStatus = this.querySelector<HTMLElement>('[data-pick-status]');
    if (!results || !pickGrid || !pickStatus) return;
    this.results = results;
    this.pickGrid = pickGrid;
    this.pickStatus = pickStatus;

    this.onDocumentClick = this.onDocumentClick.bind(this);
    document.addEventListener('click', this.onDocumentClick);
    this.pickGrid.addEventListener('click', this.onPickGridClick.bind(this));

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
      this.shuffleAndSpread();
    }
  }

  private onPickGridClick(event: Event) {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>('.pick-card');
    if (!button || button.disabled || this.picks.length >= this.spreadSize) return;
    this.pickCard(button);
  }

  private clearTimers() {
    for (const id of this.timers) clearTimeout(id);
    this.timers = [];
  }

  private syncSpreadButtons() {
    const buttons = document.querySelectorAll<HTMLElement>('[data-spread]');
    buttons.forEach((btn) => {
      const n = Number.parseInt(btn.dataset.spread ?? '', 10);
      btn.classList.toggle('is-active', n === this.spreadSize);
    });
  }

  private syncDrawLabel() {
    const btn = document.querySelector<HTMLElement>('[data-draw]');
    if (btn) btn.textContent = this.hasShuffled ? 'Reshuffle' : 'Shuffle the Deck';
  }

  /** Changing the spread size always resets the reading — a fresh shuffle is required. */
  private setSpread(n: number) {
    if (n === this.spreadSize) return;
    this.spreadSize = n;
    this.resetReading();
    this.hasShuffled = false;
    this.syncSpreadButtons();
    this.syncDrawLabel();
  }

  private resetReading() {
    this.clearTimers();
    this.slots = [];
    this.picks = [];
    this.order = [];
    this.results.replaceChildren();
    this.pickGrid.replaceChildren();
    this.pickGrid.hidden = true;
    this.pickGrid.classList.remove('is-complete');
    this.pickStatus.hidden = true;
  }

  /** Shuffle the whole deck and lay it out face-down for the visitor to choose from. */
  private shuffleAndSpread() {
    if (this.deck.length === 0) return;
    this.resetReading();

    this.order = this.shuffledIndices();
    const fragment = document.createDocumentFragment();
    this.order.forEach((deckIndex) => {
      fragment.appendChild(this.buildPickCard(deckIndex));
    });
    this.pickGrid.appendChild(fragment);
    this.pickGrid.hidden = false;
    this.pickStatus.hidden = false;

    this.hasShuffled = true;
    this.syncDrawLabel();
    this.updateStatus();
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

  private buildPickCard(deckIndex: number): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pick-card';
    button.dataset.deckIndex = String(deckIndex);
    button.setAttribute('aria-label', 'Choose this card');
    const rot = (Math.random() * 10 - 5).toFixed(1);
    button.style.setProperty('--pick-rot', `${rot}deg`);
    button.innerHTML = '<span class="pick-card__inner"><span class="pick-card__sigil">✦</span></span>';
    return button;
  }

  private pickCard(button: HTMLButtonElement) {
    const deckIndex = Number.parseInt(button.dataset.deckIndex ?? '', 10);
    const card = this.deck[deckIndex];
    if (!card) return;

    button.classList.add('is-picked');
    button.disabled = true;
    button.setAttribute('aria-label', `Chosen: ${card.name}`);
    this.picks.push(deckIndex);

    const position = SPREAD_POSITIONS[this.spreadSize]?.[this.picks.length - 1] ?? '';
    const slot = this.buildSlot(card, position);
    this.slots.push(slot.state);
    this.results.appendChild(slot.el);

    const revealIndex = this.slots.length - 1;
    const id = window.setTimeout(() => this.setRevealed(revealIndex, true), REDUCED_MOTION ? 0 : 150);
    this.timers.push(id);

    this.updateStatus();

    if (this.picks.length >= this.spreadSize) {
      this.pickGrid.classList.add('is-complete');
      const hideId = window.setTimeout(() => {
        this.pickGrid.hidden = true;
      }, REDUCED_MOTION ? 0 : 520);
      this.timers.push(hideId);
    }
  }

  private updateStatus() {
    if (this.picks.length >= this.spreadSize) {
      this.pickStatus.textContent = 'Your reading is complete.';
      return;
    }
    const noun = this.spreadSize === 1 ? 'card' : 'cards';
    this.pickStatus.textContent = `Choose ${this.spreadSize} ${noun} — ${this.picks.length}/${this.spreadSize} chosen`;
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

  private buildSlot(card: SpreadCard, position: string) {
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

    const index = this.slots.length;
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
