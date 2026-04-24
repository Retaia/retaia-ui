# UI Audit - Retaia-UI

## 1. Resume executif

Le repo n'est plus en phase `UI reset` pure. Le runtime principal sert maintenant un shell canonique avec de vrais workspaces `Review`, `Library`, `Rejects`, `Activity`, `Account` et `Settings`. En revanche, la refonte reste inachevee : plusieurs ecarts contractuels ont ete fermes, mais une partie de la stabilisation batch/apply et du durcissement UX reste encore ouverte.

Constats majeurs :

- la vision produit est coherente : outil de revue et de decision humaine, pas media server, pas DAM generique
- les contraintes normatives sont strictes : machine a etats fermees, review via derives uniquement, bulk purement UI, mutations unitaires cote Core
- une partie importante de l'UI est maintenant alignee : routes canoniques, shell connecte, workspaces principaux, compte, settings, details standalone, i18n/theme et sessions
- les ecarts restants sont concentres sur les flows critiques encore incomplets ou partiellement legacy : stabilisation de l'apply groupé contractuel, durcissement des parcours critiques, et quelques surfaces admin encore bornees

Verdict :

- il ne faut plus parler de "placeholder global", mais d'une refonte avancee encore partielle
- il ne faut pas repartir de zero sur tout le repo
- il faut maintenant nettoyer les reliquats contractuels et fermer les parcours encore non conformes plutot que reconstruire encore le shell

## 2. Vision produit vs contraintes specs

### Vision produit issue du README racine

Source : `README.md`, completee par `specs/vision/PROJECT-BRIEF.md` comme contexte produit non normatif.

- Retaia-UI est la surface humaine de review et de management
- le produit est local-first
- la confiance, la lisibilite et la durabilite priment sur la vitesse brute
- la review se fait via previews/derives, jamais via SMB/originaux dans le navigateur
- l'UI actuelle est minimale et jetable
- la prochaine vraie etape attendue est un audit code-vs-spec puis un plan d'implementation

### Contraintes techniques/metier issues des specs normatives

Sources : `GOLDEN-RULES.md`, `CONCEPTUAL-ARCHITECTURE.md`, `WORKFLOWS.md`, `STATE-MACHINE.md`, `API-CONTRACTS.md`, `AUTHZ-MATRIX.md`, `ERROR-MODEL.md`, `PROCESSING-PROFILES.md`, `I18N-LOCALIZATION.md`.

- Core est la seule source de verite metier
- l'UI ne decide jamais l'etat metier reel et ne deduit jamais des transitions localement
- aucune decision KEEP/REJECT automatique
- aucun move implicite
- aucune purge implicite
- bulk = selection multiple et orchestration UI uniquement
- apply decision = mutation unitaire par asset
- purge = destructive, explicite, uniquement sur `REJECTED`
- toute mutation asset partagee exige `If-Match`
- l'API partagee est stateless/sessionless et pilotee par bearer tokens
- la disponibilite runtime depend de Core, pas d'heuristiques locales
- les etats, erreurs et identifiants restent stables et non traduits

### Incoherences a signaler

1. Le `README.md` racine dit que le comportement final attendu est defini "especially" par `specs/ui/UI-GLOBAL-SPEC.md` et `specs/ui/KEYBOARD-SHORTCUTS-REGISTRY.md`.
2. `specs/DOCUMENT-INDEX.md` classe pourtant tous les documents `specs/ui/*` comme `NON_NORMATIVE`.
3. Conclusion : ces documents UI sont exploitables comme recommandations, pas comme contrat opposable. La norme UI doit etre derivee des documents `api/`, `workflows/`, `state-machine/`, `definitions/`, `policies/`, `tests/`.

Il n'y a pas de contradiction de fond entre vision produit et specs normatives. L'incoherence porte sur le statut documentaire, pas sur le produit.

## 3. Contraintes UI/UX normatives

