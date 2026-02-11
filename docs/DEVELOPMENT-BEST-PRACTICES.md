# Best Practices de Développement (UI React + TypeScript)

> Statut : non normatif.
> En cas de conflit : `specs/` prime toujours.

## Objectif

Donner un cadre d'implémentation local pour `retaia-ui` avec React + TypeScript, en priorité TDD et BDD.

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

## API typée (OpenAPI)

- Générer les types API depuis `specs/api/openapi/v1.yaml`:
  - `npm run api:types:generate`
- Fichier généré: `src/api/generated/openapi.ts`
- Client HTTP typé local: `src/api/client.ts`
- Auth API côté UI:
  - session cookie envoyée par défaut (`credentials: include`)
  - token Bearer optionnel via `VITE_API_TOKEN` (dev/CI) ou `localStorage["retaia_api_token"]`
  - hook central `onAuthError(401|403)` dans le client pour gérer les redirects/login

## UI Desktop-like (référence locale)

Objectif:

- privilégier une expérience de review rapide type application desktop, sans complexifier la surface UI

Layout cible:

- split view: liste à gauche, détail à droite
- barre d'actions rapides visible en permanence
- panneau batch explicite (taille du batch + actions)
- journal d'actions visible pour comprendre les opérations récentes
- annulation explicite de la dernière action

Interactions souris:

- `clic` sur une ligne asset: ouvre le panneau détail (sans modifier le batch)
- `Shift+clic` sur une ligne asset: ajoute/retire l'asset du batch
- actions explicites: `KEEP`, `REJECT`, `CLEAR` par asset
- purge asset rejeté: `Prévisualiser purge` puis `Confirmer purge` (2 étapes obligatoires)
- actions batch explicites: `KEEP batch`, `REJECT batch`, `Vider batch`

Raccourcis clavier desktop:

- `j` / `k`: navigation dans la liste visible
- `Flèche haut` / `Flèche bas`: navigation dans la liste visible
- `Shift + Flèche haut/bas`: étend une sélection de plage dans le batch
- `Entrée`: ouvre le premier asset visible si aucun détail n'est ouvert
- `Shift+Espace`: ajoute/retire l'asset sélectionné au batch
- `Ctrl/Cmd+A`: ajoute tous les assets visibles au batch
- `Ctrl/Cmd+Z`: annule la dernière action (décision/batch/filtre)
- `n`: ouvre le prochain asset en `DECISION_PENDING` et recentre le contexte
- `b`: bascule l'affichage "batch seul" sans quitter le contexte courant
- `n`: ouvre le prochain asset en `DECISION_PENDING` et recentre le contexte

Règles UX:

- les boutons d'action d'une ligne (`KEEP/REJECT/CLEAR`) ne doivent pas déclencher l'ouverture du détail par propagation d'événement
- garder un état visuel clair pour l'item sélectionné (focus détail) et pour l'item présent dans le batch
- les raccourcis ne doivent pas interférer avec la saisie dans les champs (`input`, `textarea`, `select`)
- journal d'actions: afficher des libellés compréhensibles côté utilisateur (`KEEP visibles`, `REJECT batch`, etc.)
- fournir une action explicite pour vider le journal sans impacter les données métier
- undo borné: limiter l'historique pour éviter la croissance mémoire côté client
- navigation clavier: préférer un modèle `listbox/option` avec `aria-selected` et roving `tabIndex`
- navigation clavier: garder la ligne active visible (`scrollIntoView` en mode `nearest`)
- retours asynchrones (preview/execute/report): exposer des live regions (`role="status"` + `aria-live="polite"`)
- exécution batch: déclencher un chargement automatique du rapport quand `batch_id` est disponible

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

- Review d'asset
- Décision `KEEP/REJECT`
- Batch move (preview + execute + report)
- Purge confirmée
- i18n `en/fr` + fallback `en`

Format attendu:

- `Given` préconditions métier
- `When` action utilisateur
- `Then` résultat visible + code métier/API attendu

## Stratégie de tests UI

- Unitaires: fonctions pures, hooks, utilitaires (rapides).
- Intégration UI: composants + requêtes API mockées.
- BDD/E2E: parcours critiques sur navigateur réel.

Mapping recommandé:

- Unit/Integration: Vitest + Testing Library + MSW.
- BDD/E2E: Playwright + Cucumber (Gherkin TypeScript).

Scénarios BDD minimum à garder verts:

- clic asset -> ouverture du panneau détail
- `Shift+clic` -> création/extension du batch
- `Ctrl/Cmd+Z` -> annulation de la dernière action
- `Shift+Espace` -> ajout/retrait de l'asset sélectionné au batch
- `Ctrl/Cmd+A` -> sélection de tous les assets visibles
- purge asset rejeté -> preview puis confirmation

## I18N

- `en` et `fr` obligatoires.
- Toute clé UI doit exister dans les 2 locales.
- Fallback strict: `locale utilisateur -> en -> clé brute`.
- Les libellés destructifs (move/purge/reject) doivent être explicites.

Implémentation locale actuelle:

- stack standard `i18next` + `react-i18next`
- ressources i18n dans `src/i18n/resources.ts`
- instance i18n partagée dans `src/i18n/index.ts`
- fallback strict `locale -> en -> key`
- switch de langue `FR/EN` dans l'en-tête UI desktop-like

## Checklist PR

- Objectif unique.
- Specs impactées identifiées.
- Tests ajoutés/ajustés avant merge.
- Aucun mélange massif feature + refactor + formatting.
- Commit messages en Conventional Commits.

## Workflow Git recommandé

- ne jamais commiter directement sur `master`
- créer une branche par feature avec préfixe `codex/`
- pousser la branche dès création
- ouvrir la PR immédiatement après le premier push
- garder des commits atomiques (un objectif clair par commit)
- rebaser/merger `master` régulièrement pour éviter les conflits tardifs
