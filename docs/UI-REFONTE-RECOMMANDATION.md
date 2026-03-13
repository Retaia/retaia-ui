# Recommandation de refonte UI - Retaia UI

> Statut : recommandation design/UX non normative.
> Base de travail : `README.md`, `docs/UI-UX-BRIEF-DESIGNER.md`, `docs/TAILADMIN-TECHNIQUE.md`, `docs/UI-DESIGN-SYSTEM.md`, `docs/UI-ACCESSIBILITY.md`, `specs/vision/PROJECT-BRIEF.md`, `specs/state-machine/STATE-MACHINE.md`, `specs/definitions/DEFINITIONS.md`.
> Cette proposition ne s'appuie pas sur le code existant et vise uniquement la refonte de l'interface.

## 1. Intent produit

L'UI doit ressembler a un poste de travail operateur, pas a un site marketing ni a un dashboard generique.

Les objectifs prioritaires sont :

- aller vite sur le flux entrant (`A traiter`)
- garder le contexte liste + detail visible en permanence sur desktop
- rendre les actions sensibles explicites
- rendre les etats systeme lisibles sans bruit
- permettre une bascule claire entre travail d'operation (`A traiter`) et travail de recherche/requalification (`Bibliotheque`)

La tonalite visuelle recommandee est :

- sobre
- dense mais respirante
- credible pour un usage long
- plus "outil media de production" que "SaaS admin classique"

Regle de vocabulaire :

- ne pas exposer les noms d'etats metier bruts dans l'UI
- utiliser des libelles orientés utilisateur, courts et immediatement comprehensibles
- reserver les termes techniques/metier aux logs, exports, debug, API et documentation interne

Regle de routing :

- les labels visibles dans l'interface sont traduits
- les URLs restent en anglais, stables et non localisees
- le menu affiche `A traiter`, `Bibliotheque`, `Activite`, `A supprimer`, `Profil`, mais les routes restent techniques

## 2. Direction visuelle

### 2.1 Positionnement

Utiliser Tailadmin comme base structurelle, mais pas comme rendu "template brut".

Direction recommandee :

- shell Tailadmin avec sidebar fixe gauche
- header secondaire discret, integre au contenu
- surfaces par strates, avec contraste propre entre fond, panneaux et focus
- accent coloriel unique pour les actions primaires
- iconographie simple, lignes fines, peu de decoration

Je recommande une identite "studio editorial" :

- typographie UI : `Plus Jakarta Sans` ou `Manrope`
- typographie data/metadata : `JetBrains Mono` ou `IBM Plex Mono`
- rayon modere (`rounded-xl`)
- ombres tres legeres en light, quasi absentes en dark

### 2.2 Theme clair / theme sombre

Le theme doit etre switchable depuis l'interface via un controle visible en sidebar basse ou dans le header utilisateur.

Modes :

- `Systeme`
- `Clair`
- `Sombre`

Comportement recommande :

- premier lancement : `Systeme`
- l'etat choisi reste persistant
- le label visible doit afficher le mode courant, pas seulement une icone

### 2.3 Tokens visuels recommandes

L'implementation devra rester Tailwind/Tailadmin-compatible, mais la refonte doit d'abord definir l'intention de ces tokens :

- `color-bg-app`
- `color-bg-shell`
- `color-bg-panel`
- `color-bg-elevated`
- `color-border-soft`
- `color-border-strong`
- `color-text-primary`
- `color-text-secondary`
- `color-text-muted`
- `color-brand`
- `color-brand-hover`
- `color-success`
- `color-warning`
- `color-danger`
- `color-info`
- `color-selection`

Palette recommandee :

- Light : fond pierre clair legerement teinte, panneaux blancs, accent bleu-cyan profond
- Dark : fond graphite, panneaux ardoise, accent cyan froid

Le dark theme ne doit pas etre un noir pur. Il doit reduire la fatigue visuelle sur sessions longues.

## 3. Architecture visuelle globale

### 3.1 Shell principal

Je recommande un shell en 4 zones :

