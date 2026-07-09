/** 22 canonical Rider-Waite-Smith Major Arcana, in order (0..21). */
export const MAJOR_ARCANA = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World',
] as const;

/**
 * Pseudo-legendary Pokémon promoted into the Major Arcana eligible set. Gen
 * 1-3 has only 21 true legendaries/mythicals for 22 Major cards; Dragonite
 * fills the remaining slot so every Major card is populated.
 */
export const PSEUDO_LEGENDARY_IDS: readonly number[] = [149]; // Dragonite

/**
 * Curated, hand-authored 1:1 mapping from a legendary/mythical (or promoted
 * pseudo-legendary) Pokédex ID to a specific Major Arcana card. This is a
 * deliberate exception to the otherwise fully-algorithmic assignment rule —
 * dex-order assignment (rank % 22) was thematically arbitrary and left one
 * Major card unfilled when the legendary population was 21.
 */
export const MAJOR_ARCANA_ASSIGNMENT: Record<number, string> = {
  151: 'The Fool',          // Mew — origin of all Pokémon, boundless potential
  149: 'The Magician',      // Dragonite — mastery of skill, gentle power made manifest
  251: 'The High Priestess', // Celebi — guardian of time, intuition and mystery
  245: 'The Empress',       // Suicune — purity, grace, nurturing aurora spirit
  383: 'The Emperor',       // Groudon — continent-shaping authority and order
  379: 'The Hierophant',    // Registeel — ancient, unyielding institution
  381: 'The Lovers',        // Latios — half of a bonded, devoted twin pair
  243: 'The Chariot',       // Raikou — thunderous, unstoppable forward charge
  244: 'Strength',          // Entei — volcanic courage tempered with restraint
  380: 'The Hermit',        // Latias — shy, elusive, an inward-looking guardian
  385: 'Wheel of Fortune',  // Jirachi — a wish granted once in a thousand years
  377: 'Justice',           // Regirock — ancient sentinel enforcing balance
  378: 'The Hanged Man',    // Regice — frozen, suspended, stillness itself
  382: 'Death',             // Kyogre — primal sea force of destruction and renewal
  250: 'Temperance',        // Ho-Oh — rainbow bird blending fire, light, and color
  150: 'The Devil',         // Mewtwo — created as a weapon, bound by its own shadow
  145: 'The Tower',         // Zapdos — the storm bird struck by its own lightning
  144: 'The Star',          // Articuno — cold, clear, serene hope in the ice
  249: 'The Moon',          // Lugia — deep-sea guardian of dreams and mystery
  146: 'The Sun',           // Moltres — radiant, vital, phoenix-warm fire
  386: 'Judgement',         // Deoxys — fallen from the sky, an alien awakening
  384: 'The World',         // Rayquaza — the sky-spanning journey come full circle
};

/**
 * Look up the Major Arcana card assigned to a legendary/mythical (or
 * promoted pseudo-legendary) Pokédex ID. Throws if the ID has no curated
 * entry — surfaces a widened Pokédex range that needs the map updated.
 */
export function majorArcanaForId(id: number): { majorNumber: number; name: string } {
  const name = MAJOR_ARCANA_ASSIGNMENT[id];
  if (!name) {
    throw new Error(
      `No curated Major Arcana mapping for Pokémon #${id}. Add an entry to MAJOR_ARCANA_ASSIGNMENT in majorArcana.ts.`,
    );
  }
  const majorNumber = MAJOR_ARCANA.indexOf(name as (typeof MAJOR_ARCANA)[number]);
  return { majorNumber, name };
}