### Ce qui doit etre visible

- l'etat courant de l'asset, via un mapping explicite et stable
- la disponibilite ou l'indisponibilite des previews/derived utiles a la review
- les actions sensibles avec leur confirmation explicite
- les erreurs API sous forme compréhensible, sans perdre `code` ni `correlation_id` quand ils existent
- le resultat agrege d'une action groupée
- les etats `READY`, `PROCESSING_REVIEW`, `REVIEW_PENDING_PROFILE`, `DECISION_PENDING`, `DECIDED_*`, `ARCHIVED`, `REJECTED` si exposes par Core

### Ce qui doit rester cache ou hors navigation courante

- les chemins absolus hote/NAS
- tout acces SMB ou filesystem direct depuis le navigateur
- `PURGED` dans les listes de travail courantes
- toute pseudo-entite "batch" persistante cote UI ou Core

### Ce qui est interdit en UI

- faire croire qu'un asset `PROCESSED` est deja decide
- autoriser KEEP/REJECT depuis `REVIEW_PENDING_PROFILE`
- declencher un move au moment de la decision
- inventer une action destructive silencieuse
- inventer un endpoint, un etat, une route metier ou un flag local pour contourner Core
- post-filtrer localement une liste API en presentant le resultat comme verite serveur

### Implications UX directes

- l'UI doit separer clairement `decision` et `apply decision`
- l'UI doit rendre la machine a etats lisible
- l'UI doit traiter les conflits `412/428/409` comme des cas normaux a expliquer, pas comme des bugs obscurs
- l'UI doit rester comprehensible apres plusieurs semaines sans usage : pas de magie, pas d'implicite, pas de gestuelle cachee comme mecanisme principal

## 4. Parcours utilisateurs

| Parcours | Criticite | Source principale | Note |
| --- | --- | --- | --- |
| Review d'un asset en attente | Haute | `WORKFLOWS.md` 6, `STATE-MACHINE.md` | coeur produit |
| Qualification d'un `audio_undefined` | Haute | `PROCESSING-PROFILES.md`, `STATE-MACHINE.md` | bloque la suite du processing |
| Decision humaine KEEP/REJECT | Haute | `WORKFLOWS.md` 6, `API-CONTRACTS.md` | uniquement sur asset deja decisionnable |
| Apply des decisions posees | Haute | `WORKFLOWS.md` 7 | confirme, unitaire cote Core |
| Revue des rejects et purge explicite | Haute | `WORKFLOWS.md` 10 | destructive, tres encadree |
| Reopen d'un asset archive/rejected | Haute | `WORKFLOWS.md` 8 | permet la requalification tardive |
| Reprocess explicite | Moyenne/haute | `WORKFLOWS.md` 9 | reset technique, pas decisionnel |
| Recherche library | Haute | `API-CONTRACTS.md` | v1 stable, pas de media manager generique |
| Auth, recovery, verify email, MFA | Haute | `API-CONTRACTS.md`, `TEST-PLAN.md` | prerequis d'acces |
| Gestion features utilisateur/admin | Moyenne | `API-CONTRACTS.md`, `AUTHZ-MATRIX.md` | runtime gouverne par Core |
| Diagnostics ops admin | Moyenne | `openapi/v1.yaml`, `AUTHZ-MATRIX.md` | reserve admin |
| Activity workspace | Basse a moyenne | recommandation non normative | ne doit pas inventer une timeline backend absente |

## 5. Architecture des interfaces

La cartographie cible est detaillee dans `docs/ui-information-architecture.md`.

## 6. Audit de l'existant

### Reutilisable tel quel ou presque

