// Shared, DOM-based renderer for a completed reading. Used by both the live
// reveal (spread-reveal.ts) and the static history view so the two never drift.
// Input is a serializable draw (see history.ts) — display-ready strings only.

import type { AiReading, DrawCard } from './history';

interface TemplateReadingInput {
  question: string;
  spreadSize: number;
  cards: DrawCard[];
}

// Position → a sentence that sets the reading context for that slot.
const POSITION_CONTEXT: Record<string, string> = {
  'Past':          'In the past, this energy shaped the ground beneath where you now stand.',
  'Present':       'In the present, this force moves actively through your situation.',
  'Future':        'Looking ahead, this quality is what approaches on the horizon.',
  'The Card':      "This card is the oracle's direct answer to your question.",
  'Challenge':     'This is the central force you are being called to meet or transform.',
  'Foundation':    'Beneath everything, this energy forms the hidden root of the matter.',
  'Crown':         'Above you, this card marks your highest aspiration or potential.',
  'Self':          'This reflects how you yourself show up within this situation.',
  'Environment':   'The forces moving around you carry this quality.',
  'Hopes & Fears': 'What you most desire — and perhaps most dread — takes this shape.',
  'Outcome':       'If the current path continues, this is where it leads.',
};

function spreadIntro(size: number): string {
  if (size === 1) return 'One card has come forward to answer your question directly.';
  if (size === 3) return 'Three cards have surfaced — past, present, and future held in a single breath.';
  return 'The ten cards of the Celtic Cross have spread before you, mapping every dimension of your question.';
}

function buildCardReadingSection(card: DrawCard): HTMLElement {
  const section = document.createElement('div');
  section.className = 'rp-card';

  const titleEl = document.createElement('h3');
  titleEl.className = 'rp-card__title';
  titleEl.textContent = card.position && card.pokemonName
    ? `${card.position} · ${card.arcanaName} · ${card.pokemonName}`
    : card.arcanaName;

  const textEl = document.createElement('p');
  textEl.className = 'rp-card__text';
  const posCtx = POSITION_CONTEXT[card.position]
    ?? `This card speaks to the ${card.position.toLowerCase()} dimension of your question.`;
  let prose = posCtx + ' ';
  if (card.description) prose += card.description + ' ';
  if (card.uprightMeaning) prose += card.uprightMeaning;
  textEl.textContent = prose.trim();

  section.append(titleEl, textEl);

  if (card.pokemonName && card.pokemonFlavor) {
    const pokeEl = document.createElement('p');
    pokeEl.className = 'rp-card__pokemon';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'rp-card__pokemon-name';
    nameSpan.textContent = card.pokemonName;

    const flavorEm = document.createElement('em');
    flavorEm.textContent = ` "${card.pokemonFlavor}"`;

    pokeEl.append(nameSpan, flavorEm);
    section.appendChild(pokeEl);
  }

  return section;
}

export function renderTemplateReading(draw: TemplateReadingInput): HTMLElement {
  const panel = document.createElement('div');

  const header = document.createElement('div');
  header.className = 'rp-header';

  const kicker = document.createElement('p');
  kicker.className = 'rp-kicker';
  kicker.textContent = '✦ The Oracle Speaks ✦';

  const questionEl = document.createElement('p');
  questionEl.className = 'rp-question';
  questionEl.textContent = `"${draw.question}"`;

  const intro = document.createElement('p');
  intro.className = 'rp-intro';
  intro.textContent = spreadIntro(draw.spreadSize);

  header.append(kicker, questionEl, intro);
  panel.appendChild(header);

  for (const card of draw.cards) {
    panel.appendChild(buildCardReadingSection(card));
  }

  if (draw.cards.length >= 2) {
    const synthesis = document.createElement('div');
    synthesis.className = 'rp-synthesis';

    const synthLabel = document.createElement('p');
    synthLabel.className = 'rp-synthesis__label';
    synthLabel.textContent = '✦ The Thread Between Them ✦';

    const synthText = document.createElement('p');
    synthText.className = 'rp-synthesis__text';

    const names = draw.cards.map((c) => c.arcanaName).join(', ');
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

export function renderAiReading(ai: AiReading): HTMLElement {
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

  for (const card of ai.cards) {
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
  synthText.textContent = ai.synthesis;

  synthesis.append(synthLabel, synthText);
  panel.appendChild(synthesis);

  const attribution = document.createElement('p');
  attribution.className = 'ai-attribution';
  attribution.textContent = `✦ read by ${ai.provider} ✦`;
  panel.appendChild(attribution);

  return panel;
}
