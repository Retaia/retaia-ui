# UI Architecture - Retaia-UI

## 5. Architecture des interfaces

### Principe directeur

Decision UX proposee:

- organiser l'application comme un poste de travail operateur
- separer clairement les espaces de travail par intention metier
- garder liste + detail + contexte dans les surfaces de production
- releguer debug, technique et administration au second plan

Le produit ne doit pas ressembler a:

- un DAM generique
- un media server
- un dashboard admin a cartes

Il doit ressembler a:

- un outil de tri et de requalification durable
- comprehensible apres plusieurs semaines sans usage
- centre sur l'etat courant, le preview et l'action explicite

### Navigation cible

#### Surfaces publiques

- `/auth`
- `/auth/reset-password`
- `/auth/verify-email`

Decision UX proposee:

- zero shell metier
- zero navigation produit
- une seule responsabilite par page

#### Surfaces authentifiees

- `/review`
- `/review/asset/:assetId`
- `/library`
- `/library/asset/:assetId`
- `/rejects`
- `/rejects/asset/:assetId`
- `/activity`
- `/settings`
- `/account`

Decision UX proposee:

- sidebar gauche fixe
- header de contexte utile, pas decoratif
- panneau principal de travail
- inspecteur droit unique

### Mapping workspace -> etats

| Workspace | Etats principaux | Role |
| --- | --- | --- |
| `Review` | `READY`, `PROCESSING_REVIEW`, `REVIEW_PENDING_PROFILE`, `DECISION_PENDING`, `DECIDED_KEEP`, `DECIDED_REJECT` | traiter le flux entrant et appliquer les decisions deja posees |
| `Library` | `ARCHIVED` | rechercher, consulter, requalifier, rouvrir, reprocesser |
| `Rejects` | `REJECTED` | rouvrir, reprocesser, purger avec prudence |
| `Activity` | aucun etat metier propre | memoire operateur locale, jamais nouvel etat produit |
| `Account` | hors lifecycle asset | identite, sessions, MFA, preferences utilisateur |
| `Settings` | hors lifecycle asset | preferences UI et runtime secondaire |

Point critique:

- `DECIDED_KEEP` et `DECIDED_REJECT` doivent rester visibles comme etats intermediaires, sans etre absorbes par `Library` ou `Rejects`

### Cartographie des ecrans, modules et composants

| Element | Objectif | Donnees affichees | Actions possibles | Dependances API | Contraintes UX | Risque de mauvaise interpretation |
| --- | --- | --- | --- | --- | --- | --- |
| Review workspace | traiter ce qui entre et ce qui attend une decision appliquee | liste, preview, etat, processing, tags, notes, projects, transcript si dispo | choisir profil audio, `KEEP`, `REJECT`, `CLEAR`, edition metadata, preview/apply selection | `GET /assets`, `GET /assets/{uuid}`, `PATCH /assets/{uuid}`, `POST /assets/{uuid}/reopen`, `GET /app/policy` | pas de move implicite; l'action primaire depend de l'etat | confondre decision et move |
| Review standalone detail | focus sans perdre le contexte origine | meme detail que review + contexte de retour | memes actions que review | memes endpoints | conservation du contexte de filtre/tri indispensable | ouvrir une page vide ou decorative |
| Library workspace | retrouver et requalifier | recherche, liste, detail, metadata, projects, transcript si present | edition metadata, `reopen`, `reprocess` | `GET /assets`, `GET /assets/{uuid}`, `PATCH /assets/{uuid}`, `POST /assets/{uuid}/reopen`, `POST /assets/{uuid}/reprocess` | recherche d'abord, pas de logique de file | glisser vers une mediatheque generique |
| Library standalone detail | focus complet d'un asset archive | detail complet + historique de navigation | edition, `reopen`, `reprocess` | idem | retour fiable au workspace | detail placeholder sans valeur |
| Rejects workspace | gerer les assets rejetes avec prudence | liste, detail, anciennete, metadata, statut purge | `reopen`, `reprocess`, preview purge, purge execute | `GET /assets`, `GET /assets/{uuid}`, `POST /assets/{uuid}/reopen`, `POST /assets/{uuid}/reprocess`, `POST /assets/{uuid}/purge/preview`, `POST /assets/{uuid}/purge`, `POST /assets/purge` | risque et irreversibilite visibles | faire croire que `REJECTED` = deja supprime |
| Rejects standalone detail | focus complet avant requalification ou purge | detail complet d'un asset `REJECTED` | memes actions que `Rejects` | idem | confirmation forte et contexte explicite | page decorative, non actionnable |
| Activity | journal local du travail recent | actions locales, erreurs, liens vers assets, timestamps | filtrer, vider le journal, revenir aux workspaces | aucun endpoint metier obligatoire | clairement local-only | le faire passer pour un audit Core |
| Account | securite et sessions utilisateur | profil, verification e-mail, MFA, sessions, feature prefs user | login/logout, MFA, revoke session, revoke others, user features | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `GET /auth/me/sessions`, `POST /auth/me/sessions/*`, `GET/PATCH /auth/me/features`, `POST /auth/2fa/*` | separer identite et runtime | melanger compte et config technique |
| Settings | preferences UI et runtime secondaire | theme, langue, source runtime, diagnostics, flags admin si role | changer theme/langue, test connexion, refresh diagnostics, toggle admin si expose | `GET /app/policy`, `GET /ops/readiness`, `GET/PATCH /app/features` | doit rester secondaire | voler la place des workspaces metier |
| Auth public | acceder au systeme sans shell metier | login, reset password, verify email, aide contexte | login, demande reset, reset, verify, resend | `POST /auth/login`, `POST /auth/lost-password/*`, `POST /auth/verify-email/*` | jamais affiche dans le shell authentifie | laisser voir une UI produit hors session |

