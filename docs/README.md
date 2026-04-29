# Docs Locales - retaia-ui

> Statut : non normatif.
> Source de verite produit : `specs/`.

## Contenu

- `docs/DEVELOPMENT-BEST-PRACTICES.md`
- `docs/UI-DESIGN-SYSTEM.md`
- `docs/UI-ARCHITECTURE.md`
- `docs/ui-audit.md`
- `docs/PAGE-CONTROLLER-SECTIONS-STANDARD.md`
- `docs/GITHUB-WORKFLOWS.md`
- `docs/DOCKER-DEVELOPMENT.md`
- `docs/UI-QUALITY-RUNBOOK.md`
- `docs/UI-ACCESSIBILITY.md`
- `docs/PR-CHECKLIST-UI-STATEFUL-REFACTOR.md`
- `bdd/features/`

## Etat actuel du repo

Le repository n'est plus en phase `UI reset` pure.

- un shell canonique et plusieurs workspaces sont deja livres
- la refonte reste partielle et plusieurs flows critiques restent a fermer
- `specs/` decrit toujours la cible normative
- `docs/` doit distinguer clairement `etat courant` et `etat cible`

## Prochaines etapes

Les prochaines etapes encore ouvertes sont:

- stabilisation review/apply et conflits optimistic
- densification de `Activity`
- arbitrage du perimetre runtime admin restant
- poursuite de l'elargissement des gates BDD/E2E

Les audits et plans de reference a jour sont:

- `docs/ui-audit.md`
- `docs/UI-ARCHITECTURE.md`
- `docs/ui-gap-analysis.md`
- `docs/ui-implementation-plan.md`
- `docs/ui-information-architecture.md`

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

- Source detaillee (etat courant + cible structurelle, couches DDD, garde-fous d'import, tests): `docs/UI-ARCHITECTURE.md`
- Audit d'ecart et plan d'implementation a jour: `docs/ui-gap-analysis.md`, `docs/ui-implementation-plan.md`
- Conventions UI visuelles et Tailwind: `docs/UI-DESIGN-SYSTEM.md`
- Bonnes pratiques de developpement/PR: `docs/DEVELOPMENT-BEST-PRACTICES.md`
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

- ces commandes verifient le runtime effectivement livre, les contrats et les garde-fous
- elles ne doivent pas etre lues comme une preuve que tous les parcours produit normatifs sont deja completes
