## ADDED Requirements

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
The system SHALL provide a date-only birth date input (month, day, year
selects) for numerology, and SHALL NOT collect a name, birth time, or
birth location on this form.

#### Scenario: User submits a valid birth date
- **WHEN** a visitor selects a month, day, and year and submits the form
- **THEN** the system computes the Life Path number entirely client-side,
  with no network request, and displays the result

#### Scenario: Form omits fields not needed for Life Path
- **WHEN** a visitor views the numerology birth date form
- **THEN** the form SHALL present only month, day, and year inputs, with
  no name, hour, minute, or city input present

### Requirement: Life Path Interpretation Content
The system SHALL provide static interpretation content (a title, keywords,
and a description) for every possible Life Path result: 1 through 9, and
the master numbers 11, 22, and 33.

#### Scenario: Result display includes interpretation content
- **WHEN** a Life Path number has been computed for a submitted birth date
- **THEN** the system displays that number's title, keywords, and
  description alongside the number itself

#### Scenario: Every possible Life Path value has content
- **WHEN** the interpretation content is checked against the full set of
  possible Life Path outcomes (1-9, 11, 22, 33)
- **THEN** every one of those 12 values SHALL have corresponding
  interpretation content, with none missing

### Requirement: Numerology Page
The system SHALL provide a prerendered page at `/numerology` presenting the
birth date form and the resulting Life Path reading.

#### Scenario: Visiting the numerology page
- **WHEN** a visitor navigates to `/numerology`
- **THEN** the system serves a prerendered page containing the birth date
  form, using the site's shared base layout
