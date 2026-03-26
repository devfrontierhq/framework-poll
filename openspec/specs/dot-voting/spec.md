## ADDED Requirements

### Requirement: Add dot by clicking

The system SHALL allow any user to add a dot by clicking anywhere within a category area.

#### Scenario: Click to add dot
- **WHEN** a user clicks anywhere inside a category card
- **THEN** the system displays a dialog to input a dot name
- **WHEN** the user provides a name and confirms
- **THEN** the system creates a dot at the clicked position with the provided name

#### Scenario: Non-admin can add dots
- **WHEN** a non-admin user clicks inside a category
- **THEN** the system SHALL display the add dot dialog
- **THEN** the system SHALL allow the dot to be created

### Requirement: Store dot position

The system SHALL store dot positions as relative coordinates between 0 and 1.

#### Scenario: Calculate relative coordinates
- **WHEN** a user clicks at position (x, y) in a category with dimensions (width, height)
- **THEN** the system MUST calculate xRatio = x / width
- **THEN** the system MUST calculate yRatio = y / height
- **THEN** xRatio and yRatio MUST be between 0 and 1 inclusive

#### Scenario: Render dot from coordinates
- **WHEN** rendering a dot with xRatio and yRatio
- **THEN** the system MUST position the dot at (xRatio * containerWidth, yRatio * containerHeight)

### Requirement: Display dot information

The system SHALL display dot name on hover.

#### Scenario: Show name on hover
- **WHEN** a user hovers over a dot
- **THEN** the system displays the dot's name

### Requirement: Handle dot overlap

The system SHALL visually differentiate overlapping dots.

#### Scenario: Overlapping dots appearance
- **WHEN** multiple dots are positioned close together
- **THEN** each dot MUST have opacity set to 0.8
- **THEN** each dot MUST have a visible border

### Requirement: Delete dot

The system SHALL allow administrators to soft-delete dots after confirming with admin password.

#### Scenario: Delete dot with password
- **WHEN** an administrator clicks on a dot
- **THEN** the system displays a confirmation dialog requesting admin password
- **WHEN** the administrator enters the correct password
- **THEN** the system soft-deletes the dot by setting deletedAt timestamp
- **THEN** the category dot count (if displayed in admin mode) decrements by 1

#### Scenario: Delete with incorrect password
- **WHEN** an administrator enters an incorrect password
- **THEN** the system rejects the deletion
- **THEN** the dot remains visible

#### Scenario: Non-admin cannot delete
- **WHEN** a non-admin user clicks on a dot
- **THEN** the system SHALL NOT display the delete dialog

### Requirement: Update category count

The system SHALL automatically calculate and update category dot counts when dots are added or deleted. The count is only displayed in admin mode.

#### Scenario: Count after adding dot
- **WHEN** a new dot is added to a category
- **THEN** the calculated count for that category MUST increment by 1
- **THEN** the count is displayed in admin mode

#### Scenario: Count after deleting dot
- **WHEN** a dot is deleted from a category
- **THEN** the calculated count for that category MUST decrement by 1
- **THEN** the count is displayed in admin mode

#### Scenario: Count excludes deleted dots
- **WHEN** calculating category dot count
- **THEN** the system MUST only count dots where deletedAt is null

#### Scenario: Count visibility
- **WHEN** admin mode is enabled
- **THEN** the system SHALL display category dot counts
- **WHEN** admin mode is disabled
- **THEN** the system SHALL NOT display category dot counts

### Requirement: No duplicate name validation

The system SHALL NOT validate dot name uniqueness.

#### Scenario: Allow duplicate names
- **WHEN** a user adds a dot with a name that already exists in the category
- **THEN** the system SHALL create the dot without error
- **THEN** both dots with the same name SHALL be visible

### Requirement: Apply category color

The system SHALL render dots with their category's color.

#### Scenario: Dot inherits category color
- **WHEN** a dot is displayed
- **THEN** the dot MUST use the color defined in its parent category
- **WHEN** the category color changes
- **THEN** all dots in that category MUST update to the new color

## Requirements

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

<!-- @trace
source: auto-arrange-dots
updated: 2026-03-26
code:
  - test/store.ts
  - CONTRIBUTING.md
  - CONTRIBUTING.en.md
  - src/components/CategoryCard.tsx
  - src/store/slices/dotSlice.ts
  - .kilocode/skills/spectra-propose/SKILL.md
  - src/store/types.ts
  - .agents/skills/spectra-propose/SKILL.md
  - .kilocode/workflows/spectra-propose.md
  - src/main.tsx
  - src/db/dots.ts
  - src/App.tsx
  - src/components/CategoryGrid.tsx
  - src/utils/arrangeDotsLayout.ts
tests:
  - src/__tests__/App.test.tsx
  - src/utils/__tests__/arrangeDotsLayout.test.ts
  - src/db/__tests__/dots.test.ts
-->