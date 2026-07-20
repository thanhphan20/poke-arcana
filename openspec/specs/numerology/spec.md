# numerology Specification

## Purpose
TBD - created by archiving change add-numerology-feature. Update Purpose after archive.
## Requirements
### Requirement: Life Path Number Calculation
The system SHALL compute a Pythagorean Life Path number from a birth date
(year, month, day) by reducing the month, day, and year to single digits
independently, summing the three reduced values, and reducing that sum,
using digit-sum reduction. At every reduction step, if the running value
equals 11, 22, or 33, the system SHALL treat it as a master number and
SHALL NOT reduce it further.

#### Scenario: A date with no master numbers reduces to a single digit
- **WHEN** the birth date is 1990-06-15 (month 6, day 1+5=6, year
  1+9+9+0=19→1+9=10→1+0=1)
- **THEN** the system sums the reduced components (6 + 6 + 1 = 13 → 1+3),
  producing a final Life Path number of 4

#### Scenario: A day that reduces to a master number is not collapsed further
- **WHEN** the birth day is 29 (2+9 = 11)
- **THEN** the day's reduced value SHALL remain 11, not be further reduced
  to 2, before being summed with the reduced month and year

#### Scenario: The final sum is itself a master number
- **WHEN** the reduced month, day, and year values sum to 22 or 11
- **THEN** the system SHALL return that master number as the final Life
  Path number without reducing it to a single digit

#### Scenario: A date whose components sum to a non-master multi-digit number
- **WHEN** the reduced month, day, and year values sum to a value greater
  than 9 that is not 11, 22, or 33 (e.g. 15)
- **THEN** the system SHALL reduce that sum by digit-sum reduction (1+5=6)
  until it is a single digit or a master number

### Requirement: Birth Date Input Form
The system SHALL provide a birth date input (month, day, year selects)
and a full birth name text input for numerology, and SHALL NOT collect
birth time or birth location on this form. Non-Latin characters in the
name SHALL be transliterated (accented Latin characters reduced to their
base letter; other characters removed) before any number is computed. If
transliteration leaves zero usable A-Z letters across the entire name,
the system SHALL show an inline validation error and SHALL NOT compute
any result.

#### Scenario: User submits a valid birth date and name
- **WHEN** a visitor selects a month, day, and year, enters a name, and
  submits the form
- **THEN** the system computes the Life Path, Expression, Soul Urge, and
  Personality numbers entirely client-side, with no network request, and
  displays the results

#### Scenario: Form omits fields not needed for these calculations
- **WHEN** a visitor views the numerology birth date form
- **THEN** the form SHALL present month, day, year, and name inputs, with
  no hour, minute, or city input present

#### Scenario: A name transliterates to at least one usable letter
- **WHEN** the submitted name contains accented Latin characters (e.g.
  "José") or a mix of Latin and non-Latin characters
- **THEN** the system transliterates accented characters to their base
  Latin letter, drops other non-Latin characters, and proceeds to compute
  all four numbers from the remaining letters

#### Scenario: A name transliterates to zero usable letters
- **WHEN** the submitted name contains no characters that can be
  transliterated to A-Z (e.g. entirely non-Latin script)
- **THEN** the system SHALL display an inline validation error asking for
  a Latin-alphabet spelling and SHALL NOT compute any result

### Requirement: Life Path Interpretation Content
The system SHALL provide static interpretation content for every possible
Life Path result: 1 through 9, and the master numbers 11, 22, and 33. Each
result's content SHALL include a title, keywords, a Strengths angle
(the constructive expression of that number), and a Challenges angle (the
shadow or watch-out-for expression of that number).

#### Scenario: Result display includes both angles
- **WHEN** a Life Path number has been computed for a submitted birth date
- **THEN** the system displays that number's title, keywords, Strengths
  text, and Challenges text alongside the number itself, as two distinctly
  labeled sections

#### Scenario: Every possible Life Path value has content
- **WHEN** the interpretation content is checked against the full set of
  possible Life Path outcomes (1-9, 11, 22, 33)
- **THEN** every one of those 12 values SHALL have both a Strengths and a
  Challenges entry, with none missing

### Requirement: Numerology Page
The system SHALL provide a prerendered page at `/numerology` presenting the
birth date form and the resulting Life Path reading.

