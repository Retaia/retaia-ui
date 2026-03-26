# Best Practices de Développement (UI React + TypeScript)

> Statut : non normatif.
> En cas de conflit : `specs/` prime toujours.

## Objectif

Donner un cadre d'implémentation local pour `retaia-ui` avec React + TypeScript, en priorité TDD et BDD.
Pour le workflow quotidien branch/PR/checks, voir aussi `docs/UI-QUALITY-RUNBOOK.md`.

Contexte actuel:

- le repo est en phase `UI reset`
- la nouvelle implementation n'a pas encore commence
- ce document fixe donc surtout des regles pour la prochaine implementation, pas une description du runtime actuel

## Principes

- Changement petit, lisible, testable.
- Aucun changement de comportement sans alignement sur `specs/`.
- Pas de logique métier dépendante d'un libellé traduit.
- Toujours garder les codes métier/API stables (`STATE_CONFLICT`, `DECISION_PENDING`, etc.).

## React + TypeScript

- React pour l'UI, TypeScript pour le typage strict.
- `strict` TS activé et pas de `any` non justifié.
- Préférer composants simples + hooks isolés.
- Mettre la logique testable hors JSX quand elle devient complexe.
- Extraire les helpers transverses (ex: clavier) dans des modules courts (`src/ui/*`) avec tests unitaires dédiés.
- Centraliser les règles d'activation/désactivation des actions UI dans des helpers purs (`src/domain/*`) testés.
- Si un composant devient trop long (ordre de grandeur > 600 lignes), extraire en priorité:
  - hooks de comportement (`src/hooks/*`)
  - fonctions de mapping/formatage pures
  - sections UI répétitives en sous-composants

## API typée (OpenAPI)

- Générer les types API depuis `specs/api/openapi/v1.yaml`:
  - `npm run api:types:generate`
- Fichier généré: `src/api/generated/openapi.ts`
- Client HTTP typé local: `src/api/client.ts`
- Auth API côté UI:
  - Bearer-only (`UserBearerAuth`) via `POST /auth/login` pour les usages interactifs
  - token Bearer de dev/CI possible via `VITE_API_TOKEN` ou `localStorage["retaia_api_token"]`
  - aucune dépendance `SessionCookieAuth`/cookie session côté runtime
  - hook central `onAuthError(401|403)` dans le client pour gérer les redirects/login

## UI Desktop-like (référence cible locale)

Objectif:

- privilegier une experience de review rapide type application desktop, sans complexifier la surface UI

Important:

- cette section decrit la cible locale d'implementation
- elle ne signifie pas que ces interactions sont deja disponibles dans le repo courant

Le comportement produit cible ne doit pas etre redefini ici.
Pour les routes, libelles, raccourcis, actions groupees et contraintes de parcours, utiliser directement:

- `specs/ui/UI-GLOBAL-SPEC.md`
- `specs/ui/KEYBOARD-SHORTCUTS-REGISTRY.md`
- `specs/workflows/WORKFLOWS.md`
- `specs/state-machine/STATE-MACHINE.md`
- `specs/api/API-CONTRACTS.md`

La doc locale n'ajoute ici que des details d'implementation.

Details d'implementation locaux recommandes:

- shell et composants simples, sans UI-kit lourd
- etat derive explicite dans les controllers
- separation nette entre rendu, orchestration et logique pure
- navigation clavier basee sur un modele accessible (`listbox/option`, `aria-selected`, roving `tabIndex`)
- feedbacks async exposes via live regions (`role="status"` + `aria-live="polite"`)

Registre de gouvernance:

- source de verite produit/UI: `specs/ui/KEYBOARD-SHORTCUTS-REGISTRY.md`
- l'implementation locale doit s'y aligner (priorites, conflits, regles de blocage en saisie)

Règles UX:

- les boutons d'action d'une ligne ne doivent pas déclencher l'ouverture du détail par propagation d'événement
- les raccourcis ne doivent pas interférer avec la saisie dans les champs (`input`, `textarea`, `select`, `contenteditable`)
- navigation clavier: preferer un modele `listbox/option` avec `aria-selected` et roving `tabIndex`
- navigation clavier: garder la ligne active visible (`scrollIntoView` en mode `nearest`)
- retours asynchrones: exposer des live regions (`role="status"` + `aria-live="polite"`)

