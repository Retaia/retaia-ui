# UI Information Architecture - Retaia-UI

## 5. Architecture des interfaces

### Principes de structure proposes

Origine :

- vision produit : poste de travail operateur, clarte, confiance, usage durable
- contraintes normatives : pas de magie, pas de move implicite, pas de DAM generique
- decision UX proposee : shell desktop-first stable, lecture liste + detail, rail droit contextuel unique

### Navigation cible

#### Surfaces publiques

- `/auth`
- `/auth/reset-password`
- `/auth/verify-email`

Decision UX proposee :

- aucune sidebar ni shell metier sur ces routes
- ces routes portent uniquement l'identite, la recuperation et la verification

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

Decision UX proposee :

- sidebar fixe gauche
- barre de contexte haute
- contenu principal
- rail droit contextuel unique

### Mapping workspace -> etats

| Workspace | Etats principaux concernes | Raison |
| --- | --- | --- |
| `Review` | `READY`, `PROCESSING_REVIEW`, `REVIEW_PENDING_PROFILE`, `DECISION_PENDING`, `DECIDED_KEEP`, `DECIDED_REJECT` | flux entrant, qualification, decision et apply en attente |
| `Library` | `ARCHIVED` | bibliotheque validee et requalifiable |
| `Rejects` | `REJECTED` | espace de suppression differée et re-review |
| `Activity` | aucun etat metier propre | journal UI et resultats d'actions, pas une nouvelle classe metier |

Point critique :

- `DECIDED_KEEP` et `DECIDED_REJECT` ne doivent pas etre absorbes par `Library` ou `Rejects`
- ils representent des decisions posees mais non appliquees

### Cartographie des ecrans/modules

| Ecran/module | Objectif | Donnees affichees | Actions | Dependances API | Contraintes UX | Risque d'interpretation |
| --- | --- | --- | --- | --- | --- | --- |
| Review workspace | traiter le flux entrant | liste assets, detail, etat, derives, metadata humaines, statut processing | choisir profil audio, KEEP, REJECT, CLEAR/reopen si autorise, edit metadata, apply decisions en attente | `GET /assets`, `GET /assets/{uuid}`, `PATCH /assets/{uuid}`, `POST /assets/{uuid}/reopen`, `GET /app/policy` | liste + detail persistants, confirmations explicites, aucun keep/reject avant etat autorise | confondre review et application du move |
| Review detail standalone | focus complet avec retour contexte | detail complet asset + contexte origine | memes actions que le workspace, sans casser le contexte | idem | conserver query params et retour | perdre le contexte de tri/recherche |
| Library workspace | recherche et requalification | assets archives, recherche, filtres, detail | edit metadata, reopen, reprocess | `GET /assets`, `GET /assets/{uuid}`, `PATCH /assets/{uuid}`, `POST /assets/{uuid}/reopen`, `POST /assets/{uuid}/reprocess` | recherche dominante, aucune ergonomie de flux entrant | devenir une mediatheque generique |
| Rejects workspace | revue des assets rejetes et purge | assets rejected, age, historique decision, detail | reopen, reprocess, purge preview, purge execute | `GET /assets`, `GET /assets/{uuid}`, `POST /assets/{uuid}/purge/preview`, `POST /assets/{uuid}/purge`, `POST /assets/purge` | montrer le risque, separer preview et execution | faire croire que `DECIDED_REJECT` = deja supprime |
| Activity workspace | memoire operateur | journal local des actions, resultats, erreurs, correlation ids, raccourcis utiles | clear local, relancer un report si supporte, naviguer vers asset concerne | aucune API dediee obligatoire en v1 | ne pas inventer une timeline serveur globale | promettre un audit backend qui n'existe pas |
| Account | compte, sessions, MFA, prefs utilisateur | profil, sessions interactives, features user, MFA | revoke session, revoke others, setup/enable/disable MFA, user feature toggles | `GET /auth/me`, `GET /auth/me/sessions`, `POST /auth/me/sessions/{session_id}/revoke`, `POST /auth/me/sessions/revoke-others`, `GET/PATCH /auth/me/features`, `POST /auth/2fa/*` | surface separee de `Settings` | melanger compte et config runtime |
| Settings | configuration runtime et ops UI | langue, theme, source API, base URL lockee, token locke, feature/app status si admin, diagnostics si retenus | test connexion, reset config locale, actions admin runtime si exposees | `GET /app/policy`, `GET/PATCH /app/features`, `GET /ops/*` selon role | montrer ce qui est verrouille par env, pas d'illusion de controle local | exposer des commandes admin a tous |

