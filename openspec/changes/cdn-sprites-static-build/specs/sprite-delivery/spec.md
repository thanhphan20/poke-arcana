## ADDED Requirements

### Requirement: Sprites served from Vercel Blob storage
The system SHALL reference Pokemon sprite images from a Vercel Blob store, uploaded
once by a maintainer-run script, and SHALL NOT host sprite images in the deployment.
The store's base URL SHALL be defined in exactly one place so it can be updated
without regenerating data.

#### Scenario: A card renders its sprite
- **WHEN** a card with Pokedex id 25 is rendered
- **THEN** its `<img>` src resolves to `${SPRITES_BASE}/sprites/official-artwork/25.png`, where `SPRITES_BASE` is the single Blob store base-URL constant

#### Scenario: No sprite images in the deployment
- **WHEN** the site is built and deployed
- **THEN** the deployed output contains no `public/sprites/` directory and no Pokemon sprite image files

#### Scenario: Updating the store
- **WHEN** a maintainer changes the `SPRITES_BASE` constant to point at a different Blob store
- **THEN** every sprite URL across the site reflects the new store without any change to the generated data files

### Requirement: Sprite URLs derived from Pokedex id
The system SHALL derive both the full-artwork and thumbnail sprite URLs from a
Pokemon's Pokedex id via a single helper (`spriteUrl(id, variant)`), rather than
reading a stored URL string from the generated data.

#### Scenario: Requesting the artwork variant
- **WHEN** `spriteUrl(6, 'artwork')` is called
- **THEN** it returns `${SPRITES_BASE}/sprites/official-artwork/6.png`

#### Scenario: Requesting the thumbnail variant
- **WHEN** `spriteUrl(6, 'thumb')` is called
- **THEN** it returns `${SPRITES_BASE}/sprites/thumbnails/6.png`

### Requirement: One-time maintainer upload to Blob storage
The system SHALL provide a standalone script, independent of `astro build` and of the
PokeAPI sync script, that fetches each sprite image and uploads it to the Vercel Blob
store at a deterministic pathname derived from the Pokemon's id (no random suffix), so
that `spriteUrl(id, variant)` resolves correctly without per-record storage of URLs.

#### Scenario: Running the upload script
- **WHEN** a maintainer runs the upload script against a Vercel Blob store
- **THEN** every Pokemon id in the generated dataset has an `official-artwork` and a `thumbnail` blob uploaded at deterministic paths (`sprites/official-artwork/{id}.png`, `sprites/thumbnails/{id}.png`)

#### Scenario: Re-running the upload script
- **WHEN** the upload script is run again for an id whose blob already exists
- **THEN** the existing blob at that deterministic pathname is overwritten, not duplicated

### Requirement: Local fallback for unavailable sprites
When a sprite image fails to load, the system SHALL display a small locally-hosted
placeholder image instead of a broken-image indicator, using an `onerror` handler on
the `<img>` element. The placeholder SHALL be served from the deployment itself so the
fallback never depends on the Blob store.

#### Scenario: A sprite fails to load
- **WHEN** a card's sprite `<img>` fails to load (404 or store outage)
- **THEN** the image is replaced by the local placeholder asset and no broken-image icon is shown
