import {
  MAJOR_CARD_THEME,
  ROMAN,
  SPREAD_POSITIONS,
  SUIT_CARD_THEME,
  SUIT_META,
} from '../../lib/arcana/meanings';
import { spriteUrl, tarotArtUrl, SPRITE_FALLBACK } from '../../lib/sprites';
import type { Suit } from '../../lib/arcana/types';

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

// Position → a sentence that sets the reading context for that slot.
const POSITION_CONTEXT: Record<string, string> = {
  'Past':          'In the past, this energy shaped the ground beneath where you now stand.',
  'Present':       'In the present, this force moves actively through your situation.',
  'Future':        'Looking ahead, this quality is what approaches on the horizon.',
  'The Card':      'This card is the oracle\'s direct answer to your question.',
  'Challenge':     'This is the central force you are being called to meet or transform.',
  'Foundation':    'Beneath everything, this energy forms the hidden root of the matter.',
  'Crown':         'Above you, this card marks your highest aspiration or potential.',
  'Self':          'This reflects how you yourself show up within this situation.',
  'Environment':   'The forces moving around you carry this quality.',
  'Hopes & Fears': 'What you most desire — and perhaps most dread — takes this shape.',
  'Outcome':       'If the current path continues, this is where it leads.',
};

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

function spreadIntro(size: number): string {
  if (size === 1) return 'One card has come forward to answer your question directly.';
  if (size === 3) return 'Three cards have surfaced — past, present, and future held in a single breath.';
  return 'The ten cards of the Celtic Cross have spread before you, mapping every dimension of your question.';
}

// ─── Card HTML builders ───────────────────────────────────────────────────────

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
  const artUrl = esc(
    isMajor
      ? tarotArtUrl({ kind: 'major', name: card.arcana.name })
      : tarotArtUrl({ kind: 'minor', suit: card.arcana.suit ?? 'cups', rankIndex: card.arcana.rankIndex ?? 0 })
  );

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
        <img class="arcana-card__art" src="${artUrl}" alt="${arcanaName}" loading="lazy" onerror="this.onerror=null;this.src='${SPRITE_FALLBACK}';">
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

// ─── Full reading panel ───────────────────────────────────────────────────────
//
// Renders template-based prose immediately so a reading is never blocked on
// the network. `requestFortune()` below (triggered by the "Read My Fortune"
// button) overwrites this prose in place with a POST /api/reading response.

function buildCardReadingSection(slot: Slot): HTMLElement {
  const { card, position, drawnMember } = slot;
  const meta = card.arcana.metadata;
  const pokeName = drawnMember ? capitalize(drawnMember.name) : '';
  const flavor = drawnMember ? cleanFlavor(drawnMember.flavorText) : '';

  const section = document.createElement('div');
  section.className = 'rp-card';

  // Title: POSITION · ARCANA · POKÉMON
  const titleEl = document.createElement('h3');
  titleEl.className = 'rp-card__title';
  titleEl.textContent = position && pokeName
    ? `${position} · ${card.arcana.name} · ${pokeName}`
    : card.arcana.name;

  // Main prose: position context sentence + card description + upright meaning
  const textEl = document.createElement('p');
  textEl.className = 'rp-card__text';

  const posCtx = POSITION_CONTEXT[position] ?? `This card speaks to the ${position.toLowerCase()} dimension of your question.`;
  let prose = posCtx + ' ';
  if (meta?.description) prose += meta.description + ' ';
  if (meta?.uprightMeaning) prose += meta.uprightMeaning;
  textEl.textContent = prose.trim();

  // Pokémon witness line
  const pokeEl = document.createElement('p');
  pokeEl.className = 'rp-card__pokemon';

  if (pokeName && flavor) {
    const nameSpan = document.createElement('span');
    nameSpan.className = 'rp-card__pokemon-name';
    nameSpan.textContent = pokeName;

    const flavorEm = document.createElement('em');
    flavorEm.textContent = ` "${flavor}"`;

    pokeEl.append(nameSpan, flavorEm);
  }

  section.append(titleEl, textEl);
  if (pokeName && flavor) section.appendChild(pokeEl);
  return section;
}

