# Runbook Qualité UI (React + TS)

## Objectif

Garantir des PR petites, testées, et mergeables sur `master` avec un niveau de qualité constant.

## Flux standard par feature

1. Mettre à jour la base:
   - `git checkout master`
   - `git pull --ff-only origin master`
2. Créer une branche dédiée:
   - `git checkout -b codex/<feature>`
3. Pousser immédiatement la branche:
   - `git push -u origin codex/<feature>`
4. Ouvrir la PR dès le premier push:
   - `gh pr create --base master --title "feat(...): ..." --body "..."`

## Commits atomiques

- 1 commit = 1 intention claire (ex: UI, test, doc).
- Message Conventional Commits obligatoire (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
- Interdit: commit direct sur `master`.

## Gates qualité locales (avant push)

- `npm run qa`
- `npm run typecheck`
- `npm run api:contract:check`
- `npm run bdd:mock:contract:check`
- `npm run api:governance:check` (utile en CI PR; skip en local hors contexte PR)
- `npm run e2e:bdd:ci` pour les changements de comportement utilisateur.
- `npm run visual:test` pour les changements UI visibles.

## Gate go/no-go v1 (pré-release)

- Commande unique:
  - `npm run qa:v1:go-no-go`
- Exécute dans l'ordre:
  - `npm run qa`
  - `npm run qa:v1:flows`
  - `npm run e2e:bdd:critical:ci`
  - `npm run visual:test`

## Durcissement TypeScript

- `strict` actif + `noUncheckedIndexedAccess` + `noImplicitReturns` + `useUnknownInCatchVariables`.
- ESLint bloque `@typescript-eslint/no-explicit-any`.
- En cas d'acces indexe (`array[index]`), verifier explicitement `undefined`.

## Contrat API v1

- La source SSOT `specs/api/openapi/v1.yaml` est verrouillee par hash (`contracts/openapi-v1.sha256`).
- Verification locale/CI: `npm run api:contract:check`.
- Si un changement API est volontaire:
  1. Mettre a jour la source normative `specs/api/openapi/v1.yaml` (dans `retaia-docs`).
  2. `npm run api:contract:freeze` (refresh hash depuis `specs/api/openapi/v1.yaml`).
  3. `npm run api:types:generate`
  4. commit de `contracts/openapi-v1.sha256` et `src/api/generated/openapi.ts`.

### Gouvernance PR OpenAPI (obligatoire)

Toute PR qui modifie la source OpenAPI (`specs/api/openapi/v1.yaml` via mise a jour du submodule `specs`) doit expliciter:

- impact sur `server_policy.feature_flags` et/ou capabilities (si applicable)
- comportement client en mode feature OFF/ON (safe-by-default)
- plan d'adoption/migration consommateurs (UI/core/agents/MCP) + refresh snapshot
- strategie de non-regression sur les comportements `v1` existants
- et respecter les sections PR imposees par le gate CI (`api:governance:check`).

## Couverture

- Seuil minimal global: `80%`.
- Toute PR doit maintenir le seuil et augmenter la couverture des zones modifiées.

## Performance v1

- Budgets versionnes dans `contracts/perf-budget.json`.
- Verification locale: `npm run perf:ci`.
- Le CI bloque si le bundle JS/CSS depasse le budget brut ou gzip.

## BDD et rapports

- Exécution CI-friendly avec rapports:
  - `BDD_API_MODE=mock npm run bdd:test:ci`
  - `BDD_API_MODE=real-api npm run bdd:test:real-api:ci` (suite smoke contre API réelle)
  - `npm run bdd:test:critical:ci` (suite smoke `@critical`)
- Artifacts produits:
  - `test-results/bdd-report.json`
  - `test-results/bdd-report.html`
  - `test-results/bdd-real-api-report.json`
  - `test-results/bdd-real-api-report.html`
  - `test-results/bdd-critical-report.json`
  - `test-results/bdd-critical-report.html`

## Gestion des conflits PR

1. `git checkout codex/<feature>`
2. `git fetch origin`
3. `git rebase origin/master`
4. Résoudre les conflits + valider:
   - `npm run qa`
5. Finaliser le rebase:
   - `git rebase --continue`
6. `git push --force-with-lease`

## Definition of Done (PR)

- Branch dédiée `codex/*` basée sur `master`.
- PR ouverte et ciblée `master`.
- CI verte (`lint`, `test`, `e2e-bdd`, `security-audit`, `no-black-magic`).
- Couverture >= 80%.
- Documentation locale mise à jour (`docs/*`) si UX/comportement modifié.
- BDD ajouté/ajusté quand un parcours utilisateur change.