1. Sidebar gauche fixe
2. Barre de contexte haute dans le contenu
3. Zone centrale liste/detail
4. Rail droit contextuel optionnel pour actions transverses

Structure cible sur desktop :

- sidebar : navigation metier + outils globaux
- content header : titre de page, vue active, compteur, actions rapides
- workspace principal : liste et detail ou vue pleine largeur selon le contexte
- right rail : selection multiple, activite recente, aide raccourcis, metadata secondaire

Condition d'affichage :

- ce shell ne doit etre visible que pour un utilisateur connecte
- si l'utilisateur n'est pas connecte, l'application affiche uniquement l'ecran de connexion
- aucun menu, aucune sidebar, aucun contenu de page metier ne doit etre visible hors connexion

### 3.2 Sidebar

Sidebar Tailadmin revue pour porter les vrais usages metier.

Ordre recommande :

- `A traiter`
- `Bibliotheque`
- `Activite`
- `A supprimer`
- `Profil`

Zone basse :

- switch langue
- switch theme
- etat connexion/source
- `Parametres`
- compte/session

### 3.3 Header de contexte

Le header ne doit pas dupliquer la sidebar. Il sert a orienter le travail de l'operateur.

Contenu recommande selon page :

- titre de page
- sous-titre fonctionnel court
- compteurs utiles
- actions d'environnement
- breadcrumbs seulement sur les vues detail standalone

## 4. Architecture des routes recommandees

L'objectif est de separer les "workspaces" des "vues de focus". Le mode de selection multiple reste un etat d'interface dans `A traiter` et `Bibliotheque`, pas une page ni une route dediee.

### 4.1 Routes principales

- `/review`
- `/library`
- `/activity`
- `/rejects`
- `/profile`
- `/auth`
- `/auth/reset-password`
- `/auth/verify-email`
- `/settings`

### 4.2 Routes de focus detail

- `/review/asset/:assetId`
- `/library/asset/:assetId`
- `/rejects/asset/:assetId`

Ces routes remplacent avantageusement des URLs detail trop techniques, avec retour contextuel et conservation des query params.

### 4.3 Route dediee "A supprimer"

- `/rejects`

Recommandation :

- `A supprimer` doit etre une vue distincte accessible depuis le menu principal
- cette vue a sa propre identite visuelle, ses propres compteurs et ses propres actions

### 4.4 Regle de navigation

Les workspaces gardent leur etat via query params et/ou persistance locale :

- recherche
- filtres
- tri
- densite
- rail droit ouvert/ferme
- mode de selection multiple si necessaire

### 4.5 Regles d'acces par route

Deux statuts suffisent pour cadrer l'UX :

- `authenticated only` : visible uniquement avec une session active
- `public only` : visible uniquement sans session active

Matrice recommandee :

- `/review` -> `authenticated only`
- `/review/asset/:assetId` -> `authenticated only`
- `/library` -> `authenticated only`
- `/library/asset/:assetId` -> `authenticated only`
- `/activity` -> `authenticated only`
- `/rejects` -> `authenticated only`
- `/rejects/asset/:assetId` -> `authenticated only`
- `/profile` -> `authenticated only`
- `/settings` -> `authenticated only`
- `/auth` -> `public only`
- `/auth/reset-password` -> `public only`
- `/auth/verify-email` -> `public only`

Comportement recommande :

- si un utilisateur non connecte tente d'acceder a une route `authenticated only`, il est redirige vers `/auth`
- si un utilisateur deja connecte tente d'acceder a `/auth`, il est redirige vers la page de travail par defaut, recommande : `/review`

## 5. Pages recommandees

## 5.1 Workspace "A traiter"

La page la plus importante doit etre construite comme un poste de tri.

Regle de base :

- `A traiter` et `Bibliotheque` doivent partager le meme layout principal
- la difference vient surtout des actions disponibles, du ton visuel et des priorites d'usage

Structure recommandee :

- barre de contexte avec compteur `A traiter`, filtres rapides, recherche, raccourci `Suivant`
- colonne liste gauche
- panneau detail central
- rail droit pour actions groupees, historique local et aide clavier

