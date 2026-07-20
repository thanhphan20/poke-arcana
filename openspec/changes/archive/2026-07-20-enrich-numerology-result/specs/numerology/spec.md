## MODIFIED Requirements

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

## ADDED Requirements

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
