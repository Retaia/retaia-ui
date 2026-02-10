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
- Batch move (preview + apply)
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

## I18N

- `en` et `fr` obligatoires.
- Toute clé UI doit exister dans les 2 locales.
- Fallback strict: `locale utilisateur -> en -> clé brute`.
- Les libellés destructifs (move/purge/reject) doivent être explicites.

## Checklist PR

- Objectif unique.
- Specs impactées identifiées.
- Tests ajoutés/ajustés avant merge.
- Aucun mélange massif feature + refactor + formatting.
- Commit messages en Conventional Commits.