Comportements UX :

- ouverture auto du premier asset pertinent si aucun n'est selectionne
- navigation clavier entre items sans perdre le detail
- actions `Conserver`, `Ecarter`, `Annuler` tres visibles et toujours au meme endroit
- edition tags/notes inline dans le detail
- la selection multiple s'active via checkboxes, sans casser la navigation detail
- les actions groupees restent purement UI et s'appliquent aux elements coches
- actions groupees prioritaires : ajouter des tags, retirer des tags, `Conserver`, `Ecarter`, `Annuler`

Ordre de priorite visuelle dans le detail :

1. preview media
2. etat lifecycle
3. actions de decision
4. tags / notes
5. metadata techniques
6. transcript / infos secondaires

### 5.2 Workspace "Bibliotheque"

La `Bibliotheque` reprend le meme patron d'ecran que `A traiter`.

Elle doit favoriser :

- recherche
- facettes
- tri
- consultation
- requalification d'un asset deja traite

Structure recommandee :

- meme structure liste + detail + rail que `A traiter`
- header avec recherche dominante
- facettes et filtres dans une barre secondaire
- liste/resultats en mode table ou cards compactes selon densite
- detail docke a droite sur desktop

Differences avec `A traiter` :

- moins d'urgence, plus de confort de lecture
- pas de logique de file prioritaire comme `Suivant`
- les actions autorisees changent selon le contexte
- la consultation et la recherche prennent le dessus sur le tri rapide
- metadata, tags et transcript prennent plus de place visuelle

### 5.3 Activite

Cette page doit etre pensee comme un journal operateur lisible, pas comme une simple table brute.

Structure recommandee :

- colonne gauche : timeline des actions
- colonne droite : detail de l'entree selectionnee
- top bar : filtres par type d'action, utilisateur, statut, date

Fonctions a rendre visibles :

- `Annuler la derniere action`
- statut de la selection multiple
- erreurs recentes
- vider le journal

### 5.4 Vue "A supprimer"

`A supprimer` doit etre traitee comme une page distincte du menu principal, meme si elle partage des composants avec `Bibliotheque`.

Cette vue doit mettre en avant :

- raison/statut du rejet
- anciennete avant purge
- action `Remettre a traiter` en unitaire
- action `Remettre a traiter` en selection multiple
- action globale `Supprimer definitivement`

Differences avec `Bibliotheque` :

- ton plus prudent et plus explicite
- compteurs lies au nettoyage
- seules les actions differentes doivent changer
- rail droit centre sur anciennete, risque et confirmations

Regle fonctionnelle stricte :

- hors consultation, `A supprimer` reprend au maximum les memes composants que `Bibliotheque`
- en action unitaire, un element peut seulement etre remis a `A decider`
- en selection multiple, plusieurs elements peuvent seulement etre remis a `A decider`
- `Supprimer definitivement` est une action globale distincte, avec confirmation forte
- aucune autre action de decision ne doit etre exposee dans cette vue

### 5.5 Detail standalone

Les vues standalone servent au focus et au partage de contexte.

Composition recommandee :

- header avec retour contextuel
- preview large
- panneau metadata et decisions
- transcript en second niveau
- navigation asset precedent/suivant si le contexte d'origine est connu

### 5.6 Auth

L'ecran Auth doit etre simple, rassurant et distinct du shell operateur.

Architecture recommandee :

- layout centré, split panel leger
- bloc principal login/session
- bloc secondaire recovery, verify email, MFA
- message clair sur la source de connexion et les etats de verrouillage

Regle UX :

- hors connexion, cet ecran remplace entierement l'application visible
- il ne s'affiche pas dans le shell principal
- apres connexion reussie, l'utilisateur entre dans le shell applicatif
- si l'utilisateur est deja connecte, cet ecran ne doit plus etre affiche
- dans ce cas, la route `/auth` redirige vers `/review`

Sous-flux publics a couvrir explicitement :

