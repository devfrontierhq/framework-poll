## ADDED Requirements

### Requirement: Export to CSV

The system SHALL allow users to export all data to CSV format.

#### Scenario: Click to export
- **WHEN** a user clicks the export button
- **THEN** the system generates a CSV file
- **THEN** the system downloads the file to the user's device

### Requirement: CSV file format

The system SHALL generate CSV with specific columns and encoding.

#### Scenario: CSV columns
- **WHEN** generating CSV
- **THEN** the file MUST have columns: 版塊名稱, 項目名稱, 建立日期, 刪除日期

#### Scenario: UTF-8 with BOM
- **WHEN** generating CSV
- **THEN** the file MUST be encoded in UTF-8
- **THEN** the file MUST include a BOM (Byte Order Mark)

### Requirement: Include all records

The system SHALL export both active and deleted records.

#### Scenario: Export active records
- **WHEN** exporting data
- **THEN** the CSV MUST include all records where deletedAt is null

#### Scenario: Export deleted records
- **WHEN** exporting data
- **THEN** the CSV MUST include all records where deletedAt is not null

### Requirement: Date formatting

The system SHALL format dates in CSV as "yyyy-MM-dd HH:mm".

#### Scenario: Format createdAt
- **WHEN** exporting a record
- **THEN** the 建立日期 column MUST display createdAt formatted as "yyyy-MM-dd HH:mm"

#### Scenario: Format deletedAt
- **WHEN** exporting a record with deletedAt not null
- **THEN** the 刪除日期 column MUST display deletedAt formatted as "yyyy-MM-dd HH:mm"

#### Scenario: Empty deletedAt for active records
- **WHEN** exporting a record with deletedAt null
- **THEN** the 刪除日期 column MUST be empty

### Requirement: Category name resolution

The system SHALL resolve category names in CSV.

#### Scenario: Include category title
- **WHEN** exporting dots
- **THEN** each row MUST include the category title, not just the categoryId

#### Scenario: Handle deleted category
- **WHEN** exporting a dot whose category is deleted
- **THEN** the 版塊名稱 column MUST still show the category title

### Requirement: Dot name in export

The system SHALL include dot names in CSV.

#### Scenario: Include dot name
- **WHEN** exporting dots
- **THEN** the 項目名稱 column MUST contain the dot's name field

### Requirement: Date formatting library

The system SHALL use date-fns library for date formatting.

#### Scenario: Use date-fns format
- **WHEN** formatting dates for CSV
- **THEN** the system MUST use date-fns format function
- **THEN** the format string MUST be "yyyy-MM-dd HH:mm"

### Requirement: Export all dots

The system SHALL create one CSV row per dot.

#### Scenario: One row per dot
- **WHEN** a category has multiple dots
- **THEN** each dot MUST appear as a separate row in the CSV
- **THEN** each row MUST include the category name

### Requirement: No data loss

The system SHALL export complete data without omissions.

#### Scenario: Export preserves information
- **WHEN** comparing exported CSV to database
- **THEN** every dot in the database MUST have a corresponding CSV row
- **THEN** every CSV row MUST accurately reflect the dot's data
