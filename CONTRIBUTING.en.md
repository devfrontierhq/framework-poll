# Contributing

[台灣中文](CONTRIBUTING.md)

## Setup

```bash
pnpm install
```

```bash
cp .env.example .env
```

```env
VITE_ADMIN_SECRET=your-secret-here
```

```bash
pnpm dev
```

Use **pnpm**.

## Development Workflow

This project uses **Spectra** for Spec-Driven Development. Changes go through a lifecycle managed in `openspec/`.

```
discuss? → propose → apply ⇄ ingest → archive
```

| Step      | When to use                                                         |
| --------- | ------------------------------------------------------------------- |
| `discuss` | Optional — structure thinking before proposing                      |
| `propose` | Define the problem, scope, and design                               |
| `apply`   | Implement tasks from the proposal                                   |
| `ingest`  | Requirements changed mid-work? Sync the change, then resume `apply` |
| `archive` | Implementation done and merged                                      |

Completed specs live in `openspec/specs/`, change proposals in `openspec/changes/`.

## Commits

```
<type>(<scope>): <message>
```

Pre-commit hooks run `lint-staged` automatically (ESLint + Prettier). Fix any issues before committing.

## Code Style

- **TypeScript strict mode** — required; use `type` imports (`import type { Foo }`)
- **React Compiler is enabled** — do not add `useCallback` manually
- Prettier config: `printWidth: 120`, single quotes, no semicolons

## Testing

- Framework: Vitest + Testing Library (happy-dom environment)
- Tests live alongside source in `__tests__/` subdirectories
- Shared test utilities in `test/builders.ts` and `test/store.ts`

## Project Structure

```
src/
  components/   # UI components
  hooks/        # Custom React hooks
  db/           # IndexedDB operations
  store/        # Zustand state
  types/        # TypeScript types
  utils/        # Helper functions

openspec/       # Spec-Driven Development artifacts
```