### Modules transverses obligatoires

#### Module preview / review media

- video proxy
- audio proxy
- photo preview
- waveform serveur
- fallback explicite si derive indisponible

Contrainte:

- le fallback ne doit pas simuler une donnee serveur non disponible

#### Module metadata humaine

- tags
- notes
- `projects[]`
- champs structures
- localisation dediee si exposee

Contrainte:

- `projects[]` reste distinct de `fields` et de `location_*`

#### Module selection multiple

- selection
- changelog local
- confirmation
- execution asset par asset
- resultat agrege

Contrainte:

- pas d'entite batch backend

#### Module conflits et preconditions

- `412 PRECONDITION_FAILED`
- `428 PRECONDITION_REQUIRED`
- `409 STATE_CONFLICT`
- `423 LOCK_*`

Contrainte:

- le refresh explicite doit faire partie du flux normal, pas d'un coin technique cache

## 8. Recommandations UI/UX

### Architecture de l'information

Decision UX proposee:

- `Review` devient la file de travail principale
- `Library` devient l'espace de recherche et de requalification
- `Rejects` devient un espace prudent, oriente retention et purge
- `Activity` reste volontairement secondaire
- `Settings` et `Account` sortent du coeur operateur

### Navigation

Decision UX proposee:

- un seul shell pour toutes les surfaces connectees
- detail standalone comme mode focus, jamais comme architecture par defaut
- conservation stricte des query params et du contexte de retour
- aucune route dediee au batch ou au reporting batch

### Patterns UX

- desktop-first
- split workspace stable: liste a gauche, preview/detail au centre, inspecteur a droite
- `table` par defaut, `grid` en second mode de travail
- actions unitaires dans le detail
- actions groupees dans le rail droit
- confirmations explicites pour `apply decision`, `purge` et toute action groupee sensible

### Gestion des etats

- `READY` / `PROCESSING_REVIEW`
  - lecture seule
  - expliquer pourquoi aucune decision n'est possible
- `REVIEW_PENDING_PROFILE`
  - bloquer visuellement `KEEP` / `REJECT`
  - mettre le choix de profil au sommet du detail
- `DECISION_PENDING`
  - actions principales: `KEEP` / `REJECT`
- `DECIDED_KEEP` / `DECIDED_REJECT`
  - action principale: appliquer ou annuler
  - jamais re-mapper en "termine"
- `ARCHIVED`
  - actions principales: `reopen` / `reprocess`
- `REJECTED`
  - actions principales: `reopen` / `reprocess` / `preview purge`
- `PURGED`
  - surface informative uniquement

### Clarte des actions critiques

- `KEEP` / `REJECT` ne doivent pas visuellement ressembler a un move
- `Apply decisions` doit toujours afficher le scope exact cible
- `Purge` doit separer:
  - preview d'impact
  - confirmation finale
  - resultat par asset

### Hierarchie visuelle

- preview media en premier
- etat courant et action primaire juste sous le preview
- metadata humaine ensuite
- metadata techniques, audit et infos secondaires en bas ou dans un panneau secondaire
- zero hero marketing dans les surfaces metier

### Recommandations non normatives retenues

| Recommandation | Source | Usage retenu | Pourquoi |
| --- | --- | --- | --- |
| routes `/review`, `/library`, `/rejects`, `/activity`, `/settings`, `/account`, `/auth/*` | `UI-GLOBAL-SPEC.md`, `UI-UX-BRIEF-DESIGNER.md` | retenue | structure claire et deja partiellement alignee avec le code |
| shell avec sidebar gauche + header + rail droit | `UI-GLOBAL-SPEC.md`, `UI-REFONTE-RECOMMANDATION.md`, `UI-WIREFRAMES-TEXTE.md` | retenue | coherence cross-workspace et compatibilite TailAdmin |
| `table` par defaut, `grid` optionnel | `UI-GLOBAL-SPEC.md`, `UI-REFONTE-RECOMMANDATION.md` | retenue | meilleur scan operateur |
| vocabulaire visible FR `A traiter`, `Bibliotheque`, `A supprimer` | `UI-GLOBAL-SPEC.md`, `UI-REFONTE-RECOMMANDATION.md` | retenue | plus clair que `Review` / `Rejects` en FR |
| aide raccourcis centralisee | `KEYBOARD-SHORTCUTS-REGISTRY.md` | retenue | coherence a11y et operateur |

### Recommandations non normatives ignorees ou cadrees

| Recommandation | Source | Decision | Pourquoi |
| --- | --- | --- | --- |
| ouverture automatique du premier asset pertinent | `UI-REFONTE-RECOMMANDATION.md` | ignoree par defaut | trop implicite pour un produit qui doit rester lisible apres reprise d'usage |
| masquer les etats metier derriere des libelles purement "marketing" | `UI-REFONTE-RECOMMANDATION.md` | cadree | les specs imposent une visibilite stable de l'etat courant |
| routes ou pages dediees au batch/reporting | `UI-UX-BRIEF-DESIGNER.md` et variantes locales | ignoree | le batch reste un mode UI transverse |
| faire de `Activity` une timeline produit centrale | `UI-REFONTE-RECOMMANDATION.md` | ignoree | pas de ressource metier backend normative dediee en v1 |
| transformer `Library` en galerie visuelle par defaut | `UI-REFONTE-RECOMMANDATION.md` | ignoree | risque direct de deriver vers un media manager generique |
