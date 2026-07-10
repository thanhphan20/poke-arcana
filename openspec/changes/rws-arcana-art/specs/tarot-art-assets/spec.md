## ADDED Requirements

### Requirement: Tarot art URL derivation

The system SHALL provide a `tarotArtUrl(arcana)` helper that derives the local path of a Rider-Waite-Smith image from arcana identity alone, without any URL string stored in content JSON or per-card records.

The helper SHALL accept either `{ kind: 'major', majorNumber: number }` or `{ kind: 'minor', suit: Suit, rankIndex: number }` and MUST return a path that is deterministic and stable for a given arcana identity.

Majors MUST map to `/tarot/m{NN}.webp`, where `{NN}` is `majorNumber` zero-padded to two digits (`0` → `m00.webp`, `21` → `m21.webp`).

Minors MUST map to `/tarot/{suit-letter}{NN}.webp`, where `suit-letter` is `c` (cups), `s` (swords), `w` (wands), or `p` (pentacles), and `{NN}` is `rankIndex + 1` zero-padded to two digits (Ace → `01`, King → `14`).

#### Scenario: Major arcana path
- **WHEN** `tarotArtUrl({ kind: 'major', majorNumber: 0 })` is called
- **THEN** it returns `/tarot/m00.webp`

#### Scenario: Minor arcana path
- **WHEN** `tarotArtUrl({ kind: 'minor', suit: 'cups', rankIndex: 0 })` is called
- **THEN** it returns `/tarot/c01.webp`

#### Scenario: Same identity yields same path
- **WHEN** `tarotArtUrl` is called twice with the same arcana identity
- **THEN** both calls return the exact same string

### Requirement: Filenames stay in lockstep with majorNumber and rank

The filename scheme MUST be derived from the same ordering that defines arcana identity: `majorNumber` is the index into `MAJOR_ARCANA`, and minor rank is the index into `RANKS`. The image download tooling and the runtime helper MUST agree on the suit-letter mapping and index-to-filename rule so that the file requested at runtime always exists on disk.

#### Scenario: Downloaded file matches the requested path
- **WHEN** the download tooling saves the image for a given arcana identity
- **THEN** it writes it to the same `public/tarot/…` filename that `tarotArtUrl` returns for that identity

### Requirement: Art is committed as local static assets

The 78 Rider-Waite-Smith images SHALL be committed under `public/tarot/` and served same-origin. Tarot art MUST NOT depend on an external CDN, a runtime base URL, or an environment variable. No metadata JSON for tarot art is shipped in `public/`.

#### Scenario: Same-origin request
- **WHEN** a card's arcana art is requested at runtime
- **THEN** it is fetched from the site's own origin under `/tarot/…` with no external host or env-var base involved

### Requirement: Reproducible image download

The system SHALL provide a repo-run script that populates `public/tarot/` from a documented public-domain source, saving each file under the derivable name that `tarotArtUrl` expects. Re-running the script MUST skip files already present so it is safe and cheap to re-run.

#### Scenario: Re-running the download
- **WHEN** the download script is run again after `public/tarot/` is already populated
- **THEN** existing files are skipped and the resulting filenames are unchanged

### Requirement: Art is optimized for delivery

The committed tarot art MUST be optimized before release: each image is downscaled to a maximum width sized for its display use (the art never renders above ~340 CSS px) and encoded as WebP. Optimization happens in the download script (public/ files are served as-is and cannot go through `astro:assets`), so the committed files are the optimized artifacts.

#### Scenario: Committed files are optimized WebP
- **WHEN** a committed tarot image is inspected
- **THEN** it is a WebP file no wider than the configured maximum, served with `Content-Type: image/webp`

### Requirement: Build stays network-free

`astro build` MUST NOT fetch any tarot art image or contact any external host for art. Fetching art SHALL only occur via the explicit repo-run download script.

#### Scenario: Offline build
- **WHEN** `astro build` is run with no network access after `public/tarot/` is populated
- **THEN** the build completes successfully and the tarot art is served from the committed files

### Requirement: Graceful degradation on missing art

Every tarot art `<img>` MUST wire an `onerror` handler that swaps the source to the shared `SPRITE_FALLBACK` placeholder, so a missing or unreadable image degrades to the placeholder rather than a broken image.

#### Scenario: Image fails to load
- **WHEN** a tarot art path returns an error or is missing
- **THEN** the `<img>` displays the `SPRITE_FALLBACK` placeholder and the surrounding UI remains intact
