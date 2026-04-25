# UI Implementation Plan - Retaia-UI

## 9. Plan d'actions priorise

Etat au 2026-04-25 :

- le shell, les workspaces principaux, le contrat API critique et une partie des gates BDD sont deja en place
- ce plan ne garde que les actions encore ouvertes

### Priorite haute

1. Stabiliser les flows review/apply critiques.
   - resultat agrege batch plus fiable
   - messages de succes/partiel/echec plus explicites
   - refresh/retry coherents sur `409` / `412` / `428`

2. Continuer l'elargissement des gates automatiques.
   - promouvoir d'autres features canoniques stables hors smoke
   - retirer les derniers reliquats legacy des BDD et snapshots
   - garder le miroir `pre-push` strictement aligne sur la CI

### Priorite moyenne

1. Densifier `Activity`.
   - meilleure segmentation de lecture
   - validation dediee plus abondante
   - clarification continue du statut "journal local" non backend

2. Arbitrer la suite de `Settings` / surfaces admin.
   - soit exposer un sous-ensemble runtime utile
   - soit figer explicitement le perimetre v1 et retirer les attentes implicites

3. Homogeneiser les etats UX restants.
   - loading
   - empty states
   - erreurs d'autorisation
   - indisponibilite temporaire

### Priorite basse

1. Polish visuel TailAdmin-aligned.
   - densite
   - cohérence des panneaux
   - reductions des patterns trop generiques

## 10. Sequencement d'implementation

### Tranche A - Flows critiques restants

- durcir review/apply
- uniformiser les preconditions
- verifier les refreshs apres conflit

### Tranche B - Validation canonique

- promouvoir un feature BDD stable a la fois
- garder les checks locaux et CI strictement miroirs

### Tranche C - Surfaces secondaires

- densifier `Activity`
- arbitrer `Settings` / ops admin

### Tranche D - Polish

- a11y complementaire
- raffinement visuel
- reductions des dettes ergonomiques non bloquantes

## 11. Impact code

### Zones encore susceptibles de bouger

- `src/hooks/useReviewPageController.ts`
- `src/hooks/useReviewDataController.ts`
- `src/hooks/useLibraryPageController.ts`
- `src/hooks/useRejectsPageController.ts`
- `src/components/app/*`
- `src/components/review/*`
- `src/components/settings/*`
- `src/application/review/*`
- `src/services/workspaceQueryParams.ts`
- `src/i18n/locales/*`
- `bdd/features/*`
- `bdd/step-definitions/*`
- `tests/visual/ui.visual.spec.ts`
- `.github/workflows/ci.yml`
- `scripts/hooks/run-pre-push-ci.sh`

### Regle de mise en oeuvre

- une PR = un ecart ferme ou une gate promue
- pas de refonte massive transversale
- pas de reouverture des zones deja alignees sans raison contractuelle claire
