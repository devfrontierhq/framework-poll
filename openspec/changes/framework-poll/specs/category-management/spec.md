## ADDED Requirements

### Requirement: Create category

The system SHALL allow administrators to create new categories with a title and color.

#### Scenario: Successful category creation
- **WHEN** an administrator in admin mode clicks the add category button and provides a title and color
- **THEN** the system creates a new category with the specified title and color
- **THEN** the category appears in the category grid

#### Scenario: Category created without admin mode
- **WHEN** a non-admin user attempts to access the create category function
- **THEN** the system SHALL NOT display the create category button

### Requirement: Edit category

The system SHALL allow administrators to edit category title and color without re-entering admin password.

#### Scenario: Edit category title
- **WHEN** an administrator in admin mode edits a category title
- **THEN** the system updates the category title
- **THEN** the updated title displays in the category card

#### Scenario: Edit category color
- **WHEN** an administrator in admin mode changes a category color using the color picker
- **THEN** the system updates the category color
- **THEN** all dots in that category display with the new color

#### Scenario: Edit requires admin mode
- **WHEN** a non-admin user attempts to edit a category
- **THEN** the system SHALL NOT display the edit controls

### Requirement: Delete category

The system SHALL allow administrators to soft-delete categories after confirming with admin password.

#### Scenario: Delete category with password confirmation
- **WHEN** an administrator clicks delete on a category
- **THEN** the system displays a confirmation dialog requesting admin password
- **WHEN** the administrator enters the correct password
- **THEN** the system soft-deletes the category by setting deletedAt timestamp
- **THEN** the system soft-deletes all dots belonging to that category

#### Scenario: Delete with incorrect password
- **WHEN** an administrator enters an incorrect password in the delete confirmation
- **THEN** the system rejects the deletion
- **THEN** the category remains visible

#### Scenario: Cascade delete dots
- **WHEN** a category is deleted
- **THEN** all dots with matching categoryId MUST be soft-deleted with the same timestamp

### Requirement: Display categories

The system SHALL display all non-deleted categories in a responsive grid layout.

#### Scenario: Desktop layout
- **WHEN** the viewport width is greater than or equal to 1024px
- **THEN** the system displays categories in a 4-column grid

#### Scenario: Tablet layout
- **WHEN** the viewport width is between 768px and 1023px
- **THEN** the system displays categories in a 2-column grid

#### Scenario: Mobile layout
- **WHEN** the viewport width is less than 768px
- **THEN** the system displays categories in a 1-column layout

#### Scenario: Show dot count
- **WHEN** a category is displayed
- **THEN** the system shows the category title and the count of non-deleted dots
- **THEN** the count format MUST be "Title - Count" (e.g., "React - 12")

### Requirement: Store category color

The system SHALL store category colors as hex color codes.

#### Scenario: Color format validation
- **WHEN** a category color is saved
- **THEN** the system MUST store it in hex format (e.g., "#f59e0b")

#### Scenario: Apply color to dots
- **WHEN** dots are rendered for a category
- **THEN** all dots MUST use the category's color value
