# Runbook Qualité UI (React + TS)

## Objectif

Garantir des PR petites, testées, et mergeables sur `master` avec un niveau de qualité constant.

## Flux standard par feature

1. Mettre à jour la base:
   - `git checkout master`
   - `git pull --ff-only origin master`
2. Créer une branche dédiée:
   - `git checkout -b codex/<feature>-master`
3. Pousser immédiatement la branche:
   - `git push -u origin codex/<feature>-master`
4. Ouvrir la PR dès le premier push:
   - `gh pr create --base master --title "feat(...): ..." --body "..."`

## Commits atomiques

- 1 commit = 1 intention claire (ex: UI, test, doc).
- Message Conventional Commits obligatoire (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
- Interdit: commit direct sur `master`.

## Gates qualité locales (avant push)

- `npm run qa`
- `npm run typecheck`
- `npm run e2e:bdd:ci` pour les changements de comportement utilisateur.
- `npm run visual:test` pour les changements UI visibles.

## Durcissement TypeScript

- `strict` actif + `noUncheckedIndexedAccess` + `noImplicitReturns` + `useUnknownInCatchVariables`.
- ESLint bloque `@typescript-eslint/no-explicit-any`.
- En cas d'acces indexe (`array[index]`), verifier explicitement `undefined`.

## Couverture

- Seuil minimal global: `80%`.
- Toute PR doit maintenir le seuil et augmenter la couverture des zones modifiées.

## BDD et rapports

- Exécution CI-friendly avec rapports:
  - `npm run bdd:test:ci`
- Artifacts produits:
  - `test-results/bdd-report.json`
  - `test-results/bdd-report.html`

## Gestion des conflits PR

1. `git checkout codex/<feature>-master`
2. `git fetch origin`
3. `git merge origin/master`
4. Résoudre les conflits + valider:
   - `npm run qa`
5. Commit de résolution:
   - `git commit -m "chore(merge): resolve master conflicts in <feature>"`
6. `git push`

## Definition of Done (PR)

- Branch dédiée `codex/*` basée sur `master`.
- PR ouverte et ciblée `master`.
- CI verte (`lint`, `test`, `e2e-bdd`, `security-audit`, `no-black-magic`).
- Couverture >= 80%.
- Documentation locale mise à jour (`docs/*`) si UX/comportement modifié.
- BDD ajouté/ajusté quand un parcours utilisateur change.
