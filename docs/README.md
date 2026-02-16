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

## Architecture UI/DDD

- Source détaillée (structure UI, couches DDD, garde-fous d'import, tests): `docs/UI-ARCHITECTURE.md`
- Bonnes pratiques de développement/PR: `docs/DEVELOPMENT-BEST-PRACTICES.md`

## Commandes BDD/E2E locales

- `npm run bdd:test`
- `npm run bdd:test:real-api`
- `npm run e2e:bdd`
- `npm run e2e:bdd:ci` (CI par defaut sur serveur dev local)
- `APP_URL=http://127.0.0.1:4173 BDD_API_MODE=mock npm run bdd:test` (suite mock)
- `APP_URL=http://127.0.0.1:4173 BDD_API_MODE=real-api npm run bdd:test:real-api` (suite real-api)
- `APP_ENV=test` (ou `VITE_APP_ENV=test`) active une mock DB in-memory dans l'UI.
- CI: definir la variable repo `E2E_TEST_ENV_URL` pour executer les BDD contre un environnement test distant.
