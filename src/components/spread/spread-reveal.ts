import { SPREAD_POSITIONS } from '../../lib/arcana/meanings';
import { arcanaCardPaperHtml, arcanaCardThemeStyle, cardBackHtml } from '../../lib/card-html';
import type { Suit } from '../../lib/arcana/types';
import { saveDraw, updateDraw, type DrawCard } from '../../lib/history';
import { renderAiReading, renderTemplateReading } from '../../lib/reading-render';

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface SpreadMetadata {
  keywords: string[];
  uprightMeaning: string;
  description: string;
}

interface SpreadArcana {
  kind: 'major' | 'minor';
  name: string;
  suit?: Suit;
  majorNumber?: number;
  rankIndex?: number;
  metadata?: SpreadMetadata | null;
}

interface SpreadMember {
  id: number;
  name: string;
  slug: string;
  flavorText: string;
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
  arcanaReading: HTMLElement;
  pokemonReading: HTMLElement;
  drawnMember: SpreadMember | null;
  card: SpreadCard;
  position: string;
  revealed: boolean;
  drawn: boolean;
}

interface ReadingApiCard {
  position: string;
  arcana: string;
  pokemon: string;
  interpretation: string;
}

interface ReadingApiSuccess {
  provider: string;
  cards: ReadingApiCard[];
  synthesis: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const FAN_TOTAL = 78;
const PER_ROW = 39;

const ROW_CONFIGS = [
  { bottom: 88, radius: 740, arc: 99, zBase: 1  },
  { bottom: 12, radius: 690, arc: 99, zBase: 42 },
] as const;

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FLIP_MS = REDUCED_MOTION ? 0 : 800;

// ─── Utilities ───────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function cleanFlavor(text: string): string {
  return text.replace(/­/g, '').replace(/\s+/g, ' ').trim();
}

function numWord(n: number): string {
  if (n === 1) return 'one card';
  if (n === 3) return 'three cards';
  return 'ten cards';
}

// ─── Card HTML builders ───────────────────────────────────────────────────────
//
// Markup lives in src/lib/card-html.ts (shared with TarotCard.astro and
// HomeDraw). These thin wrappers add the per-face `.arcana-card` wrapper.

function emblemFrontHtml(card: SpreadCard): string {
  return `<div class="arcana-card" style="${arcanaCardThemeStyle(card.arcana)}">${arcanaCardPaperHtml({ arcana: card.arcana, face: 'art' })}</div>`;
}

function pokemonFrontHtml(card: SpreadCard, member: SpreadMember): string {
  return `<a class="arcana-card is-link" style="${arcanaCardThemeStyle(card.arcana)}" href="/deck/${esc(member.slug)}">${arcanaCardPaperHtml(
    { arcana: card.arcana, face: 'sprite', pokemon: { id: member.id, name: member.name } },
  )}</a>`;
}

// ─── Per-slot reading panels ──────────────────────────────────────────────────

function buildArcanaReading(card: SpreadCard): HTMLElement {
  const el = document.createElement('div');
  el.className = 'slot-reading';
  el.hidden = true;

  // Show just the upright meaning as a single clean sentence — no keyword dumps.
  const meta = card.arcana.metadata;
  if (meta?.uprightMeaning) {
    const p = document.createElement('p');
    p.className = 'slot-upright';
    p.textContent = meta.uprightMeaning;
    el.appendChild(p);
  }

  return el;
}

function buildPokemonReading(member: SpreadMember): HTMLElement {
  const el = document.createElement('div');
  el.className = 'slot-reading';
  el.hidden = true;

  const divider = document.createElement('div');
  divider.className = 'slot-divider';

  const nameEl = document.createElement('div');
  nameEl.className = 'slot-flavor-name';
  nameEl.textContent = capitalize(member.name);

  const flavor = document.createElement('p');
  flavor.className = 'slot-flavor';
  flavor.textContent = cleanFlavor(member.flavorText);

  el.append(divider, nameEl, flavor);
  return el;
}

// ─── Web component ───────────────────────────────────────────────────────────

class SpreadReveal extends HTMLElement {
  private deck: SpreadCard[] = [];
  private pool: SpreadCard[] = [];
  private spreadSize = 3;
  private slots: Slot[] = [];
  private taken = new Set<number>();
  private timers: number[] = [];
  private question = '';
  private readingShown = false;
  private currentDrawId: string | null = null;

