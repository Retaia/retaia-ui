# UI Audit - Retaia-UI

Audit realise le 25 avril 2026.

Mise a jour documentaire le 30 avril 2026:

- shell structurel Phase 1 pose
- details standalone `review`, `library`, `rejects` implementes
- `Rejects` couvre maintenant `reopen`, `reprocess` et `purge`
- fallback waveform synthetique retire
- purge cadree avec anciennete visible dans le detail
- `GET /app/policy` annonce maintenant `client_feature_flags_contract_version`
- `Review` ouvre maintenant par defaut sur une file de travail explicite plutot que sur `ALL`
- la disponibilite bulk de `Review` est maintenant derivee du resultat effectif gouverne plutot que des flags bruts
- `Library` expose maintenant des facettes utiles de recherche et de requalification
- `Rejects` expose maintenant des facettes utiles de recherche, de retention et de requalification prudente
- `Auth` est maintenant traite comme une surface publique stricte
- les overrides runtime ne vivent plus dans `Auth` et restent secondaires dans `Settings`

## 1. Resume executif

Retaia-UI n'est pas un shell vide. Le repo livre deja un shell authentifie, un workspace review dense, des surfaces `Library`, `Rejects`, `Activity`, `Account`, `Settings`, un client API type, de l'i18n, des hooks de sync et des suites BDD/visuelles. La refonte a donc deux enjeux distincts:

- remettre l'architecture UX au centre sans casser le wiring API existant
- fermer des gaps critiques de conformite et de comprehension operateur

Constat principal:

- le socle technique reutilisable est bon
- la structure informationnelle est encore incoherente entre workspaces
- plusieurs flux critiques restent incomplets ou trop implicites
- la documentation du repo se contredit sur l'etat reel de l'existant

Bloqueurs restants les plus importants avant implementation UI cible:

1. clarifier la source documentaire et le statut reel du repo
2. continuer a clarifier `Review` sans casser les parcours batch
3. clarifier encore `Review` et les surfaces secondaires restantes sans reintroduire de logique implicite

## 2. Vision produit vs contraintes specs (separees clairement)

### Vision produit issue du README racine

Le `README.md` racine exprime surtout une intention de mise en oeuvre:

- le repo est `specs-first`
- `specs/` prime sur tout le reste
- `docs/` est local et non normatif
- l'etat du repo est presente comme un `UI reset`
- l'etape attendue avant implementation est un audit code-vs-spec puis un plan priorise
- la base UI doit rester TailAdmin-aligned

Implication:

- le README ne decrit pas a lui seul le produit final
- il impose surtout une discipline: auditer avant de refondre, puis implementer sans re-definir la norme localement

### Contraintes metier et techniques issues des specs normatives

Les contraintes opposables au client web viennent de `specs/workflows`, `specs/state-machine`, `specs/api`, `specs/policies`, `specs/definitions` et `specs/tests`.

Les invariants UI les plus structurants sont:

- `Core` est la seule source de verite metier
- `UI_WEB` ne doit jamais inventer d'etat, de transition ou d'automatisme
- review via derives/proxies uniquement, jamais via originaux SMB/NFS
- `KEEP` / `REJECT` sont toujours humains
- `apply decision` est explicite et unitaire cote Core
- le bulk reste un concept UI, sans ressource batch backend
- toute action destructive doit etre explicite, confirmee et tracable
- aucun etat expose par Core ne doit etre integralement masque par l'UI
- les actions doivent etre bloquees par etat, scope, preconditions HTTP et feature gating runtime

### Recommandations non normatives utilisees comme source secondaire

Le `DOCUMENT-INDEX.md` classe tous les documents de `specs/ui/` en `NON_NORMATIVE`.

Ils servent de cadrage utile pour:

- routes canoniques
- vocabulaire visible
- shell global
- suggestions de layout
- priorites de design et de navigation

Ils ne peuvent pas:

