import {
  MAJOR_CARD_THEME,
  MAJOR_MEANING,
  RANK_MEANING,
  ROMAN,
  SPREAD_POSITIONS,
  SUIT_CARD_THEME,
  SUIT_META,
} from '../../lib/arcana/meanings';
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
  meaning: HTMLElement;
  card: SpreadCard;
  position: string;
  revealed: boolean;
  drawn: boolean;
}

const FAN_TOTAL = 78;
const PER_ROW = 39; // 78 / 2 rows

/** Back → front. Same radius = same arc shape; bottom offset + z-index puts row 1 clearly in front. */
const ROW_CONFIGS = [
  { bottom: 88, radius: 740, arc: 99, zBase: 1  }, // back
  { bottom: 12, radius: 690, arc: 99, zBase: 42 }, // front
] as const;

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FLIP_MS = REDUCED_MOTION ? 0 : 800;

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function numWord(n: number): string {
  if (n === 1) return 'one card';
  if (n === 3) return 'three cards';
  return 'ten cards';
}

function meaningFor(card: SpreadCard): string {
  const arc = card.arcana;
  return arc.kind === 'major'
    ? (MAJOR_MEANING[arc.name] ?? '')
    : (RANK_MEANING[arc.suit ?? 'cups'] ?? '');
}

function cardBackHtml(): string {
  return `<div class="card-back"><div class="card-back__field"><div class="card-back__ring"><span class="card-back__sigil">✦</span></div></div></div>`;
}

function emblemFrontHtml(card: SpreadCard): string {
  const isMajor = card.arcana.kind === 'major';
  const theme = isMajor ? MAJOR_CARD_THEME : SUIT_CARD_THEME[card.arcana.suit ?? 'cups'];
  const kicker = isMajor
    ? (ROMAN[card.arcana.majorNumber ?? 0] ?? '✦')
    : (SUIT_META[card.arcana.suit ?? 'cups']?.glyph ?? '✦');
  const arcanaName = esc(card.arcana.name);
  const centerGlyph = isMajor
    ? (ROMAN[card.arcana.majorNumber ?? 0] ?? '✦')
    : (SUIT_META[card.arcana.suit ?? 'cups']?.glyph ?? '✦');

  return `<div class="arcana-card" style="--accent:${theme.accent}; --wash:${theme.wash};">
    <div class="arcana-card__paper">
      <div class="arcana-card__grain"></div>
      <div class="arcana-card__keyline"></div>
      <span class="arcana-card__flourish" style="top:5px;left:7px">✦</span>
      <span class="arcana-card__flourish" style="top:5px;right:7px">✦</span>
      <span class="arcana-card__flourish" style="bottom:5px;left:7px">✦</span>
      <span class="arcana-card__flourish" style="bottom:5px;right:7px">✦</span>
      <div class="arcana-card__kicker">${esc(kicker)}</div>
      <div class="arcana-card__vignette">
        <div class="arcana-card__rays"></div>
        <div class="arcana-card__horizon"></div>
        <span class="arcana-card__glyph">${esc(centerGlyph)}</span>
      </div>
      <div class="arcana-card__banner">
        <span class="arcana-card__star">✦</span>
        <span class="arcana-card__arcana">${arcanaName}</span>
        <span class="arcana-card__star">✦</span>
      </div>
      <div class="arcana-card__footer">
        <span class="arcana-card__name">${arcanaName}</span>
      </div>
    </div>
  </div>`;
}