#### Scenario: Visiting the numerology page
- **WHEN** a visitor navigates to `/numerology`
- **THEN** the system serves a prerendered page containing the birth date
  form, using the site's shared base layout

### Requirement: Calculation Breakdown Display
The system SHALL display the arithmetic that produced the Life Path
number alongside the result: the reduced month, reduced day, and reduced
year values, their sum, and — when that sum is greater than 9 and is not
itself 11, 22, or 33 — the further-reduced final value.

#### Scenario: Breakdown for a sum that needs no further reduction
- **WHEN** the reduced month, day, and year sum to a value that is already
  a single digit or already a master number (11, 22, or 33)
- **THEN** the system displays only the component values and their sum
  (e.g. "6 + 6 + 1 → 4"), with no separate further-reduction line

#### Scenario: Breakdown for a sum that requires further reduction
- **WHEN** the reduced month, day, and year sum to a multi-digit value
  that is not 11, 22, or 33 (e.g. 18)
- **THEN** the system displays the component sum AND a second line showing
  the further-reduced final number (e.g. "6 + 11 + 1 → 18" followed by
  "→ 9")

#### Scenario: A held master-number component is visible in the breakdown
- **WHEN** the birth day (or month, or year) reduces to a master number
  (11, 22, or 33) rather than a single digit
- **THEN** the breakdown displays that component's value as the master
  number itself (e.g. a day of 29 appears as "11"), not as a further-reduced
  single digit

### Requirement: Expression Number Calculation
The system SHALL compute a Pythagorean Expression (Destiny) number from
the submitted name by summing the letter values (A/J/S=1, B/K/T=2,
C/L/U=3, D/M/V=4, E/N/W=5, F/O/X=6, G/P/Y=7, H/Q/Z=8, I/R=9) of every
letter in each whitespace-separated name part, reducing each part's sum
independently via digit-sum reduction (holding at master numbers 11, 22,
or 33), then summing the reduced parts and reducing that sum the same way.

#### Scenario: A multi-part name reduces to a single digit
- **WHEN** the name parts' letter-sums reduce to values that sum to 9 or
  less, or to a value whose digit-sum reduction is not a master number
- **THEN** the system returns the fully reduced single-digit Expression
  number

#### Scenario: A name part holds at a master number
- **WHEN** a single name part's letter-sum reduces to 11, 22, or 33
- **THEN** that part's value SHALL remain the master number, not be
  reduced further, before being summed with the other parts

### Requirement: Soul Urge Number Calculation
The system SHALL compute a Pythagorean Soul Urge number using the same
per-part reduce-then-sum method as the Expression number, but summing only
the letter values of vowels (A, E, I, O, U) in each name part — Y SHALL
always be treated as a consonant, never a vowel, in this calculation.

#### Scenario: Soul Urge counts only vowels
- **WHEN** a name part contains both vowels and consonants
- **THEN** the system SHALL sum only the A/E/I/O/U letter values in that
  part when computing its contribution to the Soul Urge number

### Requirement: Personality Number Calculation
The system SHALL compute a Pythagorean Personality number using the same
per-part reduce-then-sum method as the Expression number, but summing only
the letter values of consonants (every letter except A, E, I, O, U,
including Y) in each name part.

#### Scenario: Personality counts only consonants
- **WHEN** a name part contains both vowels and consonants
- **THEN** the system SHALL sum only the consonant letter values
  (including Y) in that part when computing its contribution to the
  Personality number

### Requirement: New Number Display
The system SHALL display the Expression, Soul Urge, and Personality
numbers each alongside their archetype title only (no Strengths/
Challenges content for these three numbers), using the same
number-to-archetype-title mapping used for the Life Path number's title.

#### Scenario: New numbers show number and title only
- **WHEN** the Expression, Soul Urge, and Personality numbers have been
  computed
- **THEN** the system displays each number with its archetype title, and
  does not display Strengths or Challenges text for these three numbers

### Requirement: Domain Selector
The system SHALL provide a single-select domain chooser with exactly
three options — Career, Love, and Life Purpose — where selecting a domain
does not itself trigger any network request, and exactly one domain SHALL
be active at a time.

#### Scenario: Selecting a domain updates the active choice
- **WHEN** a visitor selects a domain chip
- **THEN** that domain becomes the sole active selection, replacing any
  previously active domain, and no network request is made

