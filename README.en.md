# Framework Poll

[台灣中文](README.md)

A visual polling web app where users vote by clicking on cards to place dots.

## Features

- **Dot voting** — click a category card to place a dot; each user gets a limited number of dots to allocate
- **Visual feedback** — dots render at the exact position clicked within each card
- **Long-press tooltip** — hold on a dot to see who placed it (touch-friendly)
- **Admin mode** — unlock with a secret key to manage categories, reset votes, and initialize data
- **Soft-delete** — removed dots and categories are preserved in the data model, not permanently erased
- **Offline-capable** — all data lives in IndexedDB; no backend required

## Tech Stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Framework  | React 19                                     |
| Language   | TypeScript                                   |
| Build      | Vite 7                                       |
| State      | Zustand                                      |
| Storage    | IndexedDB (via `idb`)                        |
| Styling    | Tailwind CSS v4                              |
| Components | shadcn/ui                                    |
| Compiler   | React Compiler (babel-plugin-react-compiler) |

## Getting Started

```bash
pnpm install
```

Copy the example env file and set your admin secret:

```bash
cp .env.example .env
```

```env
VITE_ADMIN_SECRET=your-secret-here
```

Start the dev server:

```bash
pnpm dev
```

## Usage

**Voting** — click anywhere on a category card to place a dot at that position. Dots are shown relative to where you clicked within the card.

**Admin mode** — press the hidden unlock area (or use the keyboard shortcut) and enter the `VITE_ADMIN_SECRET` value to access admin controls: add/remove categories, clear all votes, or reinitialize sample data.

**Initialize (dev only)** — the admin panel exposes an initialize action that seeds the database with default categories for development and demo purposes.

## Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `pnpm dev`         | Start development server             |
| `pnpm build`       | Type-check and build for production  |
| `pnpm preview`     | Preview the production build locally |
| `pnpm test`        | Run tests once                       |
| `pnpm test:watch`  | Run tests in watch mode              |
| `pnpm test:report` | Generate test report with coverage   |
| `pnpm lint`        | Lint source files                    |
| `pnpm lint:fix`    | Lint and auto-fix                    |
| `pnpm format`      | Format all files with Prettier       |

## Data Model

**Categories** — the voting targets. Each has a `title`, a `color`, a `sortOrder`, and a `deletedAt` timestamp for soft-deletion.

**Dots** — a vote placed on a category. Each dot stores:

- `categoryId` — which category it belongs to
- `xRatio`, `yRatio` — relative coordinates (0–1) within the card, based on where the user clicked
- `name` — identifier for the voter
- `deletedAt` — soft-delete timestamp; deleted dots are excluded from display but kept in storage

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, workflow, and code style.