### Modules transverses obligatoires

#### Module media review

- preview video/audio/photo
- waveform
- thumbs video
- fallback lisible si preview indisponible

Contrainte normative :

- lecture via derives Core uniquement

#### Module metadata humaine

- tags libres
- notes
- champs structures
- projects
- localisation dediee si presente

Contrainte normative :

- `projects` doit rester distinct de `location_*` et de `fields`

#### Module selection et actions groupees

- selection multiple
- previsualisation des changements
- confirmation
- execution asset par asset
- resultat agrege

Contrainte normative :

- aucune ressource batch Core

#### Module statut et erreurs

- loading initial
- refetch partiel
- conflits `412/428`
- erreurs auth/authz
- indisponibilite d'une feature
- retry reseau

Contrainte normative :

- ne pas masquer les etats ni les erreurs

## 8. Recommandations UI/UX

### Architecture de l'information

Decision UX proposee :

- `Review` = poste de tri
- `Library` = espace de recherche/requalification
- `Rejects` = espace de suppression differée
- `Activity` = journal de travail, pas espace metier central
- `Account` = identite et sessions
- `Settings` = configuration runtime et preferences

### Navigation

Decision UX proposee :

- un shell unique pour les surfaces connectees
- detail standalone uniquement comme mode focus, jamais comme architecture principale
- retour contexte toujours base sur query params et etat persiste

### Patterns UX

- liste + detail sur desktop
- table par defaut
- grille optionnelle
- rail droit unique pour la selection multiple, l'aide et les statuts transverses
- confirmations obligatoires pour apply decision, purge et toute action groupée sensible

### Gestion des etats

- `READY` et `PROCESSING_REVIEW` : lecture seule, expliquer pourquoi aucune decision n'est disponible
- `REVIEW_PENDING_PROFILE` : l'action primaire est le choix de profil, pas la decision
- `DECISION_PENDING` : l'action primaire est KEEP/REJECT
- `DECIDED_*` : l'action primaire est apply/undo, pas une nouvelle decision silencieuse
- `REJECTED` : purge preview puis confirmation

### Hierarchie visuelle

- etat et action primaire au-dessus de la metadata secondaire
- derive de review au centre
- metadata humaine editable en bloc distinct
- informations techniques et audit dans des panneaux secondaires, jamais en concurrence avec l'action principale

## Recommandations non normatives retenues

Sources : `specs/ui/UI-GLOBAL-SPEC.md`, `UI-REFONTE-RECOMMANDATION.md`, `UI-UX-BRIEF-DESIGNER.md`, `UI-WIREFRAMES-TEXTE.md`, `KEYBOARD-SHORTCUTS-REGISTRY.md`.

Retenues :

- routes canoniques `/review`, `/library`, `/rejects`, `/activity`, `/settings`, `/account`, `/auth/*`
- shell avec sidebar gauche + header contexte + rail droit
- `table` par defaut, `grid` optionnel
- aide raccourcis centralisee
- libelles FR visibles du type `A traiter`, `Bibliotheque`, `A supprimer`

## Recommandations non normatives ignorees ou cadrees

- ouverture automatique du premier asset : ignoree par defaut pour la refonte initiale
  - raison : comportement implicite, risque de confusion apres reprise d'usage
- masquer les etats metier bruts derriere des libelles purement marketing : ignore
  - raison : les specs exigent une visibilite stable de l'etat courant
- toute idee de pages batch dediees ou rapports batch comme piliers de navigation : ignoree
  - raison : batch reste un mode d'interface transverse, pas un workspace produit
- toute extension Activity comme audit serveur complet : ignoree
  - raison : aucune ressource API metier dediee n'est normative aujourd'hui
