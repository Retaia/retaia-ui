# Brief UI/UX Designer - Retaia UI

## 1) Vue d'ensemble du produit
Retaia UI est une interface web de review média orientée productivité "desktop-like".
Objectif principal: permettre à un opérateur de traiter rapidement des assets (image/audio/video) avec décisions `KEEP`, `REJECT`, `CLEAR`, puis d'exécuter des opérations batch et de purge.

Positionnement UX:
- Flux de tri rapide, orienté clavier + actions massives.
- Lecture en liste + panneau détail simultané.
- Gestion d'états complexes (chargement, erreurs API, conflits d'état, policy serveur).
- Bascule FR/EN native.

## 2) Architecture des écrans (routes)
- `/` -> redirection vers `/review`
- `/review` -> écran principal de review
- `/review/:assetId` -> même écran review avec asset présélectionné (deep-link)
- `/auth` -> écran authentification/session/API auth/mfa/recovery
- `/settings` -> écran configuration runtime (API + source assets)
- `*` -> redirection vers `/review`

## 2 bis) Architecture cible recommandée (split écrans)
Pour réduire la complexité de `/review`, améliorer la lisibilité et clarifier les tâches, il est recommandé de séparer le flux en écrans spécialisés.

### 2 bis.1 Nouvelles routes cibles
- `/review` -> `Review Workspace` (tri et décision unitaire)
- `/review/:assetId` -> `Review Workspace` deep-link
- `/batch` -> `Batch Operations` (sélection, preview, exécution)
- `/batch/reports` -> `Batch Reports` (rapport courant + historique/export)
- `/activity` -> `Review Activity` (journal + undo + audit opérateur léger)
- `/auth` -> `Auth` (inchangé sur la route, structuré en onglets)
- `/settings` -> `Settings` (inchangé)

### 2 bis.2 Navigation cible
- Navigation primaire persistante (header ou onglets): `Review`, `Batch`, `Reports`, `Activity`, `Auth`, `Settings`.
- Navigation contextuelle:
  - depuis `Review`, CTA vers `Batch` avec compteur de sélection active.
  - depuis `Batch`, CTA vers `Reports` après exécution.
  - depuis `Reports`, CTA de retour `Review`/`Batch`.

### 2 bis.3 Répartition fonctionnelle cible
#### a) `Review Workspace` (`/review`)
- Header + language switch.
- Summary cards + toolbar filtres/recherche.
- Liste assets + détail + décisions `KEEP/REJECT/CLEAR`.
- Metadata (tags/notes), transcript, media preview.
- Carte `prochain asset`.
- Raccourcis de navigation et décision.
- Hors scope de cet écran cible: exécution batch détaillée, rapport batch détaillé, journal long.

#### b) `Batch Operations` (`/batch`)
- Vue dédiée sélection batch (avec scope et compteur par état).
- Actions batch: `KEEP/REJECT batch`, `clear`, `preview`, `execute`.
- Timeline d'exécution et fenêtre d'annulation.
- Statuts d'exécution et erreurs de preview/execute.
- Option de revenir au workspace pour ajuster la sélection.

#### c) `Batch Reports` (`/batch/reports`)
- Rapport courant (statut, moved/failed, erreurs).
- Historique léger par `batch_id` (si disponible côté API/données).
- Export JSON/CSV.
- États `loading/empty/error/success`.

#### d) `Review Activity` (`/activity`)
- Journal des actions opérateur.
- Undo accessible avec historique explicite.
- Clear log.
- Utile pour supervision QA/opérations, sans polluer la page review.

#### e) `Auth` (`/auth`) en sous-onglets
- Onglets recommandés: `Session`, `Recovery`, `Email verification`, `2FA & Features`, `API Connection`.
- Évite un long écran formulaire monolithique.

## 3) Écran principal: Review (`/review`)
Écran cœur de l'application. Structure en blocs empilés puis zone liste/détail en 2 colonnes desktop.

### 3.1 Header global
- Titre + logo + sous-titre produit.
- Navigation rapide vers `Configuration` et `Authentification`.
- Switch langue FR/EN.

### 3.2 Cartes de synthèse (Summary)
4 KPIs visuels:
- Total assets
- Assets en attente (`DECISION_PENDING`)
- Assets `KEEP`
- Assets `REJECT`

Usage UX: donner le statut global en un coup d'oeil.

