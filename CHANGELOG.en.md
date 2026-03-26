# Changelog

## [1.1.0] - 2026-03-28

### Added

- Added an admin-only "整齊排列" action to auto-arrange dots across all categories.
- Added grid-based dot arrangement that places dots from top-left to bottom-right in created-time order.
- Added persistent dot arrangement so reordered positions remain visible after reload.

### Changed

- Updated admin tools to expose dot arrangement controls only in admin mode.
- Extended dot voting storage with batch position updates in a single IndexedDB transaction.

## [1.0.0] - 2026-03-19

### Added

- Initial release of Framework Poll.
- Added interactive dot voting with free placement inside each category card.
- Added category management for creating, editing, deleting, and coloring categories.
- Added admin mode with protected management actions.
- Added IndexedDB-based local persistence with soft-delete support.
- Added CSV export for poll data.
