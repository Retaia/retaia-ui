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
5. `e2e-bdd`

## Gates bloquants

- `./scripts/no-black-magic.sh`
- `npm run lint`
- `npm run typecheck`
- `npm run i18n:check`
- `npm run test:coverage`
- `npm run security:audit`
- `npm run e2e:bdd:ci`
  (génère aussi `test-results/bdd-report.json` et `test-results/bdd-report.html` via les formatters Cucumber)

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
- `e2e-bdd`

Artefacts CI:

- le job `e2e-bdd` publie `test-results/**` en succès et en échec

## Protection de `master`

Pour aligner les règles de merge avec les checks requis:

- `npm run gh:protect-master`

Pré-requis:

- droits admin sur le repo GitHub
- `gh auth login` déjà fait sur la machine

Le script configure:

- statut checks requis (liste CI complète)
- review PR obligatoire (1 approbation)
- résolution de conversation obligatoire
- force-push et suppression de branche interdits

## Politique de couverture

- Pas de baisse de couverture sur les fichiers modifiés.
- Tout bug fix inclut un test de non-régression.