- modifier un workflow
- introduire un nouvel etat metier
- contourner l'API, la state machine ou les policies

### Incoherences explicites a signaler

1. `README.md` racine parle encore d'un repo en `UI reset`, alors que `docs/README.md` affirme que le shell canonique et plusieurs workspaces sont deja livres.
2. `README.md` racine met en avant `specs/ui/UI-GLOBAL-SPEC.md` comme reference produit cible, alors que `specs/DOCUMENT-INDEX.md` classe `specs/ui/*` comme `NON_NORMATIVE`.
3. Le contexte de mission parle d'une UI actuelle "minimale et jetable", mais le code present livre deja une surface produit large. Le bon cadrage n'est donc pas "partir de zero", mais "refondre une base partiellement implementee".

## 3. Contraintes UI/UX normatives

| Contrainte normative | Source principale | Impact UI/UX |
| --- | --- | --- |
| Aucun `KEEP` / `REJECT` automatique | `GOLDEN-RULES.md`, `WORKFLOWS.md`, `ANTI-PATTERNS.md` | pas de suggestion transformee en decision, pas de default implicite, pas d'auto-apply |
| Review via derives uniquement | `PROJECT-BRIEF.md`, `WORKFLOWS.md`, `ANTI-PATTERNS.md` | previews, thumbs, waveform, transcript viennent de Core; aucun chemin SMB expose au navigateur |
| Etat metier strict | `STATE-MACHINE.md` | l'UI doit piloter les actions depuis l'etat courant exact; aucune interpretation libre |
| `REVIEW_PENDING_PROFILE` sans decision | `STATE-MACHINE.md`, `WORKFLOWS.md`, `TEST-PLAN.md` | l'action primaire est le choix de `processing_profile`; `KEEP` / `REJECT` doivent rester bloques |
| `DECIDED_KEEP` / `DECIDED_REJECT` ne valent pas move applique | `WORKFLOWS.md`, `ANTI-PATTERNS.md` | l'UI doit separer "decision posee" de "move applique" |
| `apply decision` explicite et unitaire | `GOLDEN-RULES.md`, `WORKFLOWS.md` | preview, confirmation et resultat agrege UI; appels asset par asset cote Core |
| Purge uniquement sur `REJECTED` | `STATE-MACHINE.md`, `WORKFLOWS.md`, `AUTHZ-MATRIX.md` | pas de purge ailleurs; confirmation forte obligatoire |
| `If-Match` obligatoire sur mutations critiques | `STATE-MACHINE.md`, `TEST-PLAN.md`, `API-CONTRACTS.md` | UX de conflit et refresh explicite obligatoires |
| Feature flags pilotes par Core | `API-CONTRACTS.md` | pas de feature hardcodee cote UI; disponibilite derivee du runtime |
| `UI_WEB` seule UI humaine complete | `API-CONTRACTS.md`, `AUTHZ-MATRIX.md`, `SECURITY-BASELINE.md` | auth, decision, approvals et actions sensibles restent dans le web app |
| i18n sans logique sur les labels | `I18N-LOCALIZATION.md` | tous les textes visibles doivent etre traduits, mais la logique reste branchee sur les constantes metier |
| Visibilite minimale des etats exposes | `TEST-PLAN.md`, `UI-GLOBAL-SPEC.md` en recommandation coherente | pas de disparition silencieuse d'un etat expose par Core |

## 4. Parcours utilisateurs

