## ADDED Requirements

### Requirement: Batch update dot positions

The system SHALL support updating multiple dot positions in a single atomic database operation.

#### Scenario: Batch update succeeds

- **WHEN** the system receives an array of dot position updates (id, xRatio, yRatio)
- **THEN** the system SHALL validate all coordinates are in [0, 1] before writing
- **THEN** the system SHALL update all valid dots within a single IndexedDB transaction
- **THEN** the system SHALL return the updated dot objects

#### Scenario: Batch update skips deleted dots

- **WHEN** a batch update includes a dot id that has been soft-deleted
- **THEN** the system SHALL skip that dot silently
- **THEN** the system SHALL continue updating remaining valid dots

#### Scenario: Batch update rejects invalid coordinates

- **WHEN** any coordinate in the batch has xRatio or yRatio outside [0, 1]
- **THEN** the system SHALL throw a validation error before opening the database transaction
- **THEN** no dots SHALL be updated

#### Scenario: Empty batch is a no-op

- **WHEN** the system receives an empty array of updates
- **THEN** the system SHALL return an empty array without touching the database
