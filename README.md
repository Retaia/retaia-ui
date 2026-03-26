# Retaia UI

React + TypeScript web application for Retaia UI, currently in `UI reset` mode before the new implementation starts.

## Table of Contents

- [Overview](#overview)
- [Product Target](#product-target)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Testing and Quality Gates](#testing-and-quality-gates)
- [API Contract and Specs](#api-contract-and-specs)
- [Contributing](#contributing)
- [Release](#release)
- [Docker](#docker)
- [License](#license)

## Overview

This repository is aligned on specs first, but the product UI is not implemented yet.
The current branch state is an intentional `UI reset` used to prepare the next implementation pass against API v1 contracts and the global UI v1.1 target:

- `specs/` is normative (source of truth)
- `docs/` is local and non-normative
- if there is a conflict, `specs/` wins

Current repo state:

- routes exist for the future application shell
- several pages intentionally render a reset placeholder while the redesign/rebuild has not started
- local docs may describe the target architecture or target UX, not a shipped runtime

## Product Target

The final expected product behavior is defined in `specs/`, especially:

- `specs/ui/UI-GLOBAL-SPEC.md`
- `specs/ui/KEYBOARD-SHORTCUTS-REGISTRY.md`
- `specs/api/API-CONTRACTS.md`
- `specs/workflows/WORKFLOWS.md`
- `specs/tests/TEST-PLAN.md`

Local docs do not redefine this target behavior. They only document current repo state and local implementation conventions.

## Tech Stack

- React 19
- TypeScript (strict)
- Vite
- Tailwind CSS (TailAdmin-aligned patterns)
- Vitest + Testing Library
- Cucumber + Playwright

## Project Structure

- `src/`: application source code
- `src/pages/`: route pages and temporary reset placeholders
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

## Dependency Overrides

This repository currently pins one transitive security fix through `package.json` overrides:

- `flatted` is forced to `^3.4.2` to remediate Dependabot alert `#24`

Maintenance note:

- this override can be removed once the ESLint chain is bumped coherently and the transitive path no longer resolves a vulnerable `flatted` release
- in practice, that means re-checking the full chain `eslint -> file-entry-cache -> flat-cache -> flatted` during the future ESLint upgrade

At this stage, expect reset placeholder pages rather than the final product workflows.

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
- `npm run icons:generate`

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
- `npm run bdd:coverage`
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

During `UI reset`, these commands validate repository quality and contract alignment.
They do not imply that the future feature-complete UI has already been implemented.

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

Implementation note:

- `specs/` defines the target behavior
- the current repository content is still pre-implementation for the new UI pass

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

GitHub Release is tag-driven (workflow: `.github/workflows/release.yml`):

- RC: `vX.Y.Z-rcN` (published as pre-release)
- stable: `vX.Y.Z` (published as stable release)
- Docker image published to GHCR on tag push:
  - `ghcr.io/<org>/retaia-ui:vX.Y.Z-rcN`
  - `ghcr.io/<org>/retaia-ui:vX.Y.Z`
  - `ghcr.io/<org>/retaia-ui:latest` (stable tags only)
- Release assets include:
  - `retaia-ui-<tag>.tar.gz` and `retaia-ui-<tag>.zip`
  - `retaia-ui-<tag>.sbom.cdx.json` (CycloneDX)
  - `SHA256SUMS.txt`
  - Cosign signatures/certificates for archive/zip/SBOM (`*.sig`, `*.pem`)
- Docker publish includes OCI attestations with provenance + SBOM.

Example RC1:

```bash
git checkout master
git pull --ff-only origin master
git tag -a v1.0.0-rc1 -m "UI v1.0.0 RC1"
git push origin v1.0.0-rc1
```

Current v1 gate command:

- `npm run qa:v1:go-no-go`

## Docker

Runtime image uses Caddy (no Nginx).

Build locally:

```bash
docker build -t retaia-ui:local .
```

Run locally:

```bash
docker run --rm -p 8080:80 \
  -e API_BASE_URL=/api/v1 \
  retaia-ui:local
```

Production compose example: `docker-compose.prod.yml`.
Use relative `API_BASE_URL=/api/v1` for browser-safe calls.

Deployment topology and NAS/LAN production profile are normative in specs:

- `specs/architecture/DEPLOYMENT-TOPOLOGY.md`

## License

Licensed under the GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later).
See `LICENSE`.
