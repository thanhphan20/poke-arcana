## ADDED Requirements

### Requirement: Auto-save completed draws to the browser

The system SHALL persist a completed spread to the visitor's browser `localStorage` automatically when the spread completes, without any explicit save action. The saved record SHALL include the question, spread size, each drawn card (position, arcana name and kind, and the drawn Pokémon's name/slug/flavor), the template reading content, a creation timestamp, and a schema version.

#### Scenario: Spread completes

- **WHEN** a visitor finishes drawing and revealing every card in a spread
- **THEN** the system saves a record of that draw to `localStorage` with a unique id and timestamp
- **AND** no button press or confirmation is required

#### Scenario: localStorage unavailable or write fails

- **WHEN** saving throws (quota exceeded, storage disabled, or private-mode restriction)
- **THEN** the system catches the error and the reveal experience continues uninterrupted
- **AND** no error is surfaced that blocks the reading

### Requirement: Enrich a saved draw with the AI reading

The system SHALL fold an AI reading into the existing saved record for the current draw when the visitor generates one, rather than creating a second record for the same draw.

#### Scenario: AI reading generated after auto-save

- **WHEN** the visitor clicks "Read My Fortune" and an AI reading renders for a draw already saved this session
- **THEN** the system updates that same saved record in place with the AI reading (per-card interpretations, synthesis, and provider)
- **AND** the total number of saved draws does not increase

### Requirement: Rolling retention of the most recent draws

The system SHALL keep at most the 20 most recent draws, evicting the oldest when a new draw would exceed that limit.

#### Scenario: 21st draw is saved

- **WHEN** a visitor already has 20 saved draws and completes another
- **THEN** the system stores the new draw and removes the single oldest draw
- **AND** exactly 20 draws remain

### Requirement: Versioned, resilient storage

The system SHALL tag each stored record with a schema version and SHALL degrade gracefully when reading data it cannot parse or does not recognize.

#### Scenario: Corrupt or unrecognized stored data

- **WHEN** the stored history is missing, malformed, or written by an incompatible version
- **THEN** the system treats history as empty rather than throwing
- **AND** the History view renders its empty state

### Requirement: Browse saved draws in a History view

The system SHALL provide a History page that lists the visitor's saved draws, most recent first, showing at least the question, date, spread size, and drawn card names, and SHALL provide a way to open any listed draw.

#### Scenario: Visitor with saved draws opens History

- **WHEN** a visitor with one or more saved draws opens the History page
- **THEN** the page lists each saved draw newest-first with its question, date, spread size, and card names

#### Scenario: Visitor with no saved draws opens History

- **WHEN** a visitor with no saved draws opens the History page
- **THEN** the page shows an empty state inviting them to do a reading
- **AND** the page notes that history is stored only in this browser

### Requirement: Revisit a draw as a static result

The system SHALL render a selected saved draw as a static result — the drawn cards and reading content — without replaying the draw or reveal animation, and SHALL show the AI reading only when the saved record contains one.

#### Scenario: Opening a saved draw

- **WHEN** a visitor opens a saved draw from the History view
- **THEN** the system displays the question, drawn cards, and template reading as static content with no animation
- **AND** the AI reading is shown if and only if it was saved with that draw
