# Brief UI/UX Designer - Retaia UI

## 1) Vue d'ensemble du produit
Retaia UI est une interface web de revue média orientée efficacité opérateur (desktop-first), avec navigation multi-pages.
Objectif: traiter des assets (image/audio/video) via décisions (`KEEP`, `REJECT`, `CLEAR`), piloter les opérations batch, consulter les rapports et l'activité, puis gérer la bibliothèque d'assets archivés.

Principes UX actuels:
- workflow rapide, orienté liste + détail
- raccourcis clavier et actions de masse
- gestion explicite des états runtime (loading, erreurs API, policy serveur)
- i18n FR/EN native

## 2) Architecture implémentée (routes)
- `/` -> redirection vers `/review`
- `/review` -> `Review Workspace`
- `/review/:assetId` -> `Review Workspace` avec asset présélectionné
- `/review/detail/:assetId` -> page détail standalone (contexte review)
- `/batch` -> `Batch Operations`
- `/batch/reports` -> `Batch Reports`
- `/activity` -> `Review Activity`
- `/library` -> `Library` (liste archivés)
- `/library/:assetId` -> `Library` avec asset présélectionné
- `/library/detail/:assetId` -> page détail standalone (contexte library)
- `/auth` -> `Auth`
- `/settings` -> `Settings`
- `*` -> redirection vers `/review`

Navigation primaire implémentée (header persistant):
- `Review`, `Batch`, `Reports`, `Activity`, `Library`
- accès secondaires: `Settings`, `Auth`, switch langue FR/EN

## 3) Écrans et fonctionnalités

### 3.1 Review Workspace (`/review`, `/review/:assetId`)
Écran principal de traitement unitaire.

Contenu:
- header global + navigation primaire
- summary cards (total, pending, keep, reject)
- toolbar de filtres:
  - état (`ALL`, `DECISION_PENDING`, `DECIDED_KEEP`, `DECIDED_REJECT`, `ARCHIVED`)
  - type média (`ALL`, `VIDEO`, `AUDIO`, `IMAGE`, `OTHER`)
  - date (`ALL`, `LAST_7_DAYS`, `LAST_30_DAYS`)
  - recherche texte
- alertes runtime API (assets/policy/bulk)
- panneau d'actions workspace:
  - vues/presets
  - focus pending
  - mode `batch only`
  - décisions de masse sur visibles
  - reset filtres
  - densité de liste
- carte `next pending`
- layout liste + détail

Colonne liste:
- sélection active
- sélection batch (incl. interactions clavier/sélection)
- actions inline par asset (`KEEP/REJECT/CLEAR`)
- états vides contextualisés

Colonne détail:
- preview média (image/video/audio + fallback)
- transcript (si présent)
- décisions `KEEP/REJECT/CLEAR`
- metadata (tags + notes) avec sauvegarde
- purge (preview + confirm)
- statuts (decision/metadata/purge)
- action refresh en cas de conflit d'état API
- CTA vers page détail standalone (`/review/detail/:assetId`)

### 3.2 Batch Operations (`/batch`)
Vue dédiée aux actions batch, sans bruit du workspace.

Fonctions:
- scope batch (pending/keep/reject)
- actions batch (`KEEP batch`, `REJECT batch`, `clear`)
- preview/exécution batch
- timeline d'exécution
- fenêtre d'annulation avant exécution
- statuts preview/execute + retry API

### 3.3 Batch Reports (`/batch/reports`)
Vue dédiée au reporting batch.

Fonctions:
- refresh rapport
- export JSON/CSV
- affichage `batch_id`
- statut de rapport
- rendu data de rapport (moved/failed + erreurs si disponibles)

### 3.4 Review Activity (`/activity`)
Vue dédiée au journal opérateur.

Fonctions:
- `undo` dernière action
- compteur d'historique
- log des actions
- clear log

### 3.5 Library (`/library`, `/library/:assetId`)
Bibliothèque des assets archivés, avec consultation et enrichissement metadata.

Fonctions:
- liste assets `ARCHIVED` (et keep en fallback local)
- recherche sur nom, id et tags
- sélection/lecture détail dans la même page
- édition metadata (tags + notes)
- CTA vers détail standalone (`/library/detail/:assetId`)

Contraintes fonctionnelles:
- pas d'actions de décision ni purge dans la library
- objectif: consultation + enrichissement

### 3.6 Standalone Asset Detail (`/review/detail/:assetId`, `/library/detail/:assetId`)
Page détail commune réutilisée par review et library.

Fonctions:
- même composant de détail que les vues principales
- édition metadata (tags + notes)
- états `loading` et `not found`
- bouton retour contextuel (`Review` ou `Library`)

Différences contextuelles:
- contexte `review`: lecture asset dans scope review
- contexte `library`: lecture asset dans scope archived/library

### 3.7 Auth (`/auth`)
Écran auth modulaire (sous-controllers) pour session et gouvernance d'accès.

Fonctions:
- login/logout
- recovery mot de passe
- vérification email
- MFA/features governance
- paramètres connexion API côté auth

### 3.8 Settings (`/settings`)
Écran configuration runtime.

Fonctions:
- paramètres forcés en lecture seule (env)
- configuration connexion API (base URL/token + test/reset)
- sélection source assets (mock/API)

## 4) Raccourcis et interactions clés
- navigation liste: `j/k`, flèches, `Home/End`, `Enter`
- sélection batch: `Shift+click`, `Shift+Space`, sélection de plage
- actions rapides: `g/v/x`, `p`, `b`, `n`, `d`, `r`, `l`, `1/2/3`, `/`, `?`
- multi-sélection: `Ctrl/Cmd+A`
- undo: `Ctrl/Cmd+Z`
- confirmation batch différée: `Shift+Enter`

## 5) États UX à couvrir en design
- loading/error sur assets, détail, policy, batch, report
- retries API et messages de conflit d'état
- policy serveur qui désactive des actions
- états vides multiples (liste, détail, pending, journal, recherche)
- états de saisie metadata (saving/success/error)
- comportement deep-link + retour contextuel

## 6) Références visuelles existantes (snapshots)
- `tests/visual/ui.visual.spec.ts-snapshots/summary-cards-darwin.png`
- `tests/visual/ui.visual.spec.ts-snapshots/list-detail-open-darwin.png`
- `tests/visual/ui.visual.spec.ts-snapshots/batch-activity-state-darwin.png`
- `tests/visual/ui.visual.spec.ts-snapshots/batch-report-success-table-darwin.png`
- `tests/visual/ui.visual.spec.ts-snapshots/preview-error-state-darwin.png`
- `tests/visual/ui.visual.spec.ts-snapshots/execute-loading-state-darwin.png`

## 7) Notes design pour la version actuelle
- produit desktop-first: prioriser densité lisible et hiérarchie visuelle claire
- dissocier visuellement actions non destructives vs destructives
- maintenir cohérence inter-pages via header/navigation communes
- soigner continuité liste -> détail inline -> détail standalone
- mobile supporté, mais flux expert majoritairement desktop
