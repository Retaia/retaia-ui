# Audit D'Ecart Implementation

> Statut : document de travail local.
> Reference normative unique : `specs/`.
> Baseline auditée : ce document decrit l'audit initial pre-refonte et n'est plus la photographie courante du runtime.

## Objectif

Identifier l'ecart entre:

- la cible normative definie dans `specs/`
- le code actuellement present dans `retaia-ui`

Le but n'est pas de redefinir le produit, mais de preparer l'implementation des changements en separant:

- ce qui est reutilisable
- ce qui doit etre adapte
- ce qui doit etre supprime
- ce qui doit etre cree from scratch

## Sources auditees

- `specs/ui/UI-GLOBAL-SPEC.md`
- `specs/workflows/WORKFLOWS.md`
- `specs/state-machine/STATE-MACHINE.md`
- `specs/tests/TEST-PLAN.md`
- `specs/policies/I18N-LOCALIZATION.md`
- `specs/policies/AUTHZ-MATRIX.md`
- `src/routes/AppRoutes.tsx`
- `src/pages/*`
- `src/hooks/*`
- `src/components/*`
- `src/api/*`
- `bdd/features/*`

## Resume executif

Note de statut:

- ce document conserve l'audit initial qui a servi a lancer la refonte
- plusieurs constats ci-dessous ne sont plus vrais dans l'etat courant du repo
- pour l'etat courant, utiliser en priorite `docs/ui-audit.md`, `docs/ui-gap-analysis.md` et `docs/ui-implementation-plan.md`

Au moment de cet audit initial, le repo contenait encore beaucoup de briques de l'ancienne UI et l'interface effectivement servie etait un reset partiel base sur placeholders.

Constat principal:

- la structure technique de base existe encore
- plusieurs briques transverses restent exploitables
- les routes, surfaces et parcours servis aujourd'hui ne sont pas conformes a la spec finale
- une partie importante des hooks, composants et scenarios BDD appartient a une UI legacy a requalifier avant reuse

Conclusion d'audit:

- ne pas repartir de zero sur tout le repo
- ne pas considerer non plus le code courant comme deja conforme
- repartir d'un plan mixte `reuse + refactor + suppression + creation`

## Statut d'obsolescence

Les points suivants ont ete majoritairement traites depuis cet audit initial:

- routes canoniques et details standalone
- shell authentifie
- workspaces `Review`, `Library`, `Rejects`
- surfaces `Account` et `Settings`
- injection `Accept-Language`

Les points encore pertinents dans ce document sont surtout:

- la dette batch/apply hors contrat
- `REVIEW_PENDING_PROFILE`
- `Activity`
- la reecriture BDD/E2E legacy

## Ecarts normatifs prioritaires

### 1. Routes canoniques non alignees

Spec:

- workspaces requis: `/review`, `/library`, `/rejects`, `/activity`, `/settings`, `/account`, `/auth`, `/auth/reset-password`, `/auth/verify-email`
- details requis: `/review/asset/:assetId`, `/library/asset/:assetId`, `/rejects/asset/:assetId`

Etat courant:

- routes presentes: `/review`, `/activity`, `/library`, `/auth`, `/settings`
- routes absentes: `/rejects`, `/account`, `/auth/reset-password`, `/auth/verify-email`
- details actuels: `/review/detail/:assetId`, `/library/detail/:assetId`

Impact:

- refonte obligatoire du routing
- migration des deep-links existants
- realignement BDD/E2E et query params de retour contexte

### 2. Shell UI global non implemente

Spec:

- sidebar gauche fixe
- barre de contexte haute
- zone liste/detail
- rail droit contextuel
- langue/theme/compte/parametres en bas de sidebar

Etat courant:

- aucune surface shell metier servie
- pages principales = `UiResetPage`
- aucun switch de langue visible
- theme provider disponible mais non expose dans une UI finale

Impact:

- creation d'un shell application connecte
- wiring explicite theme/langue/account/settings

### 3. Workspaces produit incomplets

Spec:

- review
- library
- rejects
- activity
- account
- auth public sans shell metier

Etat courant:

- `Review`, `Library`, `Auth`, `Settings` rendent des placeholders
- `ActivityPage` re-route vers un reset review-like
- `Rejects` et `Account` absents du routing

Impact:

- implementation de pages canonique par workspace
- separation claire pages publiques auth vs shell connecte

### 4. Details asset non conformes

Spec:

- routes `/review/asset/:assetId`, `/library/asset/:assetId`, `/rejects/asset/:assetId`
- retour contexte avec query params utiles conserves
- bloc `Projects` visible si present
- visibilite minimale des etats metier

Etat courant:

- detail standalone en placeholder
- convention de route non conforme (`detail` au lieu de `asset`)
- contexte `rejects` absent

Impact:

- detail asset a reimplementer sur routes canoniques
- breadcrumb/retour contexte a reconstruire

### 5. Lifecycle batch UI a revalider

Spec:

- machine UI batch normative: `idle -> selection_active -> changes_pending -> confirmation_open -> executing -> result_ready`
- preview, confirmation explicite, resultat agrege obligatoires
- zero appel Core si annulation avant confirmation

Etat courant:

- beaucoup de logique batch subsiste dans `application/review/*`, `hooks/*`, `components/*`
- mais aucune de ces surfaces n'est actuellement servie
- le code existant suit une ancienne UX desktop-like a requalifier

Impact:

- audit detaille des hooks batch avant reuse
- reutilisation possible de logique pure
- reimplementation probable du rendu et de l'orchestration de page

### 6. BDD/E2E majoritairement legacy

Etat courant:

- seule la smoke `@ui-reset` est alignee sur le runtime actuel
- la majorite des features sont taggees `@legacy-ui`
- plusieurs scenarios couvrent d'anciennes routes et une ancienne UX

Impact:

- ne pas prendre les BDD legacy comme verite produit
- les reclasser en materiau d'audit, pas en suite de validation finale
- reecrire la suite normative a partir de `specs/tests/TEST-PLAN.md`

### 7. Transport i18n non aligne

Spec:

- tous les endpoints REST v1 partages acceptent `Accept-Language`
- le client doit l'envoyer pour les messages humains
- les payloads metier restent stables et non dependants de la locale

Etat courant:

- les types OpenAPI generes exposent `Accept-Language`
- `src/api/transport.ts` n'injecte pas ce header
- l'i18n UI locale existe, mais le transport API n'est pas encore branche sur la locale utilisateur

Impact:

- ajouter `Accept-Language` dans le client API
- verifier que les erreurs/messages UI restent codes-first
- verifier les formats date/heure/nombre par locale utilisateur

### 8. Feature flags / policy runtime a requalifier

Spec:

- la disponibilite fonctionnelle est gouvernee par Core
- `GET /app/policy` est la source runtime canonique
- `GET /app/features` et `GET /auth/me/features` gouvernent les switches app et user
- la resolution effective ne doit jamais dependre d'une heuristique locale

Etat courant:

- une partie du socle existe (`getAppPolicy`, `getAppFeatures`, `getUserFeatures`)
- `useReviewDataController` poll `GET /app/policy`
- des structures `feature_governance`, `app_feature_enabled`, `effective_feature_enabled` existent
- ces briques ne sont pas aujourd'hui exposees dans une UI finale servie

Impact:

- revalider endpoint par endpoint le comportement attendu
- reconnecter les features runtime a la nouvelle UI
- verifier que les surfaces conditionnelles utilisent bien l'etat effectif venant de Core

### 9. Auth / account / sessions incomplets

Spec:

- `auth`, `reset-password`, `verify-email`, `account`, `settings`
- sessions utilisateur visibles et revocables
- MFA, features user/admin, policy admin, recovery et verification email alignes contrat

Etat courant:

- des hooks auth riches existent
- le routing final manque (`/account`, routes auth derivees)
- les pages actuellement servies sont des placeholders
- l'API client expose de nombreux endpoints auth, mais pas encore toute la surface sessions dans l'UI finale

Impact:

- auditer le scope exact des hooks auth existants
- separer ce qui releve de `/auth`, `/account` et `/settings`
- ajouter explicitement la gestion des sessions si absente de l'UI reconstruite

### 10. Mapping state machine -> workspaces a refaire

Spec:

- review, library et rejects doivent rendre visibles des sous-ensembles metier coherents
- `REVIEW_PENDING_PROFILE` reste dans la surface review
- `ARCHIVED` appartient a `library`
- `REJECTED` appartient a `rejects`
- `PURGED` n'est pas listable dans la navigation courante

Etat courant:

- `useLibraryPageController` filtre `ARCHIVED` mais integre aussi des hypotheses legacy (`DECIDED_KEEP`)
- aucun workspace `rejects`
- le rendu final des etats metier n'est pas implemente

Impact:

- redefinir clairement les requetes et filtres par workspace
- realigner les listes et details sur la machine a etats normative
- verifier la visibilite minimale de chaque etat dans la nouvelle UI

## Briques reutilisables

### Reutilisation forte probable

- `src/api/*`
  client API, parsing, erreurs, transport, contrat OpenAPI genere
- `src/i18n/*`
  base i18n `fr/en` deja en place