function pokemonFrontHtml(card: SpreadCard, member: SpreadMember): string {
  const isMajor = card.arcana.kind === 'major';
  const theme = isMajor ? MAJOR_CARD_THEME : SUIT_CARD_THEME[card.arcana.suit ?? 'cups'];
  const kicker = isMajor
    ? (ROMAN[card.arcana.majorNumber ?? 0] ?? '✦')
    : (SUIT_META[card.arcana.suit ?? 'cups']?.glyph ?? '✦');
  const paddedId = String(member.id).padStart(3, '0');
  const name = esc(member.name);
  const arcanaName = esc(card.arcana.name);
  const slug = esc(member.slug);
  const sprite = esc(spriteUrl(member.id, 'artwork'));

  return `<a class="arcana-card is-link" style="--accent:${theme.accent}; --wash:${theme.wash};" href="/deck/${slug}">
    <div class="arcana-card__paper">
      <div class="arcana-card__grain"></div>
      <div class="arcana-card__keyline"></div>
      <span class="arcana-card__flourish" style="top:5px;left:7px">✦</span>
      <span class="arcana-card__flourish" style="top:5px;right:7px">✦</span>
      <span class="arcana-card__flourish" style="bottom:5px;left:7px">✦</span>
      <span class="arcana-card__flourish" style="bottom:5px;right:7px">✦</span>
      <div class="arcana-card__kicker">${esc(kicker)}</div>
      <div class="arcana-card__vignette">
        <div class="arcana-card__rays"></div>
        <div class="arcana-card__horizon"></div>
        <img class="arcana-card__sprite" src="${sprite}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='${SPRITE_FALLBACK}';">
      </div>
      <div class="arcana-card__banner">
        <span class="arcana-card__star">✦</span>
        <span class="arcana-card__arcana">${arcanaName}</span>
        <span class="arcana-card__star">✦</span>
      </div>
      <div class="arcana-card__footer">
        <span class="arcana-card__name">${name}</span>
        <span class="arcana-card__id">№ ${paddedId}</span>
      </div>
    </div>
  </a>`;
}

class SpreadReveal extends HTMLElement {
  private deck: SpreadCard[] = [];
  private pool: SpreadCard[] = [];
  private spreadSize = 3;
  private slots: Slot[] = [];
  private taken = new Set<number>();
  private timers: number[] = [];

  private instructionEl!: HTMLElement;
  private counterEl!: HTMLElement;
  private slotsEl!: HTMLElement;
  private resetRow!: HTMLElement;
  private fanHintEl!: HTMLElement;
  private fanEl!: HTMLElement;

