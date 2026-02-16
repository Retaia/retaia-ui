# UI Architecture (Desktop-like)

## Objectif

Décrire la structure actuelle de l'app React/TypeScript pour garder un code court,
modulaire et testable (TDD + BDD).

## Entrée principale

- `src/main.tsx` (bootstrap React + BrowserRouter)
- `src/App.tsx` (point d'entrée UI qui délègue aux routes)
- `src/routes/AppRoutes.tsx` (composition des pages par route)

Routes UI:

- `/review`
- `/review/:assetId` (deep-link détail)
- `/auth`

`App.tsx` ne contient pas de logique métier feature.
La logique métier est portée par les couches `domain` et `application`, puis injectée dans les pages.

## Composants UI

- `src/components/app/AppHeader.tsx`
  Header, langue, titre.
- `src/components/app/AppErrorBoundary.tsx`
  Filet de sécurité global avec fallback utilisateur.
- `src/components/app/ActionPanels.tsx`
  Actions rapides, batch, rapport, historique, aide raccourcis.
- `src/components/app/ActionBatchSection.tsx`
  Sous-section UI du panneau Actions pour les operations batch (scope, timeline, preview/execute/cancel).
- `src/components/app/ActionReportSection.tsx`
  Sous-section UI du panneau Actions pour rapport batch (refresh/export/statut).
- `src/components/app/ActionJournalSection.tsx`
  Sous-section UI du panneau Actions pour journal d'activite.
- `src/components/app/ActionShortcutsSection.tsx`
  Sous-section UI du panneau Actions pour l'aide des raccourcis clavier et actions associees.
- `src/components/app/NextPendingCard.tsx`
  Carte "prochain asset".
- `src/components/app/AssetDetailPanel.tsx`
  Détail + actions de purge + preview média (waveform serveur si disponible, fallback waveform local JS pour audio sinon).
- `src/components/app/AssetMediaPreview.tsx`
  Sous-composant de preview média (image/video/audio + fallback waveform local).
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
  Controller de la page Auth (composition des sous-hooks auth/features + état de connexion API), pour garder `AuthPage` centré sur le rendu.
- `src/hooks/auth/useAuthPageApiState.ts`
  Sous-hook d'état/runtime API de la page Auth (token/base URL, statut de retry, erreurs d'auth API) pour isoler le state de vue du controller d'orchestration.
- `src/hooks/auth/useAuthFeatureGovernance.ts`
  Sous-hook de gouvernance 2FA/features (chargement admin feature flags + toggles user/app) pour réduire le coupling dans `useAuthPageController`.
- `src/hooks/auth/useAuthMfaController.ts`
  Sous-hook MFA utilisateur (setup/enable/disable, statut, OTP action) pour isoler la logique 2FA hors du controller principal.
- `src/hooks/auth/useAuthRecoveryController.ts`
  Sous-hook recovery Auth (lost password + verify email user/admin) pour isoler les flux de récupération et confirmation email.
- `src/hooks/auth/useAuthSessionController.ts`
  Sous-hook session Auth (login/logout, rechargement utilisateur/features depuis token, expiration de session).
- `src/hooks/auth/useAuthApiConnectionController.ts`
  Sous-hook connexion API (save/clear/test) pour isoler la logique de configuration de backend.
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
- `src/hooks/useShortcutsHelpState.ts`
  Etat local du panneau d'aide raccourcis (première ouverture + persistance localStorage) extrait de `ReviewPage`.

## Logique domaine

- `src/domain/assets.ts`
  Types d'assets, transitions d'état, filtres.
- `src/domain/actionAvailability.ts`
  Règles d'activation/désactivation des actions UI.
- `src/domain/review/metadata.ts`
  Normalisation métier du payload metadata Review (`tags`, `notes`) hors UI.
- `src/domain/auth/features.ts`
  Normalisation métier des payloads features Auth/App + détection clé MFA/2FA.

## Couche application

- `src/application/review/submitReviewDecisions.ts`
  Use-case d'orchestration des décisions bulk (API/mock) avec agrégation des succès/erreurs.
- `src/application/review/bulkDecisionFinalization.ts`
  Finalisation pure du résultat bulk (none/error/partial/success + calcul des deltas de state), utilisée par `ReviewPage`.
- `src/application/review/errorResolution.ts`
  Résolution des erreurs Review (message UX + signal `shouldRefreshSelectedAsset` pour `STATE_CONFLICT`) afin d'éviter la duplication de mapping dans la page.
- `src/application/review/applySingleReviewDecision.ts`
  Use-case d'orchestration d'une décision unitaire (validation cible + appel API optionnel + résultat métier).
- `src/application/review/batchScopeSummary.ts`
  Résumé pur du scope batch (pending/keep/reject) pour éviter la logique de comptage inline dans la page.
- `src/application/review/batchExecutionHelpers.ts`
  Helpers applicatifs purs pour timeline batch, calcul undo, résolution `batch_id` et sérialisation export rapport.
- `src/application/review/batchExecutionPlanning.ts`
  Planification pure du flux batch (`ignore`/`run-now`/`queue`) avec calcul de fenêtre d'annulation, utilisée par `useBatchExecution`.
- `src/application/review/batchReportLoading.ts`
  Chargement applicatif du rapport batch (success/error + message traduit) partagé entre exécution initiale et refresh manuel.
- `src/application/review/batchExecutionStatus.ts`
  Builders purs des statuts batch (preview/execute/queued/canceled) pour éviter la duplication des messages dans `useBatchExecution`.
- `src/application/review/purgeStatus.ts`
  Builders purs des statuts purge (preview/result/error) pour réduire la duplication de messages dans `usePurgeFlow`.
- `src/application/review/selectionFlowHelpers.ts`
  Helpers applicatifs purs pour navigation de sélection (`offset`, range) et fusion dédupliquée des `batchIds`.
- `src/application/review/keyboardShortcutResolution.ts`
  Résolution pure des événements clavier vers commandes UI Review (mapping raccourcis -> intentions).
- `src/application/review/quickFilterPresets.ts`
  Mapping pur des presets/views de filtres rapides vers l'état de filtre UI.
- `src/application/review/assetListFocus.ts`
  Résolution pure de la cible de focus pour la liste d'assets (sélection courante/fallback), utilisée par `ReviewPage`.
- `src/application/auth/mfaPresentation.ts`
  Helpers applicatifs purs de présentation MFA (mapping clés i18n + mise à jour immuable du profil user).

## Direction DDD (V1)

- Cible: architecture DDD légère adaptée au front.
- `domain`: règles métier pures et déterministes.
- `application`: use-cases orchestrant règles domaine via ports/adapters, sans import direct `api/*`.
- `infrastructure`: adapters techniques qui relient les détails API/runtime aux use-cases.
- `pages/components/hooks`: composition UI, état de vue, interactions utilisateur.
- Règle d'évolution: toute nouvelle logique métier doit atterrir en `domain`/`application` avec tests dédiés.

## Garde-fous de couche

- `npm run lint:architecture` applique des frontières d'import:
- `src/pages/*`: pas d'import direct `api/client` (accès API via hooks/services/use-cases).
- `src/application/*`: pas d'import `api/*` ni `services/*` (adapters via `src/infrastructure/*`).
- `src/components/*`: pas d'import `api/*` ni `application/*` (UI pure).
- `src/hooks/*`: pas d'import `pages/*` ni `components/*` (pas de dépendance inversée UI).
- CI exécute aussi `lint:architecture` dans le job `lint`.

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

- `src/pages/ReviewPage.test.tsx`: flux core/intégration review
- `src/pages/AuthPage.test.tsx`: flux core/intégration auth
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
