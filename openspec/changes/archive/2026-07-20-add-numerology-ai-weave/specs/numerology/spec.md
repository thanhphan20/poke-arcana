## MODIFIED Requirements

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

## ADDED Requirements

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
