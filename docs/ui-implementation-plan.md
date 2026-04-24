# UI Implementation Plan - Retaia-UI

## 9. Plan d'actions priorise

Etat au 2026-04-24 :

- phases 0 a 4 : majoritairement executees
- phase 5 : largement executee sur auth/account/settings, mais reste a stabiliser
- phase 6 : encore ouverte

### Priorite haute

1. Stabiliser la validation automatique.
   - continuer la reecriture des BDD critiques selon les specs
   - remplacer les snapshots visuels legacy encore utiles comme garde-fous

### Priorite moyenne

1. Stabiliser `Account` et `Settings`.
   - consolider les etats de chargement/erreur
   - verifier toute la separation compte vs runtime
   - cadrer l'eventuelle extension admin

2. Introduire le systeme clavier final.
   - registry d'aide
   - raccourcis non destructifs priorises
   - garde de focus sur champs de saisie

3. Stabiliser les etats UX.
   - loading
   - empty states
   - `412` / `428`
   - `403` / `401`
   - retry / refetch

### Priorite basse

1. `Activity` en workspace borne.
   - journal operateur local
   - resultats et correlation ids
   - liens de retour vers asset

2. Polish visuel TailAdmin-aligned.
   - tokens
   - densite
   - modes table/grille
   - cohérence fine des panneaux

## 10. Sequencement d'implementation

### Phase 0 - Assainissement contractuel

Statut : execute en grande partie.

- corriger le modele asset, le mapper et le client API
- sortir les endpoints legacy du chemin critique
- fiabiliser le mock API pour qu'il mime le contrat v1 reel

### Phase 1 - Shell et routing

Statut : execute.

- creer le shell connecte
- poser les routes canoniques
- poser le decoupage public/authentifie
- garder le wiring theme/i18n/persistance

### Phase 2 - Review workspace

Statut : execute en grande partie.

- liste + detail
- qualification `REVIEW_PENDING_PROFILE`
- decisions humaines
- edition metadata
- etats d'erreur et conflits

### Phase 3 - Apply decisions et Rejects

Statut : execute en grande partie.

- rail de selection multiple
- preview/confirmation/resultat pour actions groupees
- workspace `Rejects`
- purge unitaire et groupee explicite

### Phase 4 - Library

Statut : execute.

- recherche/filtres/tri par contrat API
- detail standalone et requalification
- reopen / reprocess

### Phase 5 - Auth, Account, Settings

Statut : execute en grande partie.

- auth publique
- sessions
- MFA
- features user/admin
- configuration runtime

### Phase 6 - Activity, a11y, tests, polish

Statut : ouverte.

- workspace activity borne
- raccourcis
- a11y
- BDD/E2E
- visual regression

## 11. Impact code

### Fichiers/dossiers a modifier en priorite

- `src/routes/AppRoutes.tsx`
- `src/pages/*`
- `src/hooks/useReviewPageController.ts`
- `src/hooks/useLibraryPageController.ts`
- `src/hooks/useStandaloneAssetDetailController.ts`
- `src/hooks/useReviewDataController.ts`
- `src/hooks/useAuthPageController.ts`
- `src/hooks/auth/*`
- `src/components/app/*`
- `src/components/review/*`
- `src/components/library/*`
- `src/components/auth/*`
- `src/components/ui/*`
- `src/api/client.ts`
- `src/api/contracts.ts`
- `src/api/transport.ts`
- `src/api/assetMapper.ts`
- `src/api/mockDb.ts`
- `src/domain/assets.ts`
- `src/domain/review/*`
- `src/application/review/*`
- `src/store/slices/*`
- `src/store/thunks/*`
- `src/services/workspaceQueryParams.ts`
- `src/services/workspaceContextPersistence.ts`
- `src/i18n/locales/*`
- `bdd/features/*`
- `bdd/step-definitions/*`
- `tests/visual/ui.visual.spec.ts`

### Fichiers/dossiers probablement conserves comme base

- `src/ui/tailadmin-theme.tsx`
- `src/i18n/index.ts`
- `src/store/index.ts`
- `src/queryClient.ts`
- `src/components/ui/AppButton.tsx` apres nettoyage si besoin

### Composants a creer ou isoler explicitement

- `AuthenticatedShell`
- `PublicAuthLayout`
- `ReviewWorkspacePage`
- `LibraryWorkspacePage`
- `RejectsWorkspacePage`
- `ActivityPage`
- `AccountPage`
- `SettingsPage`
- `AssetListSection`
- `AssetDetailSection`
- `DecisionPanel`
- `ApplyDecisionPanel`
- `PurgePanel`
- `AudioProfileSelectionPanel`
- `AssetStateBadge`
- `FeatureAvailabilityBanner`
- `ApiConflictBanner`

### Regle de mise en oeuvre

- structure d'abord
- contrat API ensuite
- parcours critiques ensuite
- ecrans secondaires ensuite
- polish en dernier

Le repo ne doit pas etre modifie massivement d'un seul bloc. Il faut decouper la refonte en PRs petites, chacune alignee sur une phase ci-dessus.