### Requirement: AI Weave Narrative
The system SHALL provide a "Weave My Numbers Together" action that, once
all four numbers are computed and a domain is selected, sends the four
numbers and the selected domain to a server endpoint and displays the
returned synthesized narrative along with which AI provider produced it.
If every configured provider fails, the system SHALL display an error
allowing the visitor to retry rather than showing a broken or empty
result.

#### Scenario: Successful weave narrative
- **WHEN** a visitor selects a domain and presses the weave action after
  all four numbers are computed
- **THEN** the system sends the four numbers and domain to the server,
  and on success displays the synthesized narrative text and the
  provider's name

#### Scenario: All providers fail
- **WHEN** every configured AI provider fails to produce a valid response
- **THEN** the system displays a retry-oriented error message instead of a
  synthesis result, and the weave action remains available to press again

### Requirement: Auto-save completed numerology readings to the browser
The system SHALL persist a completed numerology reading to the visitor's
browser `localStorage` automatically when all four numbers are computed,
without any explicit save action. The saved record SHALL include the
submitted name, the birth date, all four computed numbers (Life Path,
Expression, Soul Urge, Personality), a creation timestamp, and a schema
version.

#### Scenario: Numbers are revealed
- **WHEN** a visitor submits a valid birth date and name and all four
  numbers are computed
- **THEN** the system saves a record of that reading to `localStorage`
  with a unique id and timestamp
- **AND** no button press or confirmation beyond the original submit is
  required

#### Scenario: localStorage unavailable or write fails
- **WHEN** saving throws (quota exceeded, storage disabled, or
  private-mode restriction)
- **THEN** the system catches the error and the result display continues
  uninterrupted
- **AND** no error is surfaced that blocks the reading

### Requirement: Enrich a saved reading with the AI weave narrative
The system SHALL fold an AI weave narrative into the existing saved
record for the current reading when the visitor generates one, rather
than creating a second record for the same reading.

#### Scenario: Weave narrative generated after auto-save
- **WHEN** the visitor selects a domain, presses "Weave My Numbers
  Together", and a synthesis is returned for a reading already saved this
  session
- **THEN** the system updates that same saved record in place with the
  domain, provider, and synthesis text
- **AND** the total number of saved readings does not increase

### Requirement: Rolling retention of the most recent numerology readings
The system SHALL keep at most the 20 most recent numerology readings,
evicting the oldest when a new reading would exceed that limit.

#### Scenario: 21st reading is saved
- **WHEN** a visitor already has 20 saved numerology readings and
  completes another
- **THEN** the system stores the new reading and removes the single
  oldest reading
- **AND** exactly 20 readings remain

### Requirement: Versioned, resilient numerology storage
The system SHALL tag each stored numerology record with a schema version
and SHALL degrade gracefully when reading data it cannot parse or does
not recognize.

#### Scenario: Corrupt or unrecognized stored data
- **WHEN** the stored numerology history is missing, malformed, or
  written by an incompatible version
- **THEN** the system treats numerology history as empty rather than
  throwing
- **AND** the History view renders its empty state for numerology
  readings

### Requirement: Browse saved numerology readings in the History view
The system SHALL list the visitor's saved numerology readings on the
existing History page, most recent first, showing at least the name,
birth date, and Life Path number, and SHALL provide a way to open any
listed reading.

#### Scenario: Visitor with saved numerology readings opens History
- **WHEN** a visitor with one or more saved numerology readings opens the
  History page
- **THEN** the page lists each saved reading newest-first with its name,
  birth date, and Life Path number, alongside the existing draws and star
  chart sections

#### Scenario: Visitor with no saved numerology readings opens History
- **WHEN** a visitor with no saved numerology readings opens the History
  page
- **THEN** the numerology section of the page shows an empty state
  inviting them to try Numerology
- **AND** the page continues to note that history is stored only in this
  browser

### Requirement: Revisit a numerology reading as a static result
The system SHALL render a selected saved numerology reading as a static
result — the name, birth date, all four numbers with their content, and
the calculation breakdown — without requiring re-entry of the form, and
SHALL show the AI weave narrative only when the saved record contains one.

#### Scenario: Opening a saved numerology reading
- **WHEN** a visitor opens a saved numerology reading from the History
  view
- **THEN** the system displays the name, birth date, the four numbers
  with their titles/content, and the calculation breakdown as static
  content
- **AND** the AI weave narrative is shown if and only if it was saved
  with that reading

