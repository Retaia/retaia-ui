# Retaia UI

React + TypeScript web application for media review workflows (asset list/detail, decisioning, batch operations, purge).

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Testing and Quality Gates](#testing-and-quality-gates)
- [API Contract and Specs](#api-contract-and-specs)
- [Contributing](#contributing)
- [Release](#release)
- [License](#license)

## Overview

Retaia UI implements the v1 review experience and follows a spec-first workflow:

- `specs/` is normative (source of truth)
- `docs/` is local and non-normative
- if there is a conflict, `specs/` wins

## Key Features

- Desktop-like review UX (`/review`, `/review/:assetId`)
- Asset decisions: `KEEP`, `REJECT`, `CLEAR`
- Batch execution and reporting
- Purge preview + confirmation flow
- Auth UI (`/auth`): login/logout, recovery, verify email, MFA
- i18n support (`en`, `fr`)
- Contract-aligned BDD/E2E flows (mock + real API mode)

## Tech Stack

- React 19
- TypeScript (strict)
- Vite
- Bootstrap 5 + Sass
- Vitest + Testing Library
- Cucumber + Playwright

## Project Structure

- `src/`: application source code
- `src/pages/`: route pages (`ReviewPage`, `AuthPage`)
- `src/domain/`: domain rules
- `src/application/`: use-cases/orchestration
- `src/infrastructure/`: technical adapters
- `src/api/generated/openapi.ts`: generated API types
- `bdd/features/`: BDD scenarios
- `tests/visual/`: visual regression tests
- `contracts/openapi-v1.sha256`: API contract freeze hash
- `specs/`: normative specifications (git submodule)
- `docs/`: local implementation docs

## Getting Started

### Prerequisites

- Node.js (LTS)
- npm

### Install and Run

```bash
npm ci
npm run dev
```

Default local URL: [http://localhost:5173](http://localhost:5173)

## Environment Variables

See `.env.example`.

Main variables:

- `VITE_API_BASE_URL`
- `VITE_API_TOKEN`
- `VITE_ASSET_SOURCE` (example: `api`)
- `APP_ENV=test` or `VITE_APP_ENV=test` (enables in-memory mock DB)
- `E2E_TEST_ENV_URL` (CI optional variable for real test env)

## Available Scripts

### Development

- `npm run dev`
- `npm run build`
- `npm run preview`

### Quality

- `npm run lint`
- `npm run typecheck`
- `npm run i18n:check`
- `npm run test`
- `npm run test:coverage`
- `npm run test:a11y`
- `npm run qa`

### BDD / E2E / Visual

- `npm run bdd:test`
- `npm run e2e:bdd`
- `npm run e2e:bdd:ci`
- `npm run e2e:bdd:critical:ci`
- `npm run visual:test`

### API Contract

- `npm run api:types:generate`
- `npm run api:contract:check`
- `npm run api:contract:freeze`
- `npm run api:governance:check`
- `npm run bdd:mock:contract:check`

## Testing and Quality Gates

Recommended before opening a PR:

```bash
npm run qa
npm run typecheck
npm run api:contract:check
npm run bdd:mock:contract:check
npm run e2e:bdd:ci
```

For v1 release gate:

```bash
npm run qa:v1:go-no-go
```

## API Contract and Specs

OpenAPI v1 source used by the UI:

- `specs/api/openapi/v1.yaml`

Contract governance:

- API changes must be specified first in `specs/`
- then synced and validated with contract checks

## Contributing

Please read:

- `CONTRIBUTING.md`
- `docs/DEVELOPMENT-BEST-PRACTICES.md`
- `docs/UI-QUALITY-RUNBOOK.md`

Core rules:

- no direct commit on `master`
- use a feature branch prefixed with `codex/`
- follow Conventional Commits
- keep changes spec-aligned

## Release

Release process and checklist:

- `docs/RELEASE-CHECKLIST.md`

Current v1 gate command:

- `npm run qa:v1:go-no-go`

## License

Licensed under the GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later).
See `LICENSE`.
