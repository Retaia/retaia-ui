# GitHub Workflows — retaia-ui

> Statut : non normatif.

## Objectif

Définir un pipeline CI UI orienté qualité React/TypeScript avec TDD/BDD.

## Pipeline en place (aligné core)

Le workflow CI est défini dans:

- `.github/workflows/ci.yml`

Jobs:

1. `no-black-magic`
2. `lint`
3. `test`
4. `security-audit`

## Gates bloquants

- `./scripts/no-black-magic.sh`
- `npm run lint`
- `npm run typecheck`
- `npm run test:coverage`
- `npm run security:audit`

## Gates de conformité specs

- Vérifier que les parcours critiques `review/decision/move/purge` sont couverts côté BDD.
- Vérifier la conformité i18n `en/fr` (clé manquante = échec CI).
- Vérifier les codes d'erreur et états affichés sans dépendance à un texte traduit.

## Déclenchement recommandé

- `pull_request` vers `master`
- `push` sur `master`

## Checks requis avant merge

- `no-black-magic`
- `lint`
- `test`
- `security-audit`

## Politique de couverture

- Pas de baisse de couverture sur les fichiers modifiés.
- Tout bug fix inclut un test de non-régression.
