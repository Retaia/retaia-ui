# retaia-ui

Interface web React/TypeScript de review pour le projet Retaia.

## Contexte

Ce repository implémente l'UI de review (liste, détail, décisions, batch move, purge) et consomme le contrat API v1 de Retaia.

Règle centrale:

- `specs/` est normatif (source de vérité).
- `docs/` est local et non normatif.
- En cas de conflit, `specs/` prime.

Références clés:

- `AGENT.md`
- `specs/README.md`
- `specs/change-management/CODE-QUALITY.md`

## Stack

- React 19 + TypeScript + Vite
- Bootstrap 5 + Sass
- i18n: `en` / `fr`
- Tests unitaires/intégration: Vitest + Testing Library
- BDD/E2E: Cucumber + Playwright

## Démarrage rapide

Prérequis:

- Node.js LTS
- npm

Installation et lancement:

```bash
npm ci
npm run dev
```

App locale (par défaut):

- [http://localhost:5173](http://localhost:5173)

## Scripts principaux

Développement:

- `npm run dev`
- `npm run build`
- `npm run preview`

Qualité:

- `npm run lint`
- `npm run typecheck`
- `npm run i18n:check`
- `npm run test`
- `npm run test:coverage`
- `npm run test:a11y`
- `npm run qa`

BDD / E2E / visuel:

- `npm run bdd:test`
- `npm run e2e:bdd`
- `npm run e2e:bdd:ci`
- `npm run e2e:bdd:critical`
- `npm run visual:test`

Contrat API:

- `npm run api:types:generate`
- `npm run api:contract:check`
- `npm run api:contract:freeze`

Release gates:

- `npm run qa:v1:flows`
- `npm run qa:v1:go-no-go`

## Variables d'environnement

Voir `.env.example`.

Variables utilisées côté UI:

- `VITE_API_BASE_URL`
- `VITE_API_TOKEN`
- `VITE_ASSET_SOURCE` (ex: `api` pour forcer la source API)

## Structure utile

- `src/`: application UI
- `src/api/generated/openapi.ts`: types OpenAPI générés
- `api/openapi/v1.yaml`: snapshot OpenAPI local consommateur
- `contracts/openapi-v1.sha256`: hash de freeze OpenAPI
- `docs/`: documentation locale non normative
- `specs/`: submodule des specs normatives
- `bdd/features/`: scénarios BDD
- `tests/visual/`: snapshots visuels

## Règles de contribution

- Pas de modification du submodule `specs/` depuis ce repo.
- Toute évolution de comportement doit d'abord être spécifiée dans `retaia-docs` (`specs/`).
- Commits en Conventional Commits.
- Pas de push direct sur `master`.

Guides locaux:

- `docs/README.md`
- `docs/DEVELOPMENT-BEST-PRACTICES.md`
- `docs/UI-QUALITY-RUNBOOK.md`
- `docs/RELEASE-CHECKLIST.md`

## Commande recommandée avant PR

```bash
npm run qa
npm run typecheck
npm run api:contract:check
npm run e2e:bdd:ci
```
