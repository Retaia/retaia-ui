# UI Implementation Plan - Retaia-UI

## 9. Plan d'actions priorise

Regle de base:

- aucune implementation massive avant fermeture des incoherences de structure
- preservation maximale du wiring API deja livre
- aucune modification dans `specs/`

### Tranches deja fermees

- shell structurel `AuthenticatedShell` / `WorkspaceScaffold` consolide
- details standalone `review`, `library`, `rejects` implementes et relies au wiring existant
- `Rejects` couvre `reopen`, `reprocess`, `purge` en workspace et en standalone
- sortie de scope locale geree dans `Rejects` apres `reopen`, `reprocess`, `purge`
- faux fallback waveform remplace par un etat explicite
- anciennete asset visible avant purge
- `GET /app/policy` envoie `client_feature_flags_contract_version`
- `Review` ouvre par defaut sur une file de travail explicite plutot que sur `ALL`
- la disponibilite bulk de `Review` derive maintenant du resultat effectif gouverne

Regle de suivi:

- ne pas replanifier ces sujets comme s'ils etaient encore ouverts
- si une tranche revient dessus, elle doit annoncer explicitement qu'il s'agit d'un approfondissement et non d'une premiere implementation

### Priorite haute

1. Corriger les flux critiques et les trous de navigation.
   - remettre `Review` sur une logique de file de travail claire

2. Corriger les ecarts de conformite runtime.
   - uniformiser les UX `409` / `412` / `428` / `423`

3. Stabiliser les actions critiques.
   - rendre `apply decisions` plus lisible
   - pousser plus loin le cadrage des actions destructives restantes
   - conserver la suppression des faux signaux visuels sur les derives manquants

### Priorite moyenne

1. Refaire l'architecture des workspaces secondaires.
   - `Library` comme espace de recherche/requalification
   - `Rejects` comme espace prudent de remise a decision et purge
   - `Activity` comme journal local mieux cadre

2. Nettoyer les surfaces techniques.
   - sortir les controles dev/runtime du premier plan
   - separer clairement `Account` et `Settings`
   - rendre les routes auth strictement publiques

3. Refactorer l'orchestration.
   - reduire la taille de `useReviewPageController.ts`
   - normaliser `Page + Controller + Sections`
   - decouper preview, conflit, batch, metadata et detail standalone

### Priorite basse

1. Polish visuel et densite.
   - alignement TailAdmin sans rendu template brut
   - hierarchie de panneaux plus stable
   - coherence light/dark

2. Densification progressive des gates automatiques.
   - etendre la couverture BDD a mesure que chaque flux est ferme
   - garder les snapshots visuels centres sur les parcours critiques

## 10. Sequencement d'implementation

### Phase 0 - Alignement documentaire

- figer l'analyse dans `docs/`
- signaler explicitement les incoherences README/docs
- considerer `specs/ui/*` comme source optionnelle et jamais contractuelle

### Phase 1 - Structure et IA

- consolider le shell authentifie
- clarifier le role de chaque workspace
- definir les patterns cibles: split workspace, detail standalone, public auth, settings/account

Objectif:

- eviter de refaire trois fois les memes composants autour d'une IA encore floue

### Phase 2 - Parcours critiques

- `Review`
- choix de `processing_profile`
- `apply decisions`
- conflits optimistic
- `Rejects` avec `reopen`, `reprocess`, `purge`

Objectif:

- fermer d'abord ce qui touche directement decision, move et suppression

### Phase 3 - Parcours secondaires

- `Library`
- `Activity`
- `Account`
- `Settings`

Objectif:

- densifier sans re-ouvrir les parcours critiques

### Phase 4 - Stabilisation

- harmonisation i18n
- a11y clavier
- coherence visuelle
- BDD/E2E/visual coverage sur la nouvelle structure

## 11. Impact code

### Fichiers et dossiers a modifier

#### Structure, routes et shells

- `src/routes/AppRoutes.tsx`
- `src/pages/ReviewWorkspacePage.tsx`
- `src/pages/LibraryPage.tsx`
- `src/pages/RejectsPage.tsx`
- `src/pages/StandaloneAssetDetailPage.tsx`
- `src/pages/AuthPage.tsx`
- `src/pages/ActivityPage.tsx`
- `src/components/layout/AuthenticatedShell.tsx`
- `src/components/layout/PublicAuthLayout.tsx`
- `src/components/app/AppHeader.tsx`
- `src/components/layout/WorkspaceScaffold.tsx`

#### Detail, preview et actions critiques

- `src/components/app/AssetDetailPanel.tsx`
- `src/components/app/AssetMediaPreview.tsx`
- `src/components/app/AssetListSection.tsx`
- `src/components/review/ReviewListDetailSection.tsx`
- `src/components/review/*`
- `src/components/library/*`
- `src/components/activity/*`

#### Controllers et orchestration

- `src/hooks/useReviewPageController.ts`
- `src/hooks/useReviewDataController.ts`
- `src/hooks/useLibraryPageController.ts`
- `src/hooks/useRejectsPageController.ts`
- `src/hooks/useStandaloneAssetDetailController.ts`
- `src/hooks/usePurgeFlow.ts`
- `src/hooks/useBatchExecution.ts`
- `src/hooks/useAuthPageController.ts`

#### Wiring API et contrat runtime

- `src/api/client.ts`
- `src/api/transport.ts`
- `src/api/contracts.ts`
- `src/api/assetMapper.ts`
- `src/store/middleware/assetSyncMiddleware.ts`
- `src/store/thunks/assetSyncThunks.ts`

#### Etat local, query params, i18n

- `src/services/workspaceQueryParams.ts`
- `src/services/workspaceContextPersistence.ts`
- `src/i18n/locales/en.ts`
- `src/i18n/locales/fr.ts`

#### Validation

- `bdd/features/*`
- `bdd/step-definitions/*`
- `tests/visual/*`
- `src/**/*.test.ts`
- `src/**/*.test.tsx`

### Fichiers a preserver autant que possible

Le wiring existant doit etre adapte, pas remplace sans raison forte:

- `src/api/client.ts`
- `src/api/transport.ts`
- `src/hooks/useApiClient.ts`
- `src/hooks/useReviewApiRuntime.ts`
- `src/store/middleware/assetSyncMiddleware.ts`
- `src/store/thunks/assetSyncThunks.ts`

### Regle de mise en oeuvre

- une tranche de travail = une classe de gap fermee
- pas de re-ecriture cosmetique globale
- pas de changement de contrat local qui contourne les specs
- pas de reouverture des couches API/store deja bonnes si le besoin est seulement UX
