## ADDED Requirements

### Requirement: Admin password verification

The system SHALL verify admin password from environment variable.

#### Scenario: Correct password unlocks admin mode
- **WHEN** a user enters the admin password that matches VITE_ADMIN_SECRET
- **THEN** the system SHALL enable admin mode
- **THEN** the system SHALL display admin controls (add category, edit, delete buttons)

#### Scenario: Incorrect password rejected
- **WHEN** a user enters a password that does not match VITE_ADMIN_SECRET
- **THEN** the system SHALL NOT enable admin mode
- **THEN** the system SHALL display an error message

### Requirement: Admin mode UI state

The system SHALL maintain admin mode as a UI state, not a separate page.

#### Scenario: Admin mode shows controls
- **WHEN** admin mode is enabled
- **THEN** the system displays the "Add Category" button
- **THEN** the system displays edit controls on category cards
- **THEN** the system displays delete controls on categories

#### Scenario: Lock admin mode
- **WHEN** an administrator clicks the lock button
- **THEN** the system disables admin mode
- **THEN** the system hides all admin controls

### Requirement: Password storage

The system MUST store the admin password in environment variable VITE_ADMIN_SECRET.

#### Scenario: Password from environment
- **WHEN** the system needs to verify admin password
- **THEN** the system MUST read the password from VITE_ADMIN_SECRET
- **THEN** the system MUST NOT hardcode the password in source code

### Requirement: Edit operations without password

The system SHALL allow edit operations without re-entering password after admin mode is unlocked.

#### Scenario: Edit category without password
- **WHEN** admin mode is enabled
- **WHEN** an administrator edits a category title or color
- **THEN** the system SHALL NOT request password confirmation

#### Scenario: Add category without password
- **WHEN** admin mode is enabled
- **WHEN** an administrator adds a new category
- **THEN** the system SHALL NOT request password confirmation

### Requirement: Delete operations require password

The system SHALL require password confirmation for all delete operations.

#### Scenario: Delete category requires password
- **WHEN** an administrator attempts to delete a category
- **THEN** the system MUST display a confirmation dialog with password input
- **THEN** the system MUST verify the password before executing deletion

#### Scenario: Delete dot requires password
- **WHEN** an administrator attempts to delete a dot
- **THEN** the system MUST display a confirmation dialog with password input
- **THEN** the system MUST verify the password before executing deletion

### Requirement: Non-admin user permissions

The system SHALL restrict certain operations to admin mode only.

#### Scenario: Non-admin can view
- **WHEN** a non-admin user accesses the application
- **THEN** the system SHALL display all categories and dots
- **THEN** the system SHALL display category dot counts

#### Scenario: Non-admin can add dots
- **WHEN** a non-admin user clicks inside a category
- **THEN** the system SHALL allow adding new dots

#### Scenario: Non-admin cannot manage categories
- **WHEN** a non-admin user accesses the application
- **THEN** the system SHALL NOT display add category button
- **THEN** the system SHALL NOT display edit category controls
- **THEN** the system SHALL NOT display delete category controls

#### Scenario: Non-admin cannot delete dots
- **WHEN** a non-admin user clicks on a dot
- **THEN** the system SHALL NOT display the delete dialog
