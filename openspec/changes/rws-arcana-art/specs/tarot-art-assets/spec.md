## ADDED Requirements

### Requirement: Tarot art URL derivation

The system SHALL provide a `tarotArtUrl(arcana)` helper that derives the public URL of a Rider-Waite-Smith image from arcana identity alone, without any URL string stored in content JSON or per-card records.

The helper SHALL accept either `{ kind: 'major', name: string }` or `{ kind: 'minor', suit: Suit, rankIndex: number }` and MUST return a URL whose path is deterministic and stable for a given arcana identity.

Majors MUST map to `tarot/major/{slug}.jpg`, where `slug` is a kebab-case lowercased form of the arcana name (e.g. `"The Fool"` → `the-fool`, `"Wheel of Fortune"` → `wheel-of-fortune`).

Minors MUST map to `tarot/minor/{suit}/{rank}.jpg`, where `suit` is the lowercase suit identifier (`cups`, `wands`, `swords`, `pentacles`) and `rank` is the lowercase rank name resolved from `rankIndex` via the project's existing `RANK_NAMES` (`ace`, `two`, …, `page`, `knight`, `queen`, `king`).

#### Scenario: Major arcana URL
- **WHEN** `tarotArtUrl({ kind: 'major', name: 'The Fool' })` is called
- **THEN** the returned URL ends with `/tarot/major/the-fool.jpg`

#### Scenario: Minor arcana URL
- **WHEN** `tarotArtUrl({ kind: 'minor', suit: 'cups', rankIndex: 0 })` is called
- **THEN** the returned URL ends with `/tarot/minor/cups/ace.jpg`

#### Scenario: Same identity yields same URL
- **WHEN** `tarotArtUrl` is called twice with the same arcana identity
- **THEN** both calls return the exact same URL string

### Requirement: Single tarot base constant

The system SHALL derive every tarot art URL from a single base constant sourced from build-time environment configuration (`PUBLIC_TAROT_BASE`). Full tarot image URLs MUST NOT be baked into content JSON, per-card records, or the generated Pokemon dataset.

#### Scenario: Repointing the store
- **WHEN** the maintainer changes `PUBLIC_TAROT_BASE` to a different Vercel Blob store's public base URL and rebuilds
- **THEN** every rendered tarot art `<img src>` uses the new base without any data regeneration

### Requirement: Deterministic, non-random Blob pathnames

The maintainer-run upload script SHALL upload each of the 78 Rider-Waite-Smith images to Vercel Blob at the deterministic pathname derived from arcana identity (per the URL derivation requirement), using `addRandomSuffix: false`, so that re-uploading overwrites the existing blob rather than creating a duplicate.

#### Scenario: Re-uploading an image
- **WHEN** the maintainer re-runs the upload script for the same arcana identity with a corrected source file
- **THEN** the blob at the deterministic pathname is overwritten, and the public URL served to users is unchanged

### Requirement: Build stays network-free

`astro build` MUST NOT fetch any tarot art image, upload any blob, or contact Vercel Blob. Uploading tarot art SHALL only occur via the explicit maintainer-run upload script.

#### Scenario: Offline build
- **WHEN** `astro build` is run with no network access after tarot art has been uploaded once
- **THEN** the build completes successfully

### Requirement: Graceful degradation on missing art

Every tarot art `<img>` rendered on the arcana-front card face MUST wire an `onerror` handler that swaps the source to the shared `SPRITE_FALLBACK` placeholder, so a missing, deleted, or CDN-unavailable image degrades to the placeholder rather than a broken image.

#### Scenario: Blob returns 404
- **WHEN** the tarot art URL for a drawn card returns HTTP 404
- **THEN** the `<img>` displays the `SPRITE_FALLBACK` placeholder, and the surrounding card chrome (paper, flourishes, banner with arcana name, footer) remains rendered
