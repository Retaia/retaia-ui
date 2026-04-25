# UI Audit - Retaia-UI

## 1. Resume executif

Le repo n'est plus en phase de cadrage initial. Les fondations principales sont deja livrées. L'audit utile n'est donc plus "quoi construire en premier", mais "quels ecarts restent reellement ouverts".

Le constat courant est simple :

- la direction produit reste saine : outil de revue humaine local-first, pas DAM generique
- le socle contractuel principal est en place : routes canoniques, workspaces, decisions unitaires, separation account/settings, details standalone, review via derives
- les ecarts restants sont concentres sur trois zones :
  - stabilisation review/apply et conflits optimistic
  - elargissement progressif des gates canoniques
  - arbitrage sur les surfaces secondaires (`Activity`, runtime admin)

## 2. Vision produit vs contraintes specs

### Vision produit issue du README racine

- surface humaine de review et de management
- priorite a la comprehension, la confiance et la durabilite
- review via previews/derives uniquement
- aucune derive vers un media server ou un DAM classique

### Contraintes techniques/metier issues des specs normatives

- Core reste la seule source de verite
- bulk = orchestration UI uniquement
- apply decision = mutation unitaire par asset
- purge = explicite, destructive, reservee a `REJECTED`
- mutations partagees soumises a `If-Match`
- etats/codes stables et non traduits

### Incoherence documentaire toujours a garder en tete

- `README.md` renvoie encore vers `specs/ui/*` comme cadrage important
- `specs/DOCUMENT-INDEX.md` classe pourtant `specs/ui/*` en `NON_NORMATIVE`
- consequence: ces documents UI restent des recommandations, pas le contrat opposable

## 3. Contraintes UI/UX normatives

Ce qui reste structurant pour les travaux a venir :

- rendre la machine a etats lisible
- ne jamais confondre decision et apply
- ne jamais masquer les conflits de concurrence
- ne jamais introduire d'action destructive implicite
- garder toute logique locale strictement subordonnee au serveur

## 4. Parcours utilisateurs encore sensibles

Les parcours suivants sont deja implantes mais demandent encore de la stabilisation ou de la validation supplementaire :

- apply des decisions posees
- gestion des conflits `409` / `412` / `428`
- revue des rejects et purge explicite
- runtime diagnostics / settings admin limites
- activity en tant que journal local borne

## 5. Architecture des interfaces

La cartographie structurelle reste dans `docs/ui-information-architecture.md`.

Le sujet n'est plus l'architecture globale, mais la fermeture des derniers ecarts d'execution.

## 6. Audit de l'existant

### Base saine a conserver

- routing canonique
- shell authentifie
- workspaces `Review`, `Library`, `Rejects`, `Activity`, `Account`, `Settings`
- socle auth/account
- i18n, theme, persistance locale utile
- transport API et mapping principal deja realignes

### Zones encore a surveiller

- orchestration batch/apply et ses etats agreges
- propagation coherente des preconditions
- surfaces admin partielles
- validation BDD canonique encore partielle

### Conclusion operative

Le repo ne demande plus une refonte generale. Il demande une fermeture disciplinee des derniers ecarts contractuels et de validation.