  private instructionEl!: HTMLElement;
  private counterEl!: HTMLElement;
  private slotsEl!: HTMLElement;
  private readingPanelEl!: HTMLElement;
  private resetRow!: HTMLElement;
  private fanHintEl!: HTMLElement;
  private fanEl!: HTMLElement;
  private fortuneRowEl!: HTMLElement;
  private fortuneBtnEl!: HTMLButtonElement;
  private fortuneErrorEl!: HTMLElement;
  private aiReadingEl!: HTMLElement;
  private fortuneRequested = false;

  connectedCallback() {
    const initial = parseInt(this.dataset.defaultSpread ?? '3', 10);
    if (initial === 1 || initial === 3 || initial === 10) this.spreadSize = initial;

    const dataScript = this.querySelector<HTMLScriptElement>('script[type="application/json"]');
    if (dataScript?.textContent) {
      try { this.deck = JSON.parse(dataScript.textContent) as SpreadCard[]; } catch { this.deck = []; }
    }

    this.instructionEl   = this.querySelector('[data-instruction]')    as HTMLElement;
    this.counterEl       = this.querySelector('[data-counter]')        as HTMLElement;
    this.slotsEl         = this.querySelector('[data-slots]')          as HTMLElement;
    this.readingPanelEl  = this.querySelector('[data-reading-panel]')  as HTMLElement;
    this.resetRow        = this.querySelector('[data-reset-row]')      as HTMLElement;
    this.fanHintEl       = this.querySelector('[data-fan-hint]')       as HTMLElement;
    this.fanEl           = this.querySelector('[data-fan]')            as HTMLElement;
    this.fortuneRowEl    = this.querySelector('[data-fortune-row]')    as HTMLElement;
    this.fortuneBtnEl    = this.querySelector('[data-read-fortune]')   as HTMLButtonElement;
    this.fortuneErrorEl  = this.querySelector('[data-fortune-error]')  as HTMLElement;
    this.aiReadingEl     = this.querySelector('[data-ai-reading]')     as HTMLElement;

    this.onDocumentClick   = this.onDocumentClick.bind(this);
    this.onQuestionChange  = this.onQuestionChange.bind(this);

    document.addEventListener('click', this.onDocumentClick);
    window.addEventListener('question-change', this.onQuestionChange);
    this.fortuneBtnEl.addEventListener('click', () => this.requestFortune());

    this.shufflePool();
    this.renderFan();
    this.renderSlots();
    this.syncUI();
    this.syncSpreadButtons();
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.onDocumentClick);
    window.removeEventListener('question-change', this.onQuestionChange);
    this.clearTimers();
  }

  private onQuestionChange(e: Event) {
    this.question = (e as CustomEvent<{ question: string }>).detail?.question ?? '';
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

    if (target.closest('[data-reset]')) this.resetReading();
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
    this.readingShown = false;
    this.fortuneRequested = false;
    this.currentDrawId = null;
    this.readingPanelEl.hidden = true;
    this.readingPanelEl.replaceChildren();
    this.fortuneRowEl.hidden = true;
    this.fortuneBtnEl.disabled = false;
    this.fortuneBtnEl.textContent = 'Read My Fortune';
    this.fortuneErrorEl.hidden = true;
    this.aiReadingEl.hidden = true;
    this.aiReadingEl.replaceChildren();
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

    // Show reading panel once all Pokémon are revealed
    if (this.allDrawn && !this.readingShown) {
      this.readingShown = true;
      this.showReadingPanel();
    }
  }

  private showReadingPanel() {
    const cards = this.serializeDrawCards();
    this.readingPanelEl.replaceChildren(
      renderTemplateReading({ question: this.question, spreadSize: this.spreadSize, cards })
    );
    this.readingPanelEl.hidden = false;
    this.fortuneRowEl.hidden = false;

    // Auto-save the completed draw to this browser (no button, nothing to manage).
    this.currentDrawId = saveDraw({
      question: this.question,
      spreadSize: this.spreadSize,
      cards,
      ai: null,
    });
  }

  // Serializable, display-ready snapshot of the drawn cards for storage + rendering.
  private serializeDrawCards(): DrawCard[] {
    return this.slots.map((slot) => {
      const meta = slot.card.arcana.metadata;
      return {
        position: slot.position,
        arcanaName: slot.card.arcana.name,
        pokemonName: slot.drawnMember ? capitalize(slot.drawnMember.name) : '',
        pokemonSlug: slot.drawnMember?.slug ?? '',
        pokemonFlavor: slot.drawnMember ? cleanFlavor(slot.drawnMember.flavorText) : '',
        description: meta?.description ?? '',
        uprightMeaning: meta?.uprightMeaning ?? '',
      };
    });
  }

  private async requestFortune() {
    if (this.fortuneRequested) return;
    this.fortuneRequested = true;
    this.fortuneBtnEl.disabled = true;
    this.fortuneBtnEl.textContent = 'The oracle is listening…';
    this.fortuneErrorEl.hidden = true;

    const spread = this.slots.map((slot) => ({
      position: slot.position,
      arcana: { kind: slot.card.arcana.kind, name: slot.card.arcana.name },
      pokemon: {
        name: slot.drawnMember ? capitalize(slot.drawnMember.name) : '',
        flavor: slot.drawnMember ? cleanFlavor(slot.drawnMember.flavorText) : '',
      },
    }));

    try {
      const res = await fetch('/api/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: this.question, spread }),
      });

      if (!res.ok) {
        this.showFortuneError();
        return;
      }

      const data = (await res.json()) as ReadingApiSuccess;
      this.renderFortune(data);
    } catch {
      this.showFortuneError();
    }
  }

  private showFortuneError() {
    this.fortuneRequested = false;
    this.fortuneBtnEl.disabled = false;
    this.fortuneBtnEl.textContent = 'Read My Fortune';
    this.fortuneErrorEl.textContent = 'The oracle is quiet — try again in a moment.';
    this.fortuneErrorEl.hidden = false;
  }

  private renderFortune(data: ReadingApiSuccess) {
    const ai = { provider: data.provider, cards: data.cards, synthesis: data.synthesis };
    this.aiReadingEl.replaceChildren(renderAiReading(ai));
    this.aiReadingEl.hidden = false;
    this.fortuneRowEl.hidden = true;

    // Fold the AI reading into this draw's saved record (same record, no duplicate).
    if (this.currentDrawId) updateDraw(this.currentDrawId, { ai });
  }

  private updateSlotLabel(slot: Slot) {
    const canTap = slot.revealed && !slot.drawn;
    slot.label.textContent = slot.position + (canTap ? ' · Tap to Reveal' : '');
    slot.label.style.color = slot.revealed ? '#e3cf95' : '#5a5273';
  }

  // ─── Fan ────────────────────────────────────────────────────────────────────

  // Fan geometry (radius/spread/card size) was tuned for a ~1150px-wide container;
  // scale it down proportionally so the arc's horizontal reach never exceeds the
  // fan's actual width on narrow viewports.
  // The spread section starts `hidden` until a question is picked, so clientWidth
  // reads 0 the first time this runs; fall back to the viewport minus the page's
  // side padding rather than the full window width, or the fan overflows its box.
  private containerWidthFallback(): number {
    return window.innerWidth - 64;
  }

  private fanScale(): number {
    const width = this.fanEl.clientWidth || this.containerWidthFallback();
    // 0.9 safety factor: linear width/radius scaling still slightly underestimates
    // reach (card half-width + rotation add extra), so shave a margin off every size.
    return Math.max(0.25, Math.min(1, width / 1150) * 0.9);
  }

  private renderFan() {
    this.fanEl.replaceChildren();
    const scale = this.fanScale();

    for (let i = 0; i < FAN_TOTAL; i++) {
      const row = Math.floor(i / PER_ROW);
      const indexInRow = i % PER_ROW;
      const cfg = ROW_CONFIGS[row];
      const cardsInRow = Math.min(PER_ROW, FAN_TOTAL - row * PER_ROW);

      const t = cardsInRow === 1 ? 0.5 : indexInRow / (cardsInRow - 1);
      const angle = (-cfg.arc / 2 + t * cfg.arc).toFixed(2);
      const baseTransform = `translateX(-50%) rotate(${angle}deg)`;
      const baseZ = cfg.zBase + indexInRow;
      const bottom = cfg.bottom * scale;
      const radius = cfg.radius * scale;
      const width = 100 * scale;
      const height = 180 * scale;
      const lift = 28 * scale;
      const pickLift = 64 * scale;

      const card = document.createElement('div');
      card.style.cssText = [
        'position:absolute', 'left:50%',
        `bottom:${bottom}px`, `width:${width}px`, `height:${height}px`,
        `transform-origin:50% ${radius}px`, `transform:${baseTransform}`,
        `z-index:${baseZ}`, 'cursor:pointer',
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
        card.style.transform = `${baseTransform} translateY(-${lift}px)`;
        card.style.filter = 'drop-shadow(0 12px 20px rgba(0,0,0,.65))';
        card.style.zIndex = '400';
      });
      card.addEventListener('mouseleave', () => {
        if (this.taken.has(i)) return;
        card.style.transform = baseTransform;
        card.style.filter = '';
        card.style.zIndex = String(baseZ);
      });
      card.addEventListener('click', () => this.pickFan(i, card, baseTransform, pickLift));
      this.fanEl.appendChild(card);
    }
  }

  private pickFan(i: number, cardEl: HTMLElement, baseTransform: string, pickLift: number) {
    if (!this.canPick || this.taken.has(i)) return;

    this.taken.add(i);
    cardEl.style.cursor = 'default';
    cardEl.style.opacity = '0';
    cardEl.style.transform = `${baseTransform} translateY(-${pickLift}px)`;
    cardEl.style.zIndex = '0';

    const group = this.pool[this.slots.length];
    if (!group) return;

    const slotIndex = this.slots.length;
    const positions = SPREAD_POSITIONS[this.spreadSize] ?? [];
    const position = positions[slotIndex] ?? '';

    const slot = this.activateSlot(group, position, slotIndex);
    this.slots.push(slot);
    this.syncUI();

    // After emblem flips up: show arcana reading (phase 1)
    const tid = window.setTimeout(() => {
      slot.revealed = true;
      slot.flip.style.transform = 'rotateY(0deg)';
      slot.arcanaReading.hidden = false;
      this.updateSlotLabel(slot);
      this.syncUI();
    }, 240);
    this.timers.push(tid);
  }

  // ─── Slots ──────────────────────────────────────────────────────────────────

  private slotWidth(): string {
    const containerWidth = this.slotsEl.clientWidth || this.containerWidthFallback();
    if (this.spreadSize === 10) return '132px';
    if (this.spreadSize === 1) return `${Math.min(240, containerWidth)}px`;

    // 3-card spread: always keep a single row, shrinking to fit narrow viewports
    // rather than letting flex-wrap stack the cards into 3 rows.
    const gap = parseFloat(getComputedStyle(this.slotsEl).columnGap) || 24;
    const fit = (containerWidth - gap * 2) / 3;
    return `${Math.min(196, Math.max(88, fit))}px`;
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

  private activateSlot(card: SpreadCard, position: string, index: number): Slot {
    const wrapper = this.slotsEl.querySelector<HTMLElement>(`[data-slot-index="${index}"]`);

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

    const arcanaReading = buildArcanaReading(card);
    const pokemonReading = document.createElement('div');
    pokemonReading.className = 'slot-reading';
    pokemonReading.hidden = true;

    if (wrapper) {
      wrapper.replaceChildren(label, flip, arcanaReading, pokemonReading);
    } else {
      const fallback = document.createElement('div');
      fallback.style.cssText = `width:${this.slotWidth()};text-align:center;`;
      fallback.append(label, flip, arcanaReading, pokemonReading);
      this.slotsEl.appendChild(fallback);
    }

    return {
      flip, front, label,
      arcanaReading, pokemonReading,
      drawnMember: null,
      card, position,
      revealed: false, drawn: false,
    };
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
    slot.drawnMember = member;
    this.updateSlotLabel(slot);

    // Build pokemon reading panel, hide until after flip
    const pokemonPanel = buildPokemonReading(member);
    slot.pokemonReading.replaceChildren(...Array.from(pokemonPanel.childNodes));
    slot.pokemonReading.hidden = true;

    if (REDUCED_MOTION) {
      slot.front.innerHTML = pokemonFrontHtml(slot.card, member);
      slot.pokemonReading.hidden = false;
      this.syncUI();
      return;
    }

    // Flip back → swap content → flip forward → show pokemon reading (phase 2)
    slot.flip.style.transform = 'rotateY(180deg)';
    const tid = window.setTimeout(() => {
      slot.front.innerHTML = pokemonFrontHtml(slot.card, member);
      slot.flip.style.transform = 'rotateY(0deg)';
      const tid2 = window.setTimeout(() => {
        slot.pokemonReading.hidden = false;
        this.syncUI();
      }, FLIP_MS);
      this.timers.push(tid2);
    }, FLIP_MS);
    this.timers.push(tid);
  }
}

if (!customElements.get('spread-reveal')) {
  customElements.define('spread-reveal', SpreadReveal);
}