  connectedCallback() {
    const initial = parseInt(this.dataset.defaultSpread ?? '3', 10);
    if (initial === 1 || initial === 3 || initial === 10) this.spreadSize = initial;

    const dataScript = this.querySelector<HTMLScriptElement>('script[type="application/json"]');
    if (dataScript?.textContent) {
      try { this.deck = JSON.parse(dataScript.textContent) as SpreadCard[]; } catch { this.deck = []; }
    }

    this.instructionEl = this.querySelector('[data-instruction]') as HTMLElement;
    this.counterEl     = this.querySelector('[data-counter]')     as HTMLElement;
    this.slotsEl       = this.querySelector('[data-slots]')       as HTMLElement;
    this.resetRow      = this.querySelector('[data-reset-row]')   as HTMLElement;
    this.fanHintEl     = this.querySelector('[data-fan-hint]')    as HTMLElement;
    this.fanEl         = this.querySelector('[data-fan]')         as HTMLElement;

    this.onDocumentClick = this.onDocumentClick.bind(this);
    document.addEventListener('click', this.onDocumentClick);

    this.shufflePool();
    this.renderFan();
    this.renderSlots();
    this.syncUI();
    this.syncSpreadButtons();
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.onDocumentClick);
    this.clearTimers();
  }

  private onDocumentClick(e: Event) {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const spreadBtn = target.closest<HTMLElement>('[data-spread]');
    if (spreadBtn) {
      const n = parseInt(spreadBtn.dataset.spread ?? '', 10);
      if (n === 1 || n === 3 || n === 10) this.setSpread(n);
      return;
    }

    if (target.closest('[data-reset]')) {
      this.resetReading();
    }
  }

  private clearTimers() {
    for (const id of this.timers) clearTimeout(id);
    this.timers = [];
  }

  private syncSpreadButtons() {
    document.querySelectorAll<HTMLElement>('[data-spread]').forEach((btn) => {
      const n = parseInt(btn.dataset.spread ?? '', 10);
      btn.classList.toggle('is-active', n === this.spreadSize);
    });
  }

  private shufflePool() {
    const eligible = this.deck.filter((c) => c.members.length > 0);
    for (let i = eligible.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
    }
    this.pool = eligible;
  }

  private setSpread(n: number) {
    if (n === this.spreadSize) return;
    this.spreadSize = n;
    this.resetReading();
    this.syncSpreadButtons();
  }

  private resetReading() {
    this.clearTimers();
    this.slots = [];
    this.taken = new Set();
    this.shufflePool();
    this.renderFan();
    this.renderSlots();
    this.syncUI();
  }

  private get pickedCount() { return this.slots.length; }
  private get canPick() { return this.slots.length < this.spreadSize; }
  private get allDrawn() {
    return this.slots.length === this.spreadSize && this.slots.every((s) => s.drawn);
  }

  private syncUI() {
    const picked = this.pickedCount;
    const n = this.spreadSize;

    if (picked < n) {
      this.instructionEl.textContent = `Draw ${numWord(n)} from the deck below.`;
    } else if (this.allDrawn) {
      this.instructionEl.textContent = 'The reading is complete — the cards have spoken.';
    } else {
      this.instructionEl.textContent = 'Tap each card to reveal its Pokémon.';
    }

    this.counterEl.textContent = `Drawn ${picked} / ${n}`;
    this.resetRow.hidden = picked === 0;
    this.fanHintEl.textContent = picked >= n ? '✧ the spread is drawn ✧' : 'Hover to lift · click to draw';
  }

  private updateSlotLabel(slot: Slot) {
    const canTap = slot.revealed && !slot.drawn;
    slot.label.textContent = slot.position + (canTap ? ' · Tap to Reveal' : '');
    slot.label.style.color = slot.revealed ? '#e3cf95' : '#5a5273';
  }

  // ─── Fan ─────────────────────────────────────────────────────────────────

  private renderFan() {
    this.fanEl.replaceChildren();

    for (let i = 0; i < FAN_TOTAL; i++) {
      const row = Math.floor(i / PER_ROW);
      const indexInRow = i % PER_ROW;
      const cfg = ROW_CONFIGS[row];
      const cardsInRow = Math.min(PER_ROW, FAN_TOTAL - row * PER_ROW);

      const t = cardsInRow === 1 ? 0.5 : indexInRow / (cardsInRow - 1);
      const angle = (-cfg.arc / 2 + t * cfg.arc).toFixed(2);
      const baseTransform = `translateX(-50%) rotate(${angle}deg)`;
      const baseZ = cfg.zBase + indexInRow;

      const card = document.createElement('div');
      card.style.cssText = [
        'position:absolute',
        'left:50%',
        `bottom:${cfg.bottom}px`,
        'width:100px',
        'height:180px',
        `transform-origin:50% ${cfg.radius}px`,
        `transform:${baseTransform}`,
        `z-index:${baseZ}`,
        'cursor:pointer',
        'transition:transform .45s cubic-bezier(.2,.7,.2,1), opacity .55s, filter .3s',
      ].join(';');

      card.innerHTML = `
        <div style="width:100%;height:100%;border-radius:7px;background:linear-gradient(160deg,#241c14,#15100a);padding:4px;box-shadow:0 10px 18px -8px rgba(0,0,0,.7),inset 0 0 0 1px rgba(203,168,90,.3);box-sizing:border-box;">
          <div style="height:100%;border-radius:5px;border:1px solid rgba(203,168,90,.28);background-image:radial-gradient(rgba(203,168,90,.16) 1px,transparent 1.4px);background-size:11px 11px;display:flex;align-items:center;justify-content:center;">
            <span style="font-size:13px;color:rgba(203,168,90,.5);">✦</span>
          </div>
        </div>`;

      card.addEventListener('mouseenter', () => {
        if (!this.canPick || this.taken.has(i)) return;
        card.style.transform = `${baseTransform} translateY(-28px)`;
        card.style.filter = 'drop-shadow(0 12px 20px rgba(0,0,0,.65))';
        card.style.zIndex = '400';
      });
      card.addEventListener('mouseleave', () => {
        if (this.taken.has(i)) return;
        card.style.transform = baseTransform;
        card.style.filter = '';
        card.style.zIndex = String(baseZ);
      });
      card.addEventListener('click', () => this.pickFan(i, card, baseTransform));

      this.fanEl.appendChild(card);
    }
  }

  private pickFan(i: number, cardEl: HTMLElement, baseTransform: string) {
    if (!this.canPick || this.taken.has(i)) return;

    this.taken.add(i);
    cardEl.style.cursor = 'default';
    cardEl.style.opacity = '0';
    cardEl.style.transform = `${baseTransform} translateY(-64px)`;
    cardEl.style.zIndex = '0';

    const group = this.pool[this.slots.length];
    if (!group) return;

    const slotIndex = this.slots.length;
    const positions = SPREAD_POSITIONS[this.spreadSize] ?? [];
    const position = positions[slotIndex] ?? '';

    const slot = this.activateSlot(group, position, slotIndex);
    this.slots.push(slot);
    this.syncUI();

    const tid = window.setTimeout(() => {
      slot.revealed = true;
      slot.flip.style.transform = 'rotateY(0deg)';
      this.updateSlotLabel(slot);
      this.syncUI();
    }, 240);
    this.timers.push(tid);
  }

  // ─── Slots ───────────────────────────────────────────────────────────────

  private slotWidth(): string {
    if (this.spreadSize === 10) return '132px';
    if (this.spreadSize === 1) return '240px';
    return '196px';
  }

  private renderSlots() {
    this.slotsEl.replaceChildren();
    const positions = SPREAD_POSITIONS[this.spreadSize] ?? [];
    const w = this.slotWidth();

    for (let i = 0; i < positions.length; i++) {
      const wrapper = document.createElement('div');
      wrapper.dataset.slotIndex = String(i);
      wrapper.style.cssText = `width:${w};text-align:center;`;

      const label = document.createElement('div');
      label.className = 'slot-label';
      label.style.cssText =
        "font-family:'Cinzel',serif;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#5a5273;margin-bottom:10px;";
      label.textContent = positions[i];

      const frame = document.createElement('div');
      frame.style.cssText =
        'position:relative;width:100%;aspect-ratio:63/100;border-radius:12px;border:1px dashed rgba(203,168,90,.28);background:rgba(11,7,20,.4);display:flex;align-items:center;justify-content:center;';
      frame.innerHTML =
        '<span style="width:6px;height:6px;border-radius:50%;background:rgba(203,168,90,.5);"></span>';

      wrapper.append(label, frame);
      this.slotsEl.appendChild(wrapper);
    }
  }

  /** Replace the empty frame at slotIndex with a live flip card, return the Slot. */
  private activateSlot(card: SpreadCard, position: string, index: number): Slot {
    const wrapper = this.slotsEl.querySelector<HTMLElement>(`[data-slot-index="${index}"]`);

    // Always create a fresh set of elements inside the wrapper.
    const label = document.createElement('div');
    label.style.cssText =
      "font-family:'Cinzel',serif;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#5a5273;margin-bottom:10px;";
    label.textContent = position;

    const flip = document.createElement('div');
    flip.style.cssText =
      'position:relative;width:100%;aspect-ratio:63/100;transform-style:preserve-3d;cursor:pointer;transform:rotateY(180deg);' +
      (REDUCED_MOTION ? '' : `transition:transform ${FLIP_MS}ms cubic-bezier(.4,.1,.2,1);`);

    const back = document.createElement('div');
    back.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;transform:rotateY(180deg);';
    back.innerHTML = cardBackHtml();

    const front = document.createElement('div');
    front.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;';
    front.innerHTML = emblemFrontHtml(card);

    flip.append(back, front);
    flip.addEventListener('click', () => this.onCardTap(index));

    const meaning = document.createElement('p');
    meaning.style.cssText =
      "margin:10px auto 0;font-family:'EB Garamond',serif;font-style:italic;font-size:13px;line-height:1.4;color:#8f86ac;max-width:210px;display:none;";
    meaning.textContent = meaningFor(card);

    if (wrapper) {
      wrapper.replaceChildren(label, flip, meaning);
    } else {
      // Fallback: append a new wrapper if the DOM slot is missing.
      const fallback = document.createElement('div');
      fallback.style.cssText = `width:${this.slotWidth()};text-align:center;`;
      fallback.append(label, flip, meaning);
      this.slotsEl.appendChild(fallback);
    }

    return { flip, front, label, meaning, card, position, revealed: false, drawn: false };
  }

  private onCardTap(index: number) {
    const slot = this.slots[index];
    if (!slot || !slot.revealed || slot.drawn) return;
    this.drawPokemon(index);
  }

  private drawPokemon(index: number) {
    const slot = this.slots[index];
    if (!slot || slot.drawn || slot.card.members.length === 0) return;
    const member = slot.card.members[Math.floor(Math.random() * slot.card.members.length)];
    slot.drawn = true;
    this.updateSlotLabel(slot);

    if (REDUCED_MOTION) {
      slot.front.innerHTML = pokemonFrontHtml(slot.card, member);
      slot.meaning.style.display = '';
      this.syncUI();
      return;
    }

    slot.flip.style.transform = 'rotateY(180deg)';
    const tid = window.setTimeout(() => {
      slot.front.innerHTML = pokemonFrontHtml(slot.card, member);
      slot.flip.style.transform = 'rotateY(0deg)';
      slot.meaning.style.display = '';
      this.syncUI();
    }, FLIP_MS);
    this.timers.push(tid);
  }
}

if (!customElements.get('spread-reveal')) {
  customElements.define('spread-reveal', SpreadReveal);
}