## TDD (obligatoire par défaut)

Cycle standard:

1. `RED`: écrire un test qui échoue.
2. `GREEN`: implémenter le minimum pour passer.
3. `REFACTOR`: simplifier sans casser les tests.

Règles:

- Tout bug corrigé ajoute un test de non-régression.
- Toute mutation critique UI/API ajoute au moins un test.
- Ne pas faire baisser la couverture sur les fichiers modifiés.

## BDD (scénarios fonctionnels)

Le BDD sert à verrouiller les parcours utilisateurs critiques avec Gherkin.

Parcours prioritaires:

- derives directement de `specs/tests/TEST-PLAN.md`, `specs/workflows/WORKFLOWS.md` et `specs/api/API-CONTRACTS.md`
- ne pas inventer un parcours critique uniquement dans la doc locale

Format attendu:

- `Given` préconditions métier
- `When` action utilisateur
- `Then` résultat visible + code métier/API attendu

## Stratégie de tests UI

- Unitaires: fonctions pures, hooks, utilitaires (rapides).
- Intégration UI: composants + requêtes API mockées.
- BDD/E2E: parcours critiques sur navigateur réel.

Discipline obligatoire pour les tests unitaires :

- un test unitaire couvre une seule unité (fichier/module) à la fois
- toute dépendance externe à cette unité (lib tierce, réseau, filesystem, horloge, aléa, autre module applicatif) est mockée/stubbée/fakée
- une dépendance non mockable proprement implique un reclassement du test en intégration
- les requêtes réseau unitaires passent par mocks (MSW/fetch mock), jamais par un endpoint réel

Mapping recommandé:

- Unit/Integration: Vitest + Testing Library + MSW.
- BDD/E2E: Playwright + Cucumber (Gherkin TypeScript).

Scénarios BDD minimum à garder verts:

- derives du plan de test normatif et du registre de raccourcis normatif
- documentes en local uniquement quand un detail purement technique de test l'exige

## I18N

- `en` et `fr` obligatoires.
- Toute clé UI doit exister dans les 2 locales.
- Fallback strict: `locale utilisateur -> en -> clé brute`.
- Les libellés destructifs (move/purge/reject) doivent être explicites.

Base technique locale disponible dans le repo:

- stack standard `i18next` + `react-i18next`
- ressources i18n dans `src/i18n/resources.ts`
- instance i18n partagée dans `src/i18n/index.ts`
- fallback strict `locale -> en -> key`
- des briques techniques existent pour supporter un futur switch de langue `FR/EN`

## Branching & PR

- Ne jamais développer une feature sur `master`.
- Créer une branche dédiée par feature.
- Convention de nommage locale: `codex/<feature>` (ou équivalent explicite).
- Pousser la branche dès que la feature (ou premier incrément livrable) est créée.
- Créer la PR immédiatement après le push de la branche.
- Base de PR: `master` sauf consigne contraire.
- Garder des commits atomiques dans la branche.
- Pour les commandes détaillées (création branche, rebase, résolution conflits), voir `docs/UI-QUALITY-RUNBOOK.md`.

## Checklist PR

- Objectif unique.
- Specs impactées identifiées.
- Tests ajoutés/ajustés avant merge.
- Aucun mélange massif feature + refactor + formatting.
- Commit messages en Conventional Commits.
- Pour les refactors UI stateful: appliquer la checklist dédiée `docs/PR-CHECKLIST-UI-STATEFUL-REFACTOR.md`.

## Workflow Git recommandé

- Référence opérationnelle unique: `docs/UI-QUALITY-RUNBOOK.md`.

## Standard architecture de page

- Appliquer le standard `Page + Controller + Sections` pour toute nouvelle page feature ou refactor majeur.
- Référence détaillée: `docs/PAGE-CONTROLLER-SECTIONS-STANDARD.md`.

## Scaffold de page

- Pour initialiser une page orchestrée (page + controller + section), utiliser:
  - `npm run scaffold:page -- --name <FeatureName>`
- Détails et limites du générateur: `docs/PAGE-SCAFFOLDING.md`.
