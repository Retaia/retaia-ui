# Checklist PR — Refactor UI Stateful

Objectif: securiser les refactors qui touchent l'etat partage UI, les controllers de page, et les parcours multi-routes.

## Portee et decoupage

- [ ] Le scope est explicite (fichiers/modules concerns, hors-scope note dans la PR).
- [ ] La PR reste atomique (pas de melange feature produit + refactor architecture).
- [ ] Le plan de migration est decrit si le refactor change le shape d'etat.

## Contrats d'etat

- [ ] Les types d'etat publics sont stables ou documentes (controller/store/selectors).
- [ ] Les invariants metier sont preservés (`selectedAssetId`, `batchIds`, filtres, route contextuelle).
- [ ] Les valeurs derivees restent coherentes (memo/selectors sans divergence stale).

## Navigation et persistance

- [ ] Le contexte inter-pages est preserve (`lastRoute`, filtres, scroll, selection).
- [ ] Les query params restent synchronises (init + navigation browser back/forward).
- [ ] Les gardes `unsaved changes` restent actives sur les points de sortie critiques.

## UX et accessibilite

- [ ] Les statuts asynchrones visibles (`role="status"`, `aria-live`) sont conserves.
- [ ] Les raccourcis clavier critiques definis par `specs/ui/KEYBOARD-SHORTCUTS-REGISTRY.md` ne regressent pas.
- [ ] Aucun changement de label casse les flux E2E/a11y relies.

## Tests minimaux

- [ ] Tests unitaires/integ mis a jour sur les zones refactorees.
- [ ] Parcours critiques touches verifies (BDD/E2E cible ou test integration equivalent).
- [ ] Au moins un test de non-regression couvre le bug/risque principal adresse.

## Observabilite et operations

- [ ] Les events de navigation/telemetrie existants restent emis avec le meme schema.
- [ ] Les erreurs visibles UI gardent `correlation_id` quand disponible.
- [ ] Les notes PR listent explicitement les risques residuels et plan de rollback.
