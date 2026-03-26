## MODIFIED Requirements

### Requirement: Admin mode UI state

The system SHALL maintain admin mode as a UI state, not a separate page.

#### Scenario: Admin mode shows controls

- **WHEN** admin mode is enabled
- **THEN** the system displays the "Add Category" button
- **THEN** the system displays edit controls on category cards
- **THEN** the system displays delete controls on categories
- **THEN** the system displays the "排列整齊" (auto-arrange) button in the admin toolbar

#### Scenario: Lock admin mode

- **WHEN** an administrator clicks the lock button
- **THEN** the system disables admin mode
- **THEN** the system hides all admin controls
