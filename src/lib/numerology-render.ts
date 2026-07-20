// Shared builder + renderer for a saved numerology reading's number/title/
// breakdown content. Used by the static history detail view. The live
// NumerologyForm result is static Astro markup with textContent
// assignments rather than constructed DOM, so it isn't a consumer here —
// both read from the same numerology.ts source-of-truth functions, so the
// two can't drift in content even without sharing DOM-building code.

import {
  getLifePathInfo, getArchetypeTitle, lifePathBreakdown,
} from './arcana/numerology';
import type { NumerologyReadingRecord, NumerologyWeave } from './numerology-history';

const DOMAIN_LABELS: Record<NumerologyWeave['domain'], string> = {
  career: 'Career',
  love: 'Love',
  purpose: 'Life Purpose',
};

function breakdownText(birth: NumerologyReadingRecord['birth']): string {
  const breakdown = lifePathBreakdown(birth.year, birth.month, birth.day);
  const parts = [
    `${breakdown.reducedMonth} + ${breakdown.reducedDay} + ${breakdown.reducedYear}`,
    String(breakdown.componentSum),
  ];
  if (breakdown.sumWasReduced) parts.push(String(breakdown.finalNumber));
  return parts.join(' → ');
}

function extraNumberBlock(label: string, value: number): HTMLElement {
  const block = document.createElement('div');
  block.className = 'numerology-reading__extra-number';

  const labelEl = document.createElement('span');
  labelEl.className = 'numerology-reading__extra-label';
  labelEl.textContent = label;

  const valueEl = document.createElement('span');
  valueEl.className = 'numerology-reading__extra-value';
  valueEl.textContent = String(value);

  const titleEl = document.createElement('span');
  titleEl.className = 'numerology-reading__extra-title';
  titleEl.textContent = getArchetypeTitle(value);

  block.append(labelEl, valueEl, titleEl);
  return block;
}

export function renderNumerologyReading(record: NumerologyReadingRecord): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'numerology-reading';

  const info = getLifePathInfo(record.numbers.lifePath);

  const kicker = document.createElement('p');
  kicker.className = 'numerology-reading__kicker';
  kicker.textContent = 'Life Path Number';

  const number = document.createElement('p');
  number.className = 'numerology-reading__number';
  number.textContent = String(record.numbers.lifePath);

  const title = document.createElement('p');
  title.className = 'numerology-reading__title';
  title.textContent = getArchetypeTitle(record.numbers.lifePath);

  const keywords = document.createElement('p');
  keywords.className = 'numerology-reading__keywords';
  keywords.textContent = info.keywords.join(' · ');

  const breakdown = document.createElement('p');
  breakdown.className = 'numerology-reading__breakdown';
  breakdown.textContent = breakdownText(record.birth);

  const strengthsLabel = document.createElement('h3');
  strengthsLabel.className = 'numerology-reading__angle-label numerology-reading__angle-label--strengths';
  strengthsLabel.textContent = 'Strengths';
  const strengthsText = document.createElement('p');
  strengthsText.className = 'numerology-reading__angle-text';
  strengthsText.textContent = info.strengths;

  const challengesLabel = document.createElement('h3');
  challengesLabel.className = 'numerology-reading__angle-label numerology-reading__angle-label--challenges';
  challengesLabel.textContent = 'Challenges';
  const challengesText = document.createElement('p');
  challengesText.className = 'numerology-reading__angle-text';
  challengesText.textContent = info.challenges;

  const extraNumbers = document.createElement('div');
  extraNumbers.className = 'numerology-reading__extra-numbers';
  extraNumbers.append(
    extraNumberBlock('Expression', record.numbers.expression),
    extraNumberBlock('Soul Urge', record.numbers.soulUrge),
    extraNumberBlock('Personality', record.numbers.personality),
  );

  wrap.append(
    kicker, number, title, keywords, breakdown,
    strengthsLabel, strengthsText, challengesLabel, challengesText,
    extraNumbers,
  );
  return wrap;
}

export function renderNumerologyWeave(weave: NumerologyWeave): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'numerology-reading__weave';

  const label = document.createElement('p');
  label.className = 'numerology-reading__weave-label';
  label.textContent = `✦ Your Numbers, Woven Together — ${DOMAIN_LABELS[weave.domain]} ✦`;

  const text = document.createElement('p');
  text.className = 'numerology-reading__weave-text';
  text.textContent = weave.synthesis;

  const attribution = document.createElement('p');
  attribution.className = 'numerology-reading__weave-attribution';
  attribution.textContent = `✦ read by ${weave.provider} ✦`;

  panel.append(label, text, attribution);
  return panel;
}
