## ADDED Requirements

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
