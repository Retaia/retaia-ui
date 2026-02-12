# UI Architecture (Desktop-like)

## Objectif

Décrire la structure actuelle de l'app React/TypeScript pour garder un code court,
modulaire et testable (TDD + BDD).

## Entrée principale

- `src/App.tsx`

`App.tsx` orchestre les états globaux de review et compose les blocs UI.
La logique métier est déplacée autant que possible dans des hooks dédiés.

## Composants UI

- `src/components/app/AppHeader.tsx`
  Header, langue, titre.
- `src/components/app/ActionPanels.tsx`
  Actions rapides, batch, rapport, historique, aide raccourcis.
- `src/components/app/NextPendingCard.tsx`
  Carte "prochain asset".
- `src/components/app/AssetDetailPanel.tsx`
  Détail + actions de purge.
- `src/components/AssetList.tsx`
  Liste des assets (roving tabindex + interactions desktop-like).
- `src/components/ReviewToolbar.tsx`
  Filtres/recherche.
- `src/components/ReviewSummary.tsx`
  Synthèse des états.

## Hooks métier

- `src/hooks/useQuickFilters.ts`
  Presets de filtres + persistance localStorage.
- `src/hooks/useDensityMode.ts`
  Densité d'affichage + persistance localStorage.
- `src/hooks/useSelectionFlow.ts`
  Sélection clavier/souris, plage, batch sur sélection active.
- `src/hooks/useBatchExecution.ts`
  Preview/exécution batch, timeline, fenêtre d'annulation, rapport/export.
- `src/hooks/usePurgeFlow.ts`
  Preview/confirmation purge et statut d'exécution.
- `src/hooks/useReviewHistory.ts`
  Snapshots undo + journal d'activité (séparation du state history hors `App.tsx`).
- `src/hooks/useReviewKeyboardShortcuts.ts`
  Mapping des raccourcis desktop-like vers callbacks UI.

## Logique domaine

- `src/domain/assets.ts`
  Types d'assets, transitions d'état, filtres.
- `src/domain/actionAvailability.ts`
  Règles d'activation/désactivation des actions UI.

## Tests

### Unit/Integration (Vitest + RTL)

- `src/App.test.tsx`: flux core/intégration
- `src/app.batch.test.tsx`: flux batch
- `src/app.shortcuts.test.tsx`: raccourcis clavier
- `src/components/*.test.tsx`: composants isolés
- `src/domain/*.test.ts`: logique domaine

### BDD (Cucumber + Playwright)

- `bdd/features/*.feature`
- `bdd/step-definitions/lifecycle.steps.ts`
- `bdd/step-definitions/api-mock.steps.ts`
- `bdd/step-definitions/ui.steps.ts`
- `bdd/support/mockApiRoutes.ts`
- `bdd/support/testRuntime.ts`

## Principes de refactor

- Une feature = une branche `codex/*` basée sur `master`.
- Une branche = une PR, créée dès le push.
- Commits atomiques conventionnels (husky + commitlint).
- Aucun commit direct sur `master`.