- `src/routes/AppRoutes.tsx`
- `src/components/layout/AuthenticatedShell.tsx`
- `src/pages/ReviewWorkspacePage.tsx`, `src/pages/LibraryPage.tsx`, `src/pages/RejectsPage.tsx`
- `src/pages/AccountPage.tsx`, `src/pages/SettingsPage.tsx`
- `src/hooks/useApiClient.ts`
- `src/services/workspaceQueryParams.ts`
- `src/services/workspaceContextPersistence.ts`
- `src/ui/tailadmin-theme.tsx`
- la base i18n `src/i18n/*`
- les slices de persistance workspace si leur modele est re-aligne sur les vrais workspaces
- une partie des helpers purs `src/application/review/*` sur selection, focus, presets et statut, apres requalification

### Reutilisable avec refonte importante

- `src/hooks/useAuthPageController.ts` et sous-hooks auth
- `src/hooks/useReviewPageController.ts`
- `src/hooks/useLibraryPageController.ts`
- `src/hooks/useRejectsPageController.ts`
- `src/hooks/useStandaloneAssetDetailController.ts`
- `src/components/auth/*`
- `src/components/ui/AppButton.tsx`
- les composants liste/detail legacy comme base de decomposition, pas comme reference de comportement
- `src/store/*` pour la persistance locale et le middleware de sync, a condition de rebrancher le bon contrat API

### A supprimer ou sortir du chemin critique

- la logique `/batches/*`
- les reliquats `/assets/{uuid}/decision` s'ils reapparaissent hors des flows deja realignes
- les gates qui resteraient figees sur un runtime smoke trop etroit sans plan d'elargissement
- les baselines visuelles de l'ancienne UI
- les reliquats de scaffolds encore exposes comme pages runtime finales

### A refondre de fond en comble

- orchestration review / apply / purge groupé
- nettoyage contractuel des flows batch
- integration stricte des preconditions `If-Match`

### Constats critiques sur le code courant

1. `src/routes/AppRoutes.tsx` est maintenant largement aligne : routes canoniques presentes pour `review/library/rejects/activity/settings/account`, sous-routes `auth/*`, et details standalone `/asset/:assetId`. Les redirects legacy `detail/:assetId` subsistent a juste titre comme compatibilite.
2. `src/pages/*` ne servent plus majoritairement `UiResetPage`. `Review`, `Library`, `Rejects`, `Activity`, `Account` et `Settings` ont une vraie surface.
3. `src/domain/assets.ts` a recupere une machine a etats bien plus proche du contrat, incluant notamment `READY`, `PROCESSING_REVIEW`, `REVIEW_PENDING_PROFILE`, `DECISION_PENDING`, `DECIDED_*`, `ARCHIVED`, `REJECTED`, `PURGED`. Le gap porte moins sur le modele que sur certains flows qui n'exploitent pas encore tous les etats.
4. `src/api/transport.ts` injecte maintenant `Accept-Language`, et les mutations critiques passent desormais par les endpoints unitaires normatifs. Le reliquat `/batches/moves/*` a ete retire ; le batch reste un concept UI avec application asset par asset.
5. Le mapping `REJECTED` vs `PURGED` a ete corrige. `Library` et `Rejects` sont maintenant separes correctement au runtime.
6. `src/pages/AccountPage.tsx` et `src/pages/SettingsPage.tsx` respectent maintenant la separation cible : identite/sessions/MFA d'un cote, runtime/preferences/admin de l'autre.
7. Le workspace `Review` couvre maintenant le cas bloquant `REVIEW_PENDING_PROFILE` avec choix explicite de `processing_profile` et blocage des decisions tant que la qualification n'est pas terminee. Le reste du travail porte surtout sur le durcissement des conflits, etats limites et signaux de chargement.
8. `src/pages/ActivityPage.tsx` sert maintenant un journal local borne avec filtres explicites, query params et liens retour vers les assets. Le gap restant n'est plus structurel, mais porte sur le polish, la densite d'information et la couverture de validation.
9. Le socle batch/apply a ete nettoye de ses endpoints historiques. Le chantier restant porte davantage sur la stabilisation UX, les rapports agreges et les garde-fous de validation.
