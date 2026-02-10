# GitHub Workflows — retaia-ui

> Statut : non normatif.

## Objectif

Définir un pipeline CI UI orienté qualité React/TypeScript avec TDD/BDD.

## Pipeline recommandé

Jobs minimum:

1. `lint`
2. `typecheck`
3. `unit-integration`
4. `bdd-e2e`
5. `build`

## Gates bloquants

- `npm run lint`
- `npm run typecheck`
- `npm run test:coverage`
- `npm run bdd`
- `npm run build`

## Gates de conformité specs

- Vérifier que les parcours critiques `review/decision/move/purge` sont couverts côté BDD.
- Vérifier la conformité i18n `en/fr` (clé manquante = échec CI).
- Vérifier les codes d'erreur et états affichés sans dépendance à un texte traduit.

## Déclenchement recommandé

- `pull_request` vers `master`
- `push` sur `master`

## Checks requis avant merge

- `lint`
- `typecheck`
- `unit-integration`
- `bdd-e2e`
- `build`

## Politique de couverture

- Pas de baisse de couverture sur les fichiers modifiés.
- Tout bug fix inclut un test de non-régression.
