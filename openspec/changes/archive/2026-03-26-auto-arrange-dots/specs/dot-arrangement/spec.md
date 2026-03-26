## ADDED Requirements

### Requirement: Auto-arrange all dots

The system SHALL allow administrators to auto-arrange all dots across all categories into a grid layout with a single action.

#### Scenario: Trigger auto-arrange

- **WHEN** an administrator clicks the "整齊排列" button in the admin toolbar
- **THEN** the system SHALL rearrange all dots in every category
- **THEN** dots within each category SHALL be sorted by createdAt ascending
- **THEN** dots SHALL be arranged starting from the top-left corner in a grid pattern

#### Scenario: Auto-arrange requires admin mode

- **WHEN** the user is not in admin mode
- **THEN** the system SHALL NOT display the "整齊排列" button

### Requirement: Grid layout with dynamic spacing

The system SHALL arrange dots in a grid that fits within the category container.

#### Scenario: Dots fill available space

- **WHEN** auto-arrange is triggered for a category with N dots
- **THEN** the system SHALL compute the number of columns as `floor(usableWidth / step)`, where `step = DOT_DIAMETER + DOT_GAP` and `usableWidth = containerWidth - 2 * DOT_PADDING`
- **THEN** dots SHALL fill the first row completely before wrapping to the next row
- **THEN** all dot positions SHALL have xRatio and yRatio in [0, 1]

> **Design note**: `containerWidth` and `containerHeight` MUST be measured as the content-box of the dot area element (i.e., `getBoundingClientRect()` minus CSS padding). Although dots are rendered as percentages of the full padding-box, `DOT_PADDING` (6 px) keeps arranged dots visually within the padded region. Passing the full padding-box to `computeGridLayout` would cause arranged dots to extend into the card's CSS padding area.
>
> This means auto-arrange and manual dot placement use different coordinate spaces: manual placement computes xRatio/yRatio against the full padding-box (via `handleAreaClick`), while auto-arrange computes them against the content-box. The resulting ~5% scale difference is accepted as a known trade-off — it is not a bug.

#### Scenario: Container too small to fit all dots

- **WHEN** the container cannot fit all dots at minimum density (DOT_DIAMETER spacing, no gap)
- **THEN** the system SHALL arrange as many dots as possible within the container
- **THEN** dots that cannot fit SHALL remain at their current positions

> **Design note**: Overflow dots MUST be left at their existing positions, not wrapped using modulo arithmetic (`i % capacity`). Wrapping would assign identical coordinates to multiple dots, causing them to visually stack on top of each other. Leaving overflow dots in place is the correct and intentional behavior.

#### Scenario: Single dot arrangement

- **WHEN** a category has exactly one dot
- **THEN** the system SHALL place the dot in the top-left corner of the category area

### Requirement: Persist arrangement to database

The system SHALL persist the new dot positions to IndexedDB after auto-arrange.

#### Scenario: Positions saved atomically

- **WHEN** auto-arrange is triggered
- **THEN** the system SHALL update all dot positions within a single IndexedDB transaction
- **THEN** all positions SHALL be committed atomically (all succeed or all fail)

#### Scenario: Positions visible after reload

- **WHEN** a user reloads the page after auto-arrange
- **THEN** all dots SHALL appear in their arranged positions
