# UI Architecture

> Statut : non normatif.
> Source de verite produit : `specs/`.
> Le repo est en refonte avancee, mais pas encore complet.

## Objectif

Decrire uniquement:

- l'etat courant du repo pendant la refonte
- la structure technique locale visee pour l'implementation
- les garde-fous d'architecture du code

Ce document ne doit pas redefinir:

- routes
- parcours utilisateur
- vocabulaire visible
- raccourcis globaux
- state machine produit
- contraintes fonctionnelles deja definies dans `specs/`

## Etat courant

Le repository sert deja:

- un shell authentifie canonique
- les routes principales `review/library/rejects/activity/settings/account`
- des surfaces publiques auth
- plusieurs workspaces reels encore a completer sur certains flows

## Reference de pilotage

Les audits de pilotage deja produits et mis a jour sont:

- `docs/ui-audit.md`
- `docs/ui-gap-analysis.md`
- `docs/ui-implementation-plan.md`

Ce document d'architecture ne remplace pas ces audits; il complete seulement la structure technique cible.

## Source de verite produit

Pour tout comportement produit/UI, utiliser directement:

- `specs/ui/UI-GLOBAL-SPEC.md`
- `specs/ui/KEYBOARD-SHORTCUTS-REGISTRY.md`
- `specs/api/API-CONTRACTS.md`
- `specs/workflows/WORKFLOWS.md`
- `specs/state-machine/STATE-MACHINE.md`
- `specs/tests/TEST-PLAN.md`

## Structure technique cible

La structure locale visee reste:

- `pages/` pour la composition par route
- `hooks/` pour l'orchestration d'etat et les side-effects UI
- `components/` pour le rendu pur ou faiblement stateful
- `domain/` pour les regles metier pures
- `application/` pour les use-cases UI/Web
- `infrastructure/` pour les adaptateurs techniques

## Garde-fous d'implementation

- `src/pages/*`: pas d'import direct `api/client`
- `src/application/*`: pas d'import direct `api/*` ni `services/*` hors adaptateurs dedies
- `src/components/*`: pas d'import direct `application/*` ni `api/*`
- `src/hooks/*`: pas d'import depuis `pages/*` ou `components/*`

Principes:

- aucune logique metier UI ne depend d'un libelle traduit
- aucune abstraction locale ne doit recreer un contrat divergent de `specs/`
- la doc locale ajoute des details techniques d'implementation, jamais des regles produit concurrentes

## Auth, runtime et i18n

Localement, l'architecture doit seulement separer proprement:

- pages publiques et surfaces connectees
- adaptation technique auth/runtime
- rendu, orchestration et logique pure
- textes affiches et constantes metier

Les regles produit et contractuelles correspondantes restent dans `specs/`.

## Tests

Le contenu fonctionnel des tests critiques vient de `specs/tests/TEST-PLAN.md`.
Localement, ce repo documente seulement les familles de tests et les garde-fous techniques utilises pour implementer ces exigences:

- unitaires pour la logique pure
- integration pour la composition UI et les adapters
- BDD/E2E pour les parcours critiques definis par `specs/`
- checks i18n et alignement contractuel OpenAPI en CI