- `src/ui/tailadmin-theme.tsx`
  gestion `system/light/dark` deja presente
- `src/services/workspaceQueryParams.ts`
  bonne base pour persistance query params workspace
- `src/services/workspaceContextPersistence.ts`
  bonne base pour selected asset, scroll, retour contexte
- `src/store/*`
  structure Redux exploitable si revalidee slice par slice
- `src/components/app/AppHeader.tsx`
  base de shell/sidebar/theme/langue exploitable, mais a realigner sur les routes et labels canoniques

### Reutilisation partielle probable

- `src/hooks/useAuthPageController.ts`
- `src/hooks/auth/*`
- `src/hooks/useLibraryPageController.ts`
- `src/hooks/useReviewPageController.ts`
- `src/hooks/useReviewDataController.ts`
- `src/application/review/*`
- `src/components/auth/*`
- `src/components/library/*`
- `src/components/review/*`

Lecture d'audit:

- la logique API et une partie de la logique metier semblent recuperables
- le shape public, les routes, les labels et les surfaces devront etre revalidees contre `specs/`

## Code a supprimer ou a releguer

### Suppression/remplacement probable

- `src/pages/UiResetPage.tsx`
- pages placeholders actuelles (`AuthPage`, `LibraryPage`, `ReviewPage`, `SettingsPage`, `StandaloneAssetDetailPage` sous leur forme courante)
- conventions de routes `*/detail/:assetId`

### Relegation legacy probable

- scenarios BDD `@legacy-ui`
- composants/pages non conformes aux routes et au shell cibles
- toute logique qui encode un vocabulaire visible divergent de `specs/ui/UI-GLOBAL-SPEC.md`

## Plan de changements recommande

### Phase 1. Routing et shell

- mettre en place les routes canoniques
- ajouter le shell connecte
- ajouter les surfaces auth publiques sans shell metier
- exposer le switch langue `FR/EN`
- exposer theme `system/light/dark`

### Phase 2. Fondations workspace

- stabiliser query params et retour contexte
- stabiliser persistence `selectedAssetId`, scroll, route de retour
- realigner les routes detail `/asset/:assetId`

### Phase 3. Review

- reconstruire le workspace review autour des etats et transitions normatifs
- requalifier la logique batch existante
- rebrancher decisions, undo, preview, execute, report

### Phase 4. Library / Rejects / Activity

- implementer `/library`
- creer `/rejects`
- implementer `/activity`
- brancher les details standalone correspondants

### Phase 5. Auth / Account / Settings

- implementer `/auth`
- implementer `/auth/reset-password`
- implementer `/auth/verify-email`
- implementer `/account`
- implementer `/settings`

### Phase 6. Tests

- conserver la smoke `@ui-reset` tant que la nouvelle UI n'est pas livree
- reecrire progressivement les BDD legacy selon `specs/tests/TEST-PLAN.md`
- garder la CI sur la suite complete, pas uniquement `critical`

## Backlog technique initial

### Lot A. Architecture et routes

- remplacer `AppRoutes` par le routing canonique spec
- introduire un layout shell authentifie
- introduire un layout auth public

### Lot B. Etat et persistence

- verifier slices Redux existantes
- verifier mapping query params <-> workspace state
- verifier `lastRoute` / retour contexte / breadcrumb

### Lot C. API et contrats

- revalider `src/api/client.ts` endpoint par endpoint face a `specs/api/API-CONTRACTS.md`
- verifier coverage auth (`login`, `refresh`, `2FA`, recovery, verify email, features, policy)
- verifier erreurs normatives et `Accept-Language`
- verifier polling policy, backoff 429 et resolution des feature flags runtime

### Lot D. UI par workspace

- review
- library
- rejects
- activity
- auth
- account
- settings

### Lot E. BDD/E2E

- classer les scenarios existants en:
  - a rewriter
  - a adapter
  - a supprimer
- preparer une nouvelle matrice de scenarios a partir de `specs/tests/TEST-PLAN.md`

### Lot F. Auth / i18n / governance

- brancher `Accept-Language` dans le client API
- exposer la locale utilisateur dans la nouvelle UI
- verifier `app/features`, `auth/me/features`, `app/policy`
- verifier la separation `auth` / `account` / `settings`

## Decision de demarrage recommandee

Pour l'implementation, demarrer par:

1. routing canonique + shell
2. switch langue/theme expose
3. review workspace minimal conforme
4. detail asset canonique avec retour contexte

Ensuite seulement:

5. library / rejects / activity
6. auth / account / settings
7. reecriture BDD complete

## Statut d'audit

Audit initial prepare.
Il sert de base de travail pour ouvrir les prochains lots de changements dans le code.
