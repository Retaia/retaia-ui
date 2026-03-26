# UI Architecture

> Statut : non normatif.
> Source de verite produit : `specs/`.
> Le repo est actuellement en phase `UI reset`.

## Objectif

Decrire uniquement:

- l'etat courant du repo pendant `UI reset`
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

Le repository est en `UI reset`:

- l'ancienne UI a ete retiree
- certaines routes existent encore comme points d'entree techniques
- plusieurs pages rendent volontairement un placeholder
- la prochaine etape est l'implementation alignee sur `specs/`

## Etape preparatoire obligatoire

Avant toute implementation fonctionnelle, faire un audit d'ecart code/spec avec le cadrage suivant:

- baseline technique: etat courant du repo en `UI reset`
- reference normative unique: `specs/`
- resultat attendu: liste priorisee des changements a faire par couche (`pages`, `hooks`, `components`, `application`, `domain`, `infrastructure`)

L'audit doit distinguer:

- code reutilisable sans changement majeur
- code a adapter
- code obsolete a supprimer
- zones sans implementation a creer

Cet audit sert de pre-tri technique avant les PR d'implementation.

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
