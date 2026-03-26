# Docs Locales — retaia-ui

> Statut : non normatif.
> Source de vérité produit : `specs/`.

## Contenu

- `docs/DEVELOPMENT-BEST-PRACTICES.md`
- `docs/IMPLEMENTATION-AUDIT.md`
- `docs/UI-DESIGN-SYSTEM.md`
- `docs/UI-ARCHITECTURE.md`
- `docs/PAGE-CONTROLLER-SECTIONS-STANDARD.md`
- `docs/GITHUB-WORKFLOWS.md`
- `docs/DOCKER-DEVELOPMENT.md`
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

## Prochaine etape

Avant de commencer l'implementation, la prochaine etape attendue est un audit d'ecart entre:

- le code courant du repo
- les contrats et parcours definis dans `specs/`

Objectif de cet audit:

- identifier ce qui peut etre conserve
- identifier ce qui doit etre supprime ou refactoré
- identifier les zones a reimplementer from scratch
- produire un plan de changements technique, page par page et couche par couche

Cet audit ne doit pas redefinir le produit.
Il doit partir de `specs/` comme reference unique et traiter le repo courant comme baseline technique `UI reset`.

## Cadrage produit/UI

Le cadrage produit/UI a lire pour cette implementation est dans `specs/ui/`:

- `specs/ui/UI-GLOBAL-SPEC.md`
- `specs/ui/KEYBOARD-SHORTCUTS-REGISTRY.md`
- `specs/ui/UI-UX-BRIEF-DESIGNER.md`
- `specs/ui/UI-REFONTE-RECOMMANDATION.md`
- `specs/ui/UI-WIREFRAMES-TEXTE.md`

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
- Audit d'ecart code/spec avant implementation: `docs/IMPLEMENTATION-AUDIT.md`
- Conventions UI visuelles et Tailwind: `docs/UI-DESIGN-SYSTEM.md`
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
