## ADDED Requirements

### Requirement: Arcana-front vignette shows real Rider-Waite-Smith art

When a card is drawn from the fan and the arcana-front face is revealed (first tap of the two-tap flow), the central `.arcana-card__vignette` region of that card MUST render an `<img>` whose source is the Rider-Waite-Smith image for that arcana, derived by the tarot art URL helper. The image MUST NOT be a decorative glyph, ray pattern, or horizon element.

#### Scenario: Major arcana reveal
- **WHEN** the user draws a fan card whose arcana is a major (e.g. The Fool) and the flip animation completes
- **THEN** the vignette displays an `<img>` whose `src` resolves to the Rider-Waite-Smith image for that major arcana

#### Scenario: Minor arcana reveal
- **WHEN** the user draws a fan card whose arcana is a minor (e.g. Ace of Cups)
- **THEN** the vignette displays an `<img>` whose `src` resolves to the Rider-Waite-Smith image for that suit and rank

### Requirement: Surrounding card chrome preserved

The change MUST NOT alter the card's paper texture, flourish corners, kicker (roman numeral for majors / suit glyph for minors), banner containing the arcana name, footer, `--accent`/`--wash` theme colors, fonts, layout, flip animation, or timing. Only the inner contents of `.arcana-card__vignette` change from decorative CSS elements to a single tarot art `<img>`.

#### Scenario: Chrome unchanged after tarot art added
- **WHEN** the arcana-front is rendered with the new tarot art
- **THEN** the paper texture, four flourish corners, kicker, banner with arcana name, and footer are all still present with unchanged styling

### Requirement: Two-tap flow preserved

The user interaction to reveal a drawn card SHALL remain exactly two taps on the card face: the first tap flips the card and reveals the arcana front (now showing tarot art), and the second tap flips again to reveal the Pokémon front. Neither tap count nor animation timing changes.

#### Scenario: Two-tap flow unchanged
- **WHEN** the user draws a card and taps the resulting card face
- **THEN** the arcana-front is shown; and **WHEN** the user taps that card face again, **THEN** the Pokémon front is shown

### Requirement: Alt text carries arcana name

The tarot art `<img>` MUST set its `alt` attribute to the arcana name (e.g. `"The Fool"`, `"Ace of Cups"`) so assistive technologies announce a meaningful identity rather than an empty or generic label.

#### Scenario: Screen reader on drawn card
- **WHEN** a screen reader focuses the tarot art `<img>` for a drawn card
- **THEN** it announces the arcana name matching that card

### Requirement: Missing tarot art does not break the reveal

If the tarot art fails to load, the arcana-front reveal MUST still render successfully: the placeholder is shown in the vignette region, and all surrounding chrome (including the arcana name in the banner) remains visible and legible.

#### Scenario: Tarot art fails to load
- **WHEN** the tarot art URL returns an error or is unreachable
- **THEN** the `<img>` swaps to the shared placeholder and the arcana name in the banner is still visible
