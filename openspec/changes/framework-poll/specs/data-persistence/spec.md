## ADDED Requirements

### Requirement: Store data in IndexedDB

The system SHALL persist all category and dot data in IndexedDB.

#### Scenario: Data survives page refresh
- **WHEN** a user adds categories and dots
- **WHEN** the user refreshes the browser
- **THEN** all categories and dots MUST remain visible

#### Scenario: Data survives browser close
- **WHEN** a user adds data and closes the browser
- **WHEN** the user reopens the browser and navigates to the application
- **THEN** all previously added data MUST be restored

### Requirement: Database structure

The system SHALL create an IndexedDB database with specific stores and indexes.

#### Scenario: Database name
- **WHEN** the system initializes IndexedDB
- **THEN** the database name MUST be "framework-poll-db"

#### Scenario: Categories store
- **WHEN** the database is created
- **THEN** a store named "categories" MUST exist
- **THEN** an index on "deletedAt" MUST exist
- **THEN** an index on "isDeleted" MUST exist

#### Scenario: Dots store
- **WHEN** the database is created
- **THEN** a store named "dots" MUST exist
- **THEN** an index on "categoryId" MUST exist
- **THEN** an index on "deletedAt" MUST exist
- **THEN** an index on "isDeleted" MUST exist
- **THEN** a compound index on "[categoryId, isDeleted]" MUST exist

### Requirement: Soft delete implementation

The system SHALL implement soft delete by setting deletedAt timestamp.

#### Scenario: Active record has null deletedAt
- **WHEN** a category or dot is created
- **THEN** its deletedAt field MUST be null

#### Scenario: Deleted record has timestamp
- **WHEN** a category or dot is deleted
- **THEN** its deletedAt field MUST be set to ISO string timestamp
- **THEN** the record MUST remain in the database

#### Scenario: Filter deleted records
- **WHEN** displaying categories or dots
- **THEN** the system MUST only show records where deletedAt is null

### Requirement: Timestamp format

The system SHALL store timestamps as ISO 8601 strings.

#### Scenario: createdAt format
- **WHEN** a record is created
- **THEN** createdAt MUST be stored as new Date().toISOString()

#### Scenario: deletedAt format
- **WHEN** a record is deleted
- **THEN** deletedAt MUST be stored as new Date().toISOString()

### Requirement: Category data model

The system SHALL store categories with required fields.

#### Scenario: Category fields
- **WHEN** a category is stored
- **THEN** it MUST have an id field (string)
- **THEN** it MUST have a title field (string)
- **THEN** it MUST have a color field (string, hex format)
- **THEN** it MUST have a sortOrder field (number)
- **THEN** it MUST have a createdAt field (string, ISO format)
- **THEN** it MUST have a deletedAt field (string or null)
- **THEN** it MUST have an isDeleted field (0 or 1)

### Requirement: Dot data model

The system SHALL store dots with required fields including position.

#### Scenario: Dot fields
- **WHEN** a dot is stored
- **THEN** it MUST have an id field (string)
- **THEN** it MUST have a categoryId field (string)
- **THEN** it MUST have a name field (string)
- **THEN** it MUST have a createdAt field (string, ISO format)
- **THEN** it MUST have a deletedAt field (string or null)
- **THEN** it MUST have an isDeleted field (0 or 1)
- **THEN** it MUST have an xRatio field (number, 0 to 1)
- **THEN** it MUST have a yRatio field (number, 0 to 1)

### Requirement: Query optimization

The system SHALL use compound indexes for efficient queries.

#### Scenario: Query category dots
- **WHEN** the system needs to display dots for a category
- **THEN** it MUST use the [categoryId, isDeleted] compound index
- **THEN** it MUST filter for isDeleted equals 0

### Requirement: Cascade delete

The system SHALL cascade soft delete from category to dots.

#### Scenario: Delete category cascades to dots
- **WHEN** a category is soft-deleted
- **THEN** all dots with matching categoryId MUST be soft-deleted
- **THEN** all cascaded dots MUST have the same deletedAt timestamp as the category

### Requirement: Immediate persistence

The system SHALL persist changes immediately to IndexedDB.

#### Scenario: Immediate save on create
- **WHEN** a user creates a category or dot
- **THEN** the system MUST save to IndexedDB before showing success

#### Scenario: Immediate save on update
- **WHEN** a user edits a category
- **THEN** the system MUST save to IndexedDB before updating UI

#### Scenario: Immediate save on delete
- **WHEN** a user deletes a category or dot
- **THEN** the system MUST update deletedAt in IndexedDB before removing from UI