| Parcours | Criticite | Ancrage specs | Exigence UX |
| --- | --- | --- | --- |
| Review d'un asset entrant | Critique | `WORKFLOW 6`, `STATE-MACHINE` | preview central, etat visible, decision explicite, aucun move implicite |
| Qualification audio `REVIEW_PENDING_PROFILE` | Critique | `PROCESSING-PROFILES.md`, `STATE-MACHINE.md` | surface dediee dans le meme flux de review, sans confusion avec `KEEP` / `REJECT` |
| Selection multiple + apply explicite | Critique | `GOLDEN-RULES.md`, `WORKFLOW 7` | preview des changements, confirmation, execution unitaire, rapport agrege |
| Recherche et requalification en bibliotheque | Haute | `WORKFLOW 8`, `WORKFLOW 9` | recherche fiable, detail lisible, `reopen` et `reprocess` clairement distincts |
| Gestion des rejects et purge | Critique | `WORKFLOW 8`, `WORKFLOW 9`, `WORKFLOW 10` | `reopen`, `reprocess`, preview purge, confirmation forte, age/risque visibles |
| Authentification, MFA et sessions | Haute | `API-CONTRACTS.md`, `TEST-PLAN.md` | pages publiques separees, surfaces de securite comprehensibles, pas de confusion avec Settings |
| Activity locale operateur | Moyenne | aucun audit backend dedie en v1 | journal de travail utile, clairement local, jamais presente comme audit Core |
| Preferences/runtime admin | Moyenne | `GET /app/policy`, `GET/PATCH /app/features` | surface secondaire, role-aware, sans melanger preferences UI et administration produit |

## 6. Audit de l'existant

### Reutilisable

- `src/api/client.ts`, `src/api/transport.ts`, `src/api/assetMapper.ts`
  - bon socle de wiring API et de typage
- `src/hooks/useReviewDataController.ts`
  - structure deja utile pour assets + policy polling + detail fetch
- `src/store/middleware/assetSyncMiddleware.ts` et `src/store/thunks/assetSyncThunks.ts`
  - bon point d'ancrage pour preserver les mutations unitaires
- `src/components/layout/AuthenticatedShell.tsx` et `src/components/app/AppHeader.tsx`
  - shell deja en place, a refondre visuellement mais pas a jeter
- `src/components/app/AssetDetailPanel.tsx`
  - base exploitable pour metadata, preview, processing profile et actions
- `src/hooks/useAuthPageController.ts` et sous-hooks `auth/*`
  - surface auth/sessions/MFA deja avancee
- `src/i18n/*`
  - base FR/EN et discipline i18n deja en place
- `bdd/features/*`
  - couverture existante utile pour securiser la refonte

### A refondre

- `src/pages/ReviewWorkspacePage.tsx` et `src/hooks/useReviewPageController.ts`
  - trop de responsabilites concentrees; IA review encore melangee entre file de travail, batch, reporting et statuts secondaires
- `src/pages/RejectsPage.tsx`
  - surface plus sure qu'au depart, mais encore incomplete pour une requalification longue duree
- `src/components/app/AssetMediaPreview.tsx`
  - preview utile, mais reste a consolider autour des derives reellement exposes par Core
- `src/components/app/AppHeader.tsx`
  - shell fonctionnel, mais encore trop "template admin" et pas assez "poste operateur"

### A supprimer ou sortir du flux principal

- `src/pages/UiResetPage.tsx`
  - reliquat de phase precedente
- routes legacy `*/detail/:assetId` dans `src/routes/AppRoutes.tsx`
  - a garder seulement pour compatibilite temporaire
- controles techniques `API base URL` / `API token` dans les surfaces les plus visibles
  - utiles au dev/test, pas a l'operateur metier

### A conserver surtout pour le wiring API

- `src/api/contracts.ts`
- `src/hooks/useApiClient.ts`
- `src/hooks/useReviewApiRuntime.ts`
- `src/hooks/useRuntimeDiagnostics.ts`
- `src/services/workspaceQueryParams.ts`
- `src/services/workspaceContextPersistence.ts`

### Lecture critique de l'existant

L'existant ne doit pas servir de reference UX. Il sert de base de plomberie:

- le code prouve que les endpoints et les mutations critiques sont deja branches
- il ne prouve pas que l'architecture d'interface soit juste
- plusieurs ecrans donnent encore une impression de dashboard ou de scaffold plutot que de poste de travail durable
