# Brief UI/UX Designer - Retaia UI

## 1) Objectif du document
Ce document sert de brief fonctionnel pour le rebranding UI/UX.
Le but est de décrire les fonctionnalités métier et les parcours utilisateur, sans imposer de direction visuelle.

## 2) Les 2 objectifs produit principaux

### 2.1 Ingest / review de nouveaux fichiers
Permettre à l'opérateur de traiter rapidement les nouveaux assets entrants:
- ouvrir un asset (image/audio/video)
- décider `KEEP` ou `REJECT` (et `CLEAR` pour annuler une décision et revenir à l'état `DECISION_PENDING`)
- ajouter/éditer des mots-clés et des notes (single et batch)
- enchaîner les assets en file de review
- exécuter des actions batch avec preview, confirmation et rapport

### 2.2 Recherche et tri de la library
Permettre l'exploitation de la bibliothèque d'assets déjà traités:
- rechercher/filtrer/trier les assets de library
- consulter le détail d'un asset
- ajouter/éditer les mots-clés et notes
- pouvoir `REJECT` un asset déjà validé (`KEEP`) si besoin métier
- gérer les actions en single et batch selon le contexte

## 3) Principes UX attendus
- Priorité à la productivité opérateur (desktop-first, actions rapides).
- Lecture simultanée liste + détail.
- États système explicites (loading, succès, erreur, retry, indisponible).
- Cohérence inter-pages (navigation, terminologie, feedback).
- FR/EN natif.

## 4) Architecture des écrans (fonctionnelle)

### 4.1 Navigation principale
- `Review` (ingest/review de nouveaux assets)
- `Activity` (journal + undo)
- `Library` (recherche/exploitation post-validation)
- accès secondaires: `Auth`, `Settings`, changement langue
- `Batch` et `Reports` sont à considérer comme des vues du mode de traitement batch (pas un pilier métier séparé)

### 4.2 Routes actuelles
- `/` -> redirection `/review`
- `/review`
- `/review/detail/:assetId`
- `/activity`
- `/library`
- `/library/detail/:assetId`
- `/auth`
- `/settings`

## 5) Fonctionnalités par écran

### 5.1 Review Workspace (`/review`)
Fonction: traiter le flux entrant.

Fonctions clés:
- vue liste des assets à traiter
- panneau détail asset (preview média + metadata)
- décisions single: `KEEP` / `REJECT` / `CLEAR` (`CLEAR` = retour à `DECISION_PENDING`)
- édition mots-clés et notes
- filtres (état, type, date) + recherche
- filtres et recherche pilotés par query params API (`state`, `media_type`, `q`, `sort`, `captured_at_from`, `captured_at_to`)
- en mode API: la liste affichée reflète strictement la réponse API (pas de post-filtrage UI)
- sélection batch depuis la liste
- raccourcis clavier opérateur
- accès rapide à l'asset suivant à traiter

### 5.2 Mode Batch (transverse Review + Library)
Fonction: mode de traitement de masse activable depuis les contextes métier (`Review` et `Library`).

Fonctions clés:
- visualiser le scope batch sélectionné
- appliquer décision batch (`KEEP` / `REJECT`)
- preview avant exécution
- confirmation/annulation avant exécution finale
- statuts d'exécution + gestion des erreurs

Contrainte métier (alignement specs):
- le batch reste un concept UI de sélection multiple
- l'application des décisions est traitée asset par asset côté Core (appels unitaires)

Note implémentation actuelle:
- surface intégrée au workspace `/review` (pas de route dédiée)

### 5.3 Reporting Batch
Fonction: rendre lisible le résultat d'une exécution batch (mode batch).

Fonctions clés:
- afficher le statut global du batch
- afficher compteurs succès/échecs
- afficher le détail des erreurs
- export des résultats (JSON/CSV)

Note implémentation actuelle:
- reporting intégré au workspace `/review` (pas de route dédiée)

### 5.4 Activity (`/activity`)
Fonction: traçabilité opérateur.

Fonctions clés:
- historique des actions
- undo de la dernière action
- nettoyage du journal

### 5.5 Library (`/library`)
Fonction: retrouver et réviser les assets déjà traités.

Fonctions clés:
- liste des assets de library (incluant archivés)
- recherche texte API (`q`)
- tri API (`sort`) et filtres API (`state`, `media_type`, `captured_at_from`, `captured_at_to`)
- en mode API: pas de post-filtrage local UI
- consultation du détail asset
- édition mots-clés + notes
- possibilité métier de `REJECT` un asset précédemment validé
- actions single et batch selon les règles produit

### 5.6 Détail standalone (`/review/detail/:assetId`, `/library/detail/:assetId`)
Fonction: focus complet sur un asset.

Fonctions clés:
- vue détail enrichie d'un asset
- preview média + transcript (si disponible)
- édition metadata
- clic sur un mot-clé pour appliquer un filtre/recherche dans la liste d'origine
- actions de décision selon contexte (review/library)
- retour contextuel vers la page d'origine

### 5.7 Auth (`/auth`)
Fonction: identité et accès.

Fonctions clés:
- login/logout
- recovery mot de passe
- vérification email
- MFA / gouvernance features
- configuration connexion API côté session

### 5.8 Settings (`/settings`)
Fonction: configuration runtime de l'application.

Fonctions clés:
- paramètres techniques (API base URL, token)
- test/réinitialisation connexion
- sélection source de données (mock/API)
- affichage des paramètres verrouillés par environnement

## 6) Interactions transverses à couvrir
- actions single et batch cohérentes partout
- feedback immédiat après chaque action (succès/erreur)
- gestion des conflits d'état (asset modifié côté serveur)
- confirmations sur actions sensibles/destructives
- navigation retour fiable avec conservation des query params de filtres
- accessibilité clavier

## 7) États UX obligatoires
- chargement initial et rechargement partiel
- empty states (aucun résultat, aucun asset sélectionné, aucun pending)
- succès d'action (décision, metadata, batch)
- erreurs d'action (API, validation, permission)
- indisponibilité partielle (feature/policy désactivée)
- retry réseau

## 8) Références visuelles existantes
Snapshots utiles comme base de compréhension des flux actuels:
- `tests/visual/ui.visual.spec.ts-snapshots/summary-cards-darwin.png`
- `tests/visual/ui.visual.spec.ts-snapshots/list-detail-open-darwin.png`
- `tests/visual/ui.visual.spec.ts-snapshots/batch-activity-state-darwin.png`
- `tests/visual/ui.visual.spec.ts-snapshots/batch-report-success-table-darwin.png`
- `tests/visual/ui.visual.spec.ts-snapshots/preview-error-state-darwin.png`
- `tests/visual/ui.visual.spec.ts-snapshots/execute-loading-state-darwin.png`

## 9) Ce que le designer est libre de décider
- direction artistique globale (brand, couleurs, typo, iconographie)
- hiérarchie visuelle des écrans
- patterns de navigation (tabs, sidebar, header, etc.)
- densité visuelle desktop/mobile
- design system détaillé (tokens, composants, variants)

Contrainte: préserver la couverture fonctionnelle décrite ci-dessus.
