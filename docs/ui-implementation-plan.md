# UI Implementation Plan - Retaia-UI

## 9. Plan d'actions priorise

### Priorite haute

1. Re-aligner le modele UI sur le contrat v1.
   - remplacer le modele local d'asset et le mapper API
   - reintroduire la machine a etats complete cote UI
   - renommer les derives `proxy_*` vers `preview_*`

2. Remettre a plat le client API sans casser le wiring utile.
   - supprimer `/batches/moves/*`
   - supprimer `/assets/{uuid}/decision`
   - utiliser `PATCH /assets/{uuid}` pour metadata, decisions et apply
   - utiliser `POST /assets/{uuid}/reopen`, `POST /assets/{uuid}/reprocess`, `POST /assets/{uuid}/purge`, `POST /assets/purge`
   - injecter `Accept-Language`
   - imposer `If-Match` sur tous les flows mutateurs concernes

3. Refaire le routing et le shell applicatif.
   - routes publiques auth
   - routes authentifiees review/library/rejects/activity/settings/account
   - detail standalone `asset/:assetId`
   - preservation du contexte de retour

4. Refaire les workspaces critiques.
   - `Review`
   - `Library`
   - `Rejects`

5. Refaire les actions critiques.
   - choix `processing_profile` en `REVIEW_PENDING_PROFILE`
   - KEEP / REJECT / annulation explicite
   - apply decisions avec confirmation et resultat agrege
   - purge preview puis purge execute
   - reopen / reprocess

6. Refaire la validation automatique.
   - reecrire les BDD critiques selon les specs
   - remplacer les snapshots visuels legacy

### Priorite moyenne

1. Refaire `Account`.
   - sessions interactives
   - revoke single / revoke others
   - MFA
   - user features

2. Refaire `Settings`.
   - langue
   - theme
   - config runtime API
   - surfaces admin runtime si role admin

3. Introduire le systeme clavier final.
   - registry d'aide
   - raccourcis non destructifs priorises
   - garde de focus sur champs de saisie

4. Stabiliser les etats UX.
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

- corriger le modele asset, le mapper et le client API
- sortir les endpoints legacy du chemin critique
- fiabiliser le mock API pour qu'il mime le contrat v1 reel

### Phase 1 - Shell et routing

- creer le shell connecte
- poser les routes canoniques
- poser le decoupage public/authentifie
- garder le wiring theme/i18n/persistance

### Phase 2 - Review workspace

- liste + detail
- qualification `REVIEW_PENDING_PROFILE`
- decisions humaines
- edition metadata
- etats d'erreur et conflits

### Phase 3 - Apply decisions et Rejects

- rail de selection multiple
- preview/confirmation/resultat pour actions groupees
- workspace `Rejects`
- purge unitaire et groupee explicite

### Phase 4 - Library

- recherche/filtres/tri par contrat API
- detail standalone et requalification
- reopen / reprocess

### Phase 5 - Auth, Account, Settings

- auth publique
- sessions
- MFA
- features user/admin
- configuration runtime

### Phase 6 - Activity, a11y, tests, polish

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