function buildReadingPanel(question: string, slots: Slot[], spreadSize: number): HTMLElement {
  const panel = document.createElement('div');

  // Header
  const header = document.createElement('div');
  header.className = 'rp-header';

  const kicker = document.createElement('p');
  kicker.className = 'rp-kicker';
  kicker.textContent = '✦ The Oracle Speaks ✦';

  const questionEl = document.createElement('p');
  questionEl.className = 'rp-question';
  questionEl.textContent = `"${question}"`;

  const intro = document.createElement('p');
  intro.className = 'rp-intro';
  intro.textContent = spreadIntro(spreadSize);

  header.append(kicker, questionEl, intro);
  panel.appendChild(header);

  // One section per drawn card
  for (const slot of slots) {
    panel.appendChild(buildCardReadingSection(slot));
  }

  // Synthesis — weaves the cards together
  if (slots.length >= 2) {
    const synthesis = document.createElement('div');
    synthesis.className = 'rp-synthesis';

    const synthLabel = document.createElement('p');
    synthLabel.className = 'rp-synthesis__label';
    synthLabel.textContent = '✦ The Thread Between Them ✦';

    const synthText = document.createElement('p');
    synthText.className = 'rp-synthesis__text';

    const names = slots.map(s => s.card.arcana.name).join(', ');
    synthText.textContent =
      `The cards drawn — ${names} — do not answer in isolation. ` +
      `Notice the movement between them: what shifts in tone, what theme recurs, where the energy turns. ` +
      `That motion — the arc from one card to the next — is the true response the deck has given your question. ` +
      `Let it work on you quietly, beyond the words on the page.`;

    synthesis.append(synthLabel, synthText);
    panel.appendChild(synthesis);
  }

  const note = document.createElement('p');
  note.className = 'rp-ai-note';
  note.textContent = '✦ Quick reading generated from card data ✦';
  panel.appendChild(note);

  return panel;
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
    this.readingPanelEl.replaceChildren(
      buildReadingPanel(this.question, this.slots, this.spreadSize)
    );
    this.readingPanelEl.hidden = false;
    this.fortuneRowEl.hidden = false;
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
    const panel = document.createElement('div');

    const header = document.createElement('div');
    header.className = 'ai-header';

    const kicker = document.createElement('p');
    kicker.className = 'ai-kicker';
    kicker.textContent = '✦ The AI Reading ✦';

    const subtitle = document.createElement('p');
    subtitle.className = 'ai-subtitle';
    subtitle.textContent = 'A deeper interpretation, woven fresh for your question.';

    header.append(kicker, subtitle);
    panel.appendChild(header);

    for (const card of data.cards) {
      const section = document.createElement('div');
      section.className = 'ai-card';

      const title = document.createElement('h3');
      title.className = 'ai-card__title';
      title.textContent = `${card.position} · ${card.arcana} · ${card.pokemon}`;

      const text = document.createElement('p');
      text.className = 'ai-card__text';
      text.textContent = card.interpretation;

      section.append(title, text);
      panel.appendChild(section);
    }

    const synthesis = document.createElement('div');
    synthesis.className = 'ai-synthesis';

    const synthLabel = document.createElement('p');
    synthLabel.className = 'ai-synthesis__label';
    synthLabel.textContent = '✦ The Thread Between Them ✦';

    const synthText = document.createElement('p');
    synthText.className = 'ai-synthesis__text';
    synthText.textContent = data.synthesis;

    synthesis.append(synthLabel, synthText);
    panel.appendChild(synthesis);

    const attribution = document.createElement('p');
    attribution.className = 'ai-attribution';
    attribution.textContent = `✦ read by ${data.provider} ✦`;
    panel.appendChild(attribution);

    this.aiReadingEl.replaceChildren(panel);
    this.aiReadingEl.hidden = false;
    this.fortuneRowEl.hidden = true;
  }

  private updateSlotLabel(slot: Slot) {
    const canTap = slot.revealed && !slot.drawn;
    slot.label.textContent = slot.position + (canTap ? ' · Tap to Reveal' : '');
    slot.label.style.color = slot.revealed ? '#e3cf95' : '#5a5273';
  }

  // ─── Fan ────────────────────────────────────────────────────────────────────

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
        'position:absolute', 'left:50%',
        `bottom:${cfg.bottom}px`, 'width:100px', 'height:180px',
        `transform-origin:50% ${cfg.radius}px`, `transform:${baseTransform}`,
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
