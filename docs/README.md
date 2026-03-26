# Docs Locales — retaia-ui

> Statut : non normatif.
> Source de vérité produit : `specs/`.

## Contenu

- `docs/DEVELOPMENT-BEST-PRACTICES.md`
- `docs/TAILADMIN-TECHNIQUE.md`
- `docs/BOOTSTRAP-TECHNIQUE.md` (historique/deprecated)
- `docs/UI-DESIGN-SYSTEM.md`
- `docs/UI-ARCHITECTURE.md`
- `docs/PAGE-CONTROLLER-SECTIONS-STANDARD.md`
- `docs/PAGE-SCAFFOLDING.md`
- `docs/GITHUB-WORKFLOWS.md`
- `docs/DOCKER-DEVELOPMENT.md`
- `docs/USER-QUICKSTART.md`
- `docs/RELEASE-CHECKLIST.md`
- `docs/UI-QUALITY-RUNBOOK.md`
- `docs/UI-ACCESSIBILITY.md`
- `docs/PR-CHECKLIST-UI-STATEFUL-REFACTOR.md`
- `bdd/features/`

## Etat actuel du repo

Le repository est toujours en phase `UI reset`.

- l'ancienne UI a ete retiree
- la nouvelle implementation n'a pas encore commence
- `specs/` decrit la cible
- `docs/` doit distinguer clairement `etat courant` et `etat cible`

## Cadrage produit/UI migre vers `retaia-docs`

Les documents de cadrage UI/UX globaux ne vivent plus dans `retaia-ui`. Ils ont ete centralises dans `retaia-docs`:

- `ui/UI-GLOBAL-SPEC.md`
- `ui/KEYBOARD-SHORTCUTS-REGISTRY.md`
- `ui/UI-UX-BRIEF-DESIGNER.md`
- `ui/UI-REFONTE-RECOMMANDATION.md`
- `ui/UI-WIREFRAMES-TEXTE.md`

Reference GitHub:

- [retaia-docs/ui](https://github.com/Retaia/retaia-docs/tree/master/ui)

## Lecture minimale avant de coder

- `specs/change-management/CODE-QUALITY.md`
- `specs/tests/TEST-PLAN.md`
- `specs/api/API-CONTRACTS.md`
- `specs/policies/I18N-LOCALIZATION.md`
- `specs/policies/AUTHZ-MATRIX.md`
- `specs/state-machine/STATE-MACHINE.md`
- `specs/workflows/WORKFLOWS.md`

## Architecture UI/DDD

- Source détaillée (etat courant + cible structurelle, couches DDD, garde-fous d'import, tests): `docs/UI-ARCHITECTURE.md`
- Conventions UI TailAdmin/Tailwind (pas d'héritage Bootstrap): `docs/TAILADMIN-TECHNIQUE.md`
- Bonnes pratiques de développement/PR: `docs/DEVELOPMENT-BEST-PRACTICES.md`
- Les regles produit/UI globales doivent etre lues dans `specs/ui/*`, pas redefinies localement.

## Commandes BDD/E2E locales

- `npm run bdd:test`
- `npm run bdd:test:real-api`
- `npm run e2e:bdd`
- `npm run e2e:bdd:ci` (CI par defaut sur serveur dev local)
- `APP_URL=http://127.0.0.1:4173 BDD_API_MODE=mock npm run bdd:test` (suite mock)
- `APP_URL=http://127.0.0.1:4173 BDD_API_MODE=real-api npm run bdd:test:real-api` (suite real-api)
- `APP_ENV=test` (ou `VITE_APP_ENV=test`) active une mock DB in-memory dans l'UI.
- CI: definir la variable repo `E2E_TEST_ENV_URL` pour executer les BDD contre un environnement test distant.

Note:

- en phase `UI reset`, ces commandes servent surtout a verifier l'ossature, les placeholders, les contrats et les garde-fous
- elles ne doivent pas etre lues comme une preuve que les parcours produit cibles sont deja implementes