### 3.3 Toolbar de filtres
Contrôles:
- Filtre état (`ALL`, `DECISION_PENDING`, `DECIDED_KEEP`, `DECIDED_REJECT`)
- Filtre type média (`ALL`, `VIDEO`, `AUDIO`, `IMAGE`, `OTHER`)
- Filtre date de capture (`ALL`, `LAST_7_DAYS`, `LAST_30_DAYS`)
- Recherche texte (nom ou identifiant)

### 3.4 Alertes de statut runtime (mode API)
Alertes contextuelles:
- Chargement assets en cours
- Échec chargement assets (fallback snapshot local)
- Chargement policy runtime
- Policy indisponible
- Bulk désactivé par policy serveur

### 3.5 Panneau "Actions rapides"
Bloc riche, structuré en sous-sections.

#### a) Actions générales
- Vues enregistrées: `Standard`, `À traiter`, `Batch`
- Presets filtres: `À traiter (7j)`, `Images rejetées`, `Review média (30j)`
- `Voir à traiter`
- Toggle `Batch seul ON/OFF`
- Décisions en masse sur assets visibles: `KEEP visibles`, `REJECT visibles`
- `Réinitialiser filtres`
- Toggle densité liste `confortable/compacte`

#### b) Actions batch
- Indicateur taille batch sélectionné
- Décision en masse sur batch: `KEEP batch`, `REJECT batch`
- `Vider batch`
- `Prévisualiser batch`
- `Exécuter batch`
- Timeline visuelle d'exécution (queued/running/done/error)
- Fenêtre d'annulation avant exécution API + bouton `Annuler exécution`

#### c) Statuts batch
Messages success/erreur pour:
- preview
- execute
- retries API

#### d) Rapport batch
- `Rafraîchir rapport`
- `Exporter JSON`
- `Exporter CSV`
- Affichage `batch_id`
- Vue rapport:
  - statut global
  - compteurs moved/failed
  - table synthèse
  - table d'erreurs (`asset_id`, `reason`)

#### e) Historique et journal
- `Annuler dernière action` (undo)
- compteur d'historique
- journal des actions utilisateur
- `Vider journal`

#### f) Aide raccourcis
- bouton afficher/masquer overlay raccourcis
- overlay structuré (navigation, batch, flow)
- CTA rapides depuis l'overlay (`Aller à traiter`, `Basculer batch seul`, `Ouvrir prochain`)

### 3.6 Carte "Prochain asset à traiter"
- Met en avant le prochain `DECISION_PENDING`.
- Actions directes: `Ouvrir`, `KEEP`, `REJECT`.
- État vide: message quand plus aucun pending.

### 3.7 Zone principale liste + détail
#### Colonne gauche: Liste assets
- Titre avec compteur dynamique.
- Statut sélection active.
- Statut taille batch active.
- Aide interaction (`clic` pour détail, `Shift+clic` pour batch).
- Ligne asset:
  - nom
  - id + état
  - badge `Batch` si sélectionné
  - actions inline `KEEP/REJECT/CLEAR`
- États visuels:
  - actif sélectionné
  - surlignage batch
  - densité confortable/compacte
- États vides:
  - aucun résultat filtre/recherche
  - batch-only actif mais vide

#### Colonne droite: Détail asset
- Identité asset: nom, id, état.
- Aperçu média:
  - image (thumbnail)
  - vidéo (player)
  - audio (player + waveform image ou fallback waveform)
  - fallback "aperçu indisponible"
- Bloc transcription (si disponible): extrait + statut transcript.
- Actions décision: `KEEP`, `REJECT`, `CLEAR`.
- Éditeur metadata:
  - tags ajout/suppression
  - notes
  - sauvegarde
- Bloc purge (destructif):
  - `Prévisualiser purge` (obligatoire avant confirmation)
  - `Confirmer purge`
- Messages de statut:
  - purge
  - décision
  - metadata
- Action de refresh asset en cas de conflit d'état API.
- État vide (aucun asset sélectionné).

## 4) Écran Auth (`/auth`)
Écran dédié à l'identité utilisateur et à la connectivité API côté session.

### 4.1 En-tête de page
- Titre + sous-titre
- boutons vers `Configuration` et `Retour review`

### 4.2 Section compte utilisateur/auth
- État connecté/déconnecté.
- Login:
  - email
  - mot de passe
  - OTP TOTP (optionnel ou requis selon contexte)
  - bouton connexion
- Logout si connecté.
- Message lock si auth imposée par variable d'env.

### 4.3 Mot de passe oublié
- Mode `demande reset` (email)
- Mode `reset` (token + nouveau mot de passe)
- messages succès/erreur