- `Mot de passe oublie` : demande d'e-mail de reinitialisation
- `Reinitialiser le mot de passe` : formulaire avec token
- `Verification e-mail` : confirmation via token
- `Renvoyer l'e-mail de verification` : action publique ou contextuelle selon le flux retenu

Routes recommandees :

- `/auth` : connexion
- `/auth/reset-password` : saisie du nouveau mot de passe via token
- `/auth/verify-email` : confirmation e-mail via token

Regle UX commune :

- ces vues sont `public only`
- si l'utilisateur est deja connecte, elles redirigent vers `/review`
- elles n'apparaissent jamais dans le shell principal

### 5.7 Parametres

`Parametres` doit etre structure en sections, pas en long formulaire unique.

Sections recommandees :

- connexion API
- source de donnees
- preferences d'interface
- langue et theme
- informations runtime / environment lock

### 5.8 Profil

`Profil` est une page `authenticated only`.

Elle doit permettre de consulter les informations de compte disponibles via l'API, sans melanger cette vue avec `Parametres`.

Contenu recommande :

- identite utilisateur
- e-mail
- etat de verification
- statut de double authentification
- preferences utilisateur si pertinentes
- actions de session utiles comme deconnexion ou gestion de securite disponible

Regle UX :

- `Profil` est visible uniquement avec session active
- si l'API ne permet pas une modification sensible, la page reste consultative sur ce point

### 5.9 Reinitialisation du mot de passe

Cette vue est une page `public only`.

Objectif :

- permettre de definir un nouveau mot de passe apres reception d'un lien e-mail

Contenu recommande :

- message de contexte clair
- champ nouveau mot de passe
- champ confirmation
- etat token invalide ou expire
- succes final avec CTA vers la connexion

Route recommandee :

- `/auth/reset-password`

### 5.10 Verification e-mail

Cette vue est une page `public only`.

Objectif :

- confirmer une adresse e-mail depuis un lien a token
- gerer proprement les cas succes, token invalide et token expire

Contenu recommande :

- message de verification en cours
- etat succes
- etat echec avec possibilite de renvoyer un e-mail
- retour vers la connexion

Route recommandee :

- `/auth/verify-email`

## 6. Modules React reutilisables recommandes

La refonte doit produire un petit ensemble de composants transverses clairs, reutilisables sur plusieurs routes.

### 6.1 Composants coeur

- `WorkspaceShell`
- `SidebarNav`
- `ContextHeader`
- `SplitWorkspace`
- `RightRail`
- `PageSectionCard`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `StatusBanner`

### 6.2 Composants asset

- `AssetList`
- `AssetListToolbar`
- `AssetListItem`
- `AssetSelectionBar`
- `AssetDetail`
- `AssetPreview`
- `AssetMetadataPanel`
- `AssetTagsEditor`
- `AssetNotesEditor`
- `AssetTranscriptPanel`
- `AssetStateBadge`
- `AssetDecisionBar`
- `AssetQuickFacts`

Reutilisation recommandee :

- `AssetList` en `A traiter`, `Bibliotheque`, `A supprimer`
- `AssetDetail` en workspace et en vue standalone
- `AssetDecisionBar` dans `A traiter`, `Bibliotheque`, `A supprimer`, detail d'`Activite`

Regle de partage avec `Bibliotheque` :

- `A supprimer` doit reutiliser la meme structure de page que `Bibliotheque`
- la liste, le detail, les filtres, la recherche et les cartes metadata doivent etre partages
- seules les zones d'actions changent pour respecter les regles de `A supprimer`
- privilegier des composants parametrables plutot que des duplications de page

### 6.3 Composants selection multiple

- `SelectionPanel`
- `SelectionSummary`
- `SelectionActionsForm`
- `SelectionPreviewTable`
- `SelectionExecutionTimeline`
- `SelectionStatusCard`
- `SelectionResultTable`
- `SelectionExportActions`

Ces composants doivent etre montables dans :

- rail droit de `A traiter`
- rail droit de `Bibliotheque`
- page `Activite`

Regle :

- aucun de ces composants ne justifie une route dediee
- ils apparaissent dans le contexte de la page courante quand une selection multiple est active

