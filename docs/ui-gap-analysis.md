# UI Gap Analysis - Retaia-UI

## 7. Gap analysis

### Ecarts critiques

| Priorite | Ecart | Existant | Attendu | Risque |
| --- | --- | --- | --- | --- |
| Haute | Apply groupé encore a stabiliser | selection et rails UI existent, et l'execution est redevenue unitaire, mais le resultat agrege et certains etats UX restent fragiles | previsualisation, confirmation, execution unitaire, resultat agrege robuste sans endpoint invente | faux positifs UX ou perte de lisibilite sur les actions critiques |
| Haute | Tests de validation legacy | BDD `@legacy-ui`, visual baselines sur batch/detail legacy | suites reconstruites depuis specs v1 | faux sentiment de securite |

### Ecarts importants

| Priorite | Ecart | Existant | Attendu | Risque |
| --- | --- | --- | --- | --- |
| Moyenne/haute | Concurrence optimistic encore heterogene | une partie des flows unitaires passe `If-Match`, mais le nettoyage n'est pas uniforme sur tout le parcours review/apply/reprocess/purge | toute mutation asset partagee branchee sur `revision_etag` | `428` et `412` geres de facon incomplete |
| Moyenne/haute | Feature runtime branchee de facon partielle | poll `GET /app/policy`, mais surface review finale absente | gating complet par disponibilite serveur | UI incoherente entre code et runtime |
| Moyenne | Activity encore a densifier | route canonique servie avec journal local borne, filtres et liens retour, mais sans segmentation plus fine ni validation dediee abondante | journal local lisible, robuste et clairement distinct d'un audit backend | valeur percue encore trop faible ou trop generique |
| Moyenne | Settings admin encore borne a un sous-ensemble | config runtime et feature MFA globale presentes, pas de surface ops admin plus large | exposition admin minimale si retenue | runtime admin incomplet mais non bloquant v1 |
| Moyenne | Ops admin non integres | endpoints presents dans OpenAPI, UI locale absente | exposition admin minimale si retenue | manque de diagnosique operateur |

### Ecarts secondaires

| Priorite | Ecart | Existant | Attendu | Risque |
| --- | --- | --- | --- | --- |
| Basse/moyenne | Persistance locale encore inegale | review/library/rejects sont mieux servis, `activity` reste borne | review/library/rejects/activity selon besoin | experience fragile sur les surfaces secondaires |
| Basse | Design system encore generic TailAdmin | primitives presentes, pas d'identite produit | rendu d'outil operateur sobre et robuste | dette cosmétique, pas blocage contractuel |

## Points de suppression/refonte prioritaires

### Supprimer

- baselines visuelles legacy `batch-*`, `detail-*`, `activity-route-*` comme cible produit
- scenarios BDD `@legacy-ui` comme gates de conformite

### Refondre

- `src/domain/assets.ts`
- `src/api/contracts.ts`
- `src/api/assetMapper.ts`
- `src/api/mockDb.ts`
- `src/hooks/useReviewPageController.ts`
- `src/hooks/useAuthPageController.ts`
- `src/hooks/auth/useAuthSessionsController.ts`
- tous les composants legacy app/review qui portent l'ancien flux batch/proxy

## Ce qui peut servir de base sans imposer l'ancienne UX

- gestion du theme
- infrastructure i18n
- persistance query params
- persistance du contexte de navigation
- une partie du socle auth
- quelques helpers de selection/focus/statut apres requalification unitaire