### 4.4 Vérification email
- Mode `demande`
- Mode `confirmation token`
- Mode `admin confirmation` (si rôle admin)
- messages succès/erreur

### 4.5 Gouvernance 2FA
- Section admin: activer/désactiver feature globale 2FA.
- Section utilisateur:
  - disponibilité 2FA selon policy
  - opt-in/opt-out utilisateur
  - setup 2FA (secret + provisioning URI)
  - activation/désactivation 2FA via OTP
  - statuts succès/erreur

### 4.6 Paramètres connexion API (dans Auth)
- base URL API runtime
- actions `Enregistrer`, `Tester`, `Vider`
- statuts succès/erreur + statut retry

## 5) Écran Settings (`/settings`)
Écran de configuration runtime technique.

### 5.1 Section lecture seule "paramètres forcés"
Affiche les valeurs effectives:
- base URL API
- token API défini/non défini
- source assets effective (`MOCK`/`API`)
- mode mock DB in-memory ON/OFF
- messages si verrouillage par variables d'environnement

### 5.2 Section connexion API
- édition base URL + token
- `Enregistrer connexion`
- `Tester connexion`
- `Vider connexion`
- feedback succès/erreur

### 5.3 Section source des assets
- radio `Mock local` / `API réelle`
- `Enregistrer source`
- `Réinitialiser source`
- feedback succès/erreur
- section désactivée si source lockée par env

## 6) Interactions clés (UX desktop)
- Sélection simple: clic.
- Ajout/retrait batch: `Shift+clic` ou `Shift+Space`.
- Sélection de plage: `Shift+ArrowUp/Down`.
- Navigation liste: `j/k`, flèches, `Home/End`, `Enter`.
- Actions rapides: `g/v/x`, `p`, `b`, `n`, `d`, `r`, `l`, `1/2/3`, `/`, `?`.
- Sélection massive: `Ctrl/Cmd+A`.
- Undo: `Ctrl/Cmd+Z` + bouton.
- Confirmation exécution batch différée: `Shift+Enter`.

## 7) États UX importants à couvrir en design
- Chargement assets / policy / exécution batch.
- Erreurs API (preview, execute, rapport, décision, purge, metadata).
- Retentatives réseau (retry status).
- Policy serveur qui désactive des actions bulk.
- Conflit d'état (refresh asset proposé).
- États vides multiples (liste vide, batch-only vide, next pending vide, détail vide, journal vide).
- Verrouillages de configuration via variables d'environnement.

## 8) Références visuelles existantes (snapshots)
Baselines Playwright utiles pour direction UI:
- `tests/visual/ui.visual.spec.ts-snapshots/summary-cards-darwin.png`
- `tests/visual/ui.visual.spec.ts-snapshots/list-detail-open-darwin.png`
- `tests/visual/ui.visual.spec.ts-snapshots/batch-activity-state-darwin.png`
- `tests/visual/ui.visual.spec.ts-snapshots/batch-report-success-table-darwin.png`
- `tests/visual/ui.visual.spec.ts-snapshots/preview-error-state-darwin.png`
- `tests/visual/ui.visual.spec.ts-snapshots/execute-loading-state-darwin.png`

## 9) Notes design à retenir
- L'application est fortement orientée efficacité opérateur (densité info + vitesse d'action).
- Le design doit prioriser lisibilité des états et différenciation claire des actions destructives/non destructives.
- Le comportement mobile existe (layout responsive Bootstrap), mais la logique principale est pensée "desktop review workflow".

## 10) Mapping "état actuel -> architecture cible"
- `ActionQuickPanelSection`:
  - garder dans `/review` (actions de filtrage/navigation)
  - retirer les actions batch lourdes
- `ActionBatchSection`:
  - déplacer vers `/batch`
- `ActionReportSection` + `BatchReportView`:
  - déplacer vers `/batch/reports`
- `ActionJournalSection`:
  - déplacer vers `/activity` (ou résumé réduit dans `/review`)
- `ActionShortcutsSection`:
  - garder dans `/review` (aide usage expert)
- `NextPendingCard`:
  - garder dans `/review`

## 11) Gains UX attendus du split
- Réduction de la charge cognitive sur l'écran principal.
- Hiérarchie d'actions plus claire (tri unitaire vs opérations batch).
- Meilleure découvrabilité des rapports et de l'activité.
- Plus grande cohérence mobile (écrans plus courts, sections moins denses).
- Maintenance UI plus simple (composants mieux bornés par contexte métier).