### 6.4 Composants recherche et filtres

- `SearchInput`
- `FilterBar`
- `FilterChip`
- `DateRangeFilter`
- `MediaTypeFilter`
- `StateFilter`
- `SortControl`
- `SavedViewSelector`
- `DensityToggle`

### 6.5 Composants navigation et feedback

- `ThemeModeSwitch`
- `LanguageSwitch`
- `KeyboardShortcutsHelp`
- `ConnectionStatusPill`
- `UndoToast`
- `ConfirmDialog`
- `DestructiveActionDialog`

## 7. Pattern de layout par page

### 7.1 Pattern A - Workspace split

Usage :

- `A traiter`
- `Bibliotheque`
- `A supprimer`

Structure :

- toolbar horizontale en haut
- liste a gauche
- detail principal au centre
- rail droit contextuel

C'est le pattern principal du produit.

### 7.2 Pattern B - Journal + inspecteur

Usage :

- `Activite`

Structure :

- timeline/table a gauche
- inspecteur detail a droite

### 7.3 Pattern C - Focus detail

Usage :

- `review/asset/:assetId`
- `library/asset/:assetId`

Structure :

- hero media
- panneau actions / metadata
- contenu secondaire en dessous

### 7.4 Pattern D - Form shell

Usage :

- `Auth`
- `Parametres`

Structure :

- contenu recentre ou largeur medium
- sections verticales bien separées

## 8. Recommandation de design system fonctionnel

Le design system doit rester petit. Il faut documenter des primitives et quelques composants metier, pas construire un framework interne.

### 8.1 Echelle de densite

Je recommande 3 densites :

- `comfortable`
- `compact`
- `dense`

Application :

- `A traiter` par defaut en `compact`
- `Bibliotheque` par defaut en `comfortable`
- tables et listes doivent respecter cette echelle sans changer la logique

### 8.2 Hierarchie des actions

Actions primaires :

- `Conserver`
- `Ecarter`
- `Previsualiser`
- `Executer`

Actions secondaires :

- `Annuler`
- `Modifier les tags`
- `Modifier les notes`
- `Actualiser`
- `Exporter`

Actions destructives :

- `Supprimer definitivement`
- `Vider le journal`

Recommandation visuelle :

- `Conserver` et `Ecarter` doivent etre differencies par couleur et libelle
- `Annuler` doit rester neutre
- les actions destructives doivent exiger une confirmation forte

### 8.3 Badges et etats

Le lifecycle doit etre visible partout avec un vocabulaire stable, mais sans afficher les codes ou noms d'etats metier bruts.

Badges recommandes :

- `Nouveau`
- `Pret pour tri`
- `En preparation`
- `Pret a examiner`
- `A decider`
- `Conserve`
- `Ecarte`
- `Classe`
- `A supprimer`
- `Supprime`

Ne pas surcharger avec trop de couleurs. La difference principale doit venir :

- du texte
- de l'icone
- de la priorite visuelle

### 8.4 Regle de copy UI

L'interface ne doit pas parler en langage de machine a etats.

Exemples recommandes :

- afficher `A decider` plutot que `DECISION_PENDING`
- afficher `Conserve` plutot que `DECIDED_KEEP`
- afficher `Ecarte` plutot que `DECIDED_REJECT` ou `REJECTED`
- afficher `Classe` plutot que `ARCHIVED`
- afficher `Pret a examiner` plutot que `PROCESSED`

Si un terme metier doit exister pour des raisons de tracabilite :

- le masquer dans l'UI principale
- le releguer a un niveau secondaire comme un export, un journal technique ou un panneau debug

### 8.5 Dictionnaire de labels UI recommandes

Navigation :

- `Review` -> `A traiter`
- `Library` -> `Bibliotheque`
- `Activity` -> `Activite`
- `Rejects` -> `A supprimer`
- `Settings` -> `Parametres`

Actions :

