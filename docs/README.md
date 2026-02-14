# Docs Locales — retaia-ui

> Statut : non normatif.
> Source de vérité produit : `specs/`.

## Contenu

- `docs/DEVELOPMENT-BEST-PRACTICES.md`
- `docs/BOOTSTRAP-TECHNIQUE.md`
- `docs/UI-DESIGN-SYSTEM.md`
- `docs/UI-ARCHITECTURE.md`
- `docs/GITHUB-WORKFLOWS.md`
- `docs/DOCKER-DEVELOPMENT.md`
- `docs/USER-QUICKSTART.md`
- `docs/RELEASE-CHECKLIST.md`
- `docs/UI-QUALITY-RUNBOOK.md`
- `docs/UI-ACCESSIBILITY.md`
- `bdd/features/`

## Lecture minimale avant de coder

- `specs/change-management/CODE-QUALITY.md`
- `specs/tests/TEST-PLAN.md`
- `specs/api/API-CONTRACTS.md`
- `specs/policies/I18N-LOCALIZATION.md`
- `specs/policies/AUTHZ-MATRIX.md`
- `specs/state-machine/STATE-MACHINE.md`
- `specs/workflows/WORKFLOWS.md`

## Commandes BDD/E2E locales

- `npm run bdd:test`
- `npm run e2e:bdd`
- `npm run e2e:bdd:ci` (CI: build + `vite preview`)
- `APP_URL=http://127.0.0.1:4173 npm run bdd:test` (override URL cible pour Playwright/Cucumber)
