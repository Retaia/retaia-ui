# Bootstrap Technique — retaia-ui

> Statut : non normatif.
> Les règles métier restent dans `specs/`.

## Stack cible

- Runtime UI: React 19 + TypeScript + Vite
- Lint: ESLint
- Tests TDD: Vitest + Testing Library + MSW
- Tests BDD: Cucumber.js + Playwright (TypeScript)

## État actuel

Présent:

- React + TypeScript + Vite
- ESLint

À ajouter pour TDD/BDD TypeScript:

- `vitest`
- `@testing-library/react`
- `@testing-library/user-event`
- `@testing-library/jest-dom`
- `msw`
- `@vitest/coverage-v8`
- `@cucumber/cucumber`
- `playwright`
- `tsx` (runtime TS pour steps Cucumber)

## Scripts npm recommandés

- `test`: exécute les tests unitaires/intégration
- `test:watch`: mode watch TDD
- `test:coverage`: couverture locale
- `bdd`: exécute les scénarios Gherkin
- `typecheck`: `tsc --noEmit`
- `qa`: `lint + typecheck + test:coverage + bdd`

## Arborescence recommandée

- `src/` composants/hooks/services
- `src/test/` setup Vitest + utilitaires de tests
- `src/mocks/` handlers MSW
- `features/` scénarios Gherkin (`*.feature`)
- `features/steps/` step definitions TypeScript

## Conventions TDD

- Un test qui échoue avant toute implémentation.
- Noms explicites orientés comportement.
- Pas de snapshots massifs non relus.

## Conventions BDD

- Scénarios écrits en langage produit.
- Assertions sur comportements visibles, pas sur détails d'implémentation.
- Scénarios liés aux sections normatives (API, state machine, i18n, authz).

## Commandes dev

- `npm run dev`
- `npm run build`
- `npm run lint`

Quand la stack de tests sera ajoutée:

- `npm run test`
- `npm run test:coverage`
- `npm run bdd`
- `npm run qa`