- `KEEP` -> `Conserver`
- `REJECT` -> `Ecarter`
- `CLEAR` -> `Annuler`
- `Next asset` -> `Suivant`
- `Undo last action` -> `Annuler la derniere action`
- `Selection preview` -> `Previsualiser`
- `Execute` -> `Executer`
- `Selection report` -> `Resultat de la selection`
- `Purge` -> `Supprimer definitivement`

Etats :

- `pending` -> `A traiter`
- `processed` -> `Pret a examiner`
- `archived` -> `Classe`
- `rejected` -> `Ecarte` ou `A supprimer` selon le contexte

Cette table doit servir de base de copywriting pour toute maquette UI.

## 9. Strategie Light/Dark detaillee

### 9.1 Light

Le theme clair doit inspirer la lisibilite editoriale.

Caracteristiques :

- fond global clair legerement chaud
- panneaux blancs
- bordures fines visibles
- textes tres contrastes
- accent froid pour l'interaction

### 9.2 Dark

Le theme sombre doit etre le theme premium de travail long.

Caracteristiques :

- fond app graphite/bleu nuit
- panneaux un ton plus clair que le fond, jamais noirs
- separation par bordures et contrastes de surface, pas seulement par ombre
- media preview bien encadree pour eviter l'effet "trou noir"

### 9.3 Regles de coherence

- les codes couleur de statut doivent garder la meme signification en light et dark
- les overlays, modals et toasts doivent avoir une elevation coherente
- les previews image/video/audio doivent rester lisibles dans les deux themes

## 10. Etats UX obligatoires a mettre en scene

Chaque page critique doit avoir une declinaison visuelle explicite pour :

- chargement initial
- rechargement partiel
- aucun resultat
- aucun asset selectionne
- aucun element a traiter
- succes d'action
- erreur d'action
- conflit d'etat serveur
- indisponibilite de fonctionnalite
- retry reseau

Recommendation :

- utiliser des panneaux d'etat integrés au layout plutot que des popups excessifs
- reserver les toasts aux confirmations breves
- afficher les erreurs actionnables au plus pres de la zone concernee

## 11. Accessibilite et ergonomie

La refonte doit etre desktop-first mais rester navigable integralement au clavier.

Points non negociables :

- focus visible sur liste, filtres, rail droit et dialogues
- raccourcis exposes dans une aide contextuelle
- regions ARIA pour sidebar, liste, detail, selection multiple, activite
- `aria-live` pour succes, erreur, progression d'action groupee
- contraste AA dans les deux themes

Recommendation de confort :

- grandes zones cliquables sur les lignes de liste
- densite compacte sans sacrifier la hauteur de focus
- separation nette entre selection, hover et etat coche

## 12. Proposition de sitemap UX

```text
/
  -> /review

/review
  layout: Workspace split
  sous-vues: liste + detail + rail selection multiple

/review/asset/:assetId
  layout: Focus detail

/library
  layout: Workspace split
  sous-vues: recherche + liste + detail

/rejects
  layout: Workspace split
  vue dediee du menu principal

/library/asset/:assetId
  layout: Focus detail

/rejects/asset/:assetId
  layout: Focus detail

/activity
  layout: Journal + inspecteur

/auth
  layout: Form shell

/settings
  layout: Form shell
```

## 13. Priorites de conception

Si la refonte doit etre sequencee, je recommande cet ordre :

1. Shell global, themes, sidebar, tokens
2. Pattern `Workspace split`
3. `A traiter` complet
4. `Bibliotheque` et `A supprimer`
5. composants de selection multiple transverses
6. `Activite`
7. `Auth` et `Parametres`

## 14. Decision finale recommandee

Je recommande de partir sur une refonte UI avec :

- un shell Tailadmin personnalise et plus editorial
- un pattern dominant liste + detail + rail droit
- une vraie dualite `A traiter` versus `Bibliotheque`
- un theme clair et un theme sombre de meme qualite
- un petit set de composants React reutilisables centres sur les objets metier
- des routes detail explicites et plus lisibles
- un mode de selection multiple strictement integre aux pages de travail, sans route dediee

Cette direction maximise la productivite operateur, reste simple a comprendre, et laisse une base saine pour faire evoluer le design sans reconstruire l'application.
