# UI Architecture (Desktop-like)

## Objectif

Décrire la structure actuelle de l'app React/TypeScript pour garder un code court,
modulaire et testable (TDD + BDD).

## Entrée principale

- `src/main.tsx` (routing browser)
- `src/App.tsx` (écran review)

Routes UI:

- `/review`
- `/review/:assetId` (deep-link détail)

`App.tsx` orchestre les états globaux de review et compose les blocs UI.
La logique métier est déplacée autant que possible dans des hooks dédiés.

## Composants UI

- `src/components/app/AppHeader.tsx`
  Header, langue, titre.
- `src/components/app/AppErrorBoundary.tsx`
  Filet de sécurité global avec fallback utilisateur.
- `src/components/app/ActionPanels.tsx`
  Actions rapides, batch, rapport, historique, aide raccourcis.
- `src/components/app/NextPendingCard.tsx`
  Carte "prochain asset".
- `src/components/app/AssetDetailPanel.tsx`
  Détail + actions de purge + preview média (waveform serveur si disponible, fallback waveform local JS pour audio sinon).
- `src/components/AssetList.tsx`
  Liste des assets (roving tabindex + interactions desktop-like).
- `src/components/ReviewToolbar.tsx`
  Filtres/recherche.
- `src/components/ReviewSummary.tsx`
  Synthèse des états.
- `src/components/auth/AuthAccountSection.tsx`
  Sections Auth utilisateur (login/logout, lost password, verify email, 2FA user/admin).
- `src/components/auth/ApiConnectionSettingsSection.tsx`
  Paramètres de connexion API (base URL, test/save/clear, statut retry).

## Hooks métier

- `src/hooks/useAuthPageController.ts`
  Controller de la page Auth (états, orchestration API auth/2FA/features, side-effects), pour garder `AuthPage` centré sur le rendu.
- `src/hooks/useApiClient.ts`
  Configuration runtime API partagée (env + local storage + mock DB in-memory en `APP_ENV=test`) et création du client HTTP.
- `src/hooks/useReviewApiRuntime.ts`
  Runtime Review (instanciation client API + stratégie de retry + détection source API).
- `src/hooks/useReviewRouteSelection.ts`
  Synchronisation état de sélection Review avec l'URL (`/review/:assetId` + query `asset`).
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

## Robustesse API (runtime)

- `src/api/client.ts`
  Validation runtime des payloads critiques (`listAssetSummaries`, `executeMoveBatch`, `getMoveBatchReport`).
- En cas de payload invalide, le client lève `ApiError` avec `code: VALIDATION_FAILED` (status `502`).
- `src/api/errorMapping.ts`
  Mapping explicite des codes API v1 vers messages UX (`FORBIDDEN_*`, `STATE_CONFLICT`, `IDEMPOTENCY_CONFLICT`, `LOCK_*`, `RATE_LIMITED`, `VALIDATION_FAILED`).
- `src/services/apiSession.ts`
  Accès localStorage centralisé pour session/config API (`token`, `base_url`, `email`) afin d'éviter la duplication entre pages.

## Tests

### Unit/Integration (Vitest + RTL)

- `src/App.test.tsx`: flux core/intégration
- `src/app.batch.test.tsx`: flux batch
- `src/app.shortcuts.test.tsx`: raccourcis clavier
- `src/components/*.test.tsx`: composants isolés
- `src/domain/*.test.ts`: logique domaine
- `src/components/app/AppErrorBoundary.test.tsx`: fallback global en cas de crash UI

## Instrumentation UI

- `src/ui/telemetry.ts`
  Emet des événements `window` (`retaia:ui-issue`) pour erreurs UI importantes.
- Cas couverts:
  - crash React attrapé par `AppErrorBoundary`
  - échec de chargement initial des assets API

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
