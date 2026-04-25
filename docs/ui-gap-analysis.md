# UI Gap Analysis - Retaia-UI

## 7. Gap analysis

Ce document ne liste plus les chantiers deja executes. Il ne garde que les ecarts encore ouverts.

### Ecarts critiques

| Priorite | Ecart | Situation actuelle | Attendu | Risque |
| --- | --- | --- | --- | --- |
| Haute | Apply groupé encore a stabiliser | la selection, la previsualisation et l'execution unitaire existent, mais le resultat agrege et plusieurs etats UX restent fragiles | apply robuste, lisible, sans faux succes ni heuristique locale | incomprehension operateur sur une action critique |
| Haute | Concurrence optimistic encore heterogene | certains flows passent `If-Match` et exposent un refresh explicite, mais le traitement `412` / `428` / `409` n'est pas uniforme | gestion coherente des conflits sur review/apply/reprocess/purge | retries opaques ou etats obsoletes affiches comme fiables |

### Ecarts importants

| Priorite | Ecart | Situation actuelle | Attendu | Risque |
| --- | --- | --- | --- | --- |
| Haute | Elargissement progressif des gates de validation | le smoke BDD, les visuels et deux features canoniques non-smoke (`batch preview/execute`, `decision API`) sont gates | continuer a promouvoir les parcours canoniques stables sans ouvrir toute la suite BDD d'un bloc | regressions encore hors gate bloquante |
| Moyenne | Activity encore a densifier | le workspace existe et reste borne, mais sa densite d'information et sa validation sont encore faibles | journal local plus lisible, plus robuste, clairement non confondu avec un audit backend | surface percue comme accessoire ou generique |
| Moyenne | Settings admin encore borne a un sous-ensemble | diagnostics runtime et flags exposes, mais pas de surface ops admin plus large | exposition admin minimale seulement si elle est retenue produit/specs | frustration operateur sur des diagnostics absents |
| Moyenne | Ops admin non integres | des endpoints existent au contrat, pas d'UI locale dediee | arbitrage explicite: exposer un sous-ensemble utile ou assumer l'absence en v1 | dette produit/documentaire persistante |

### Ecarts secondaires

| Priorite | Ecart | Situation actuelle | Attendu | Risque |
| --- | --- | --- | --- | --- |
| Basse/moyenne | Persistance locale encore inegale | `review`, `library` et `rejects` sont mieux servis que `activity` | persistance coherent par workspace selon utilite reelle | perte de contexte sur les surfaces secondaires |
| Basse | Design system encore generic TailAdmin | la base est utilisable mais l'identite reste neutre | rendu plus operateur, plus sobre, moins template | dette visuelle, sans blocage contractuel |

## Suppressions / refontes restantes

### Supprimer

- reliquats de scripts, tags, snapshots ou wording legacy encore presents dans les gates

### Refondre

- `src/hooks/useReviewPageController.ts` pour les etats limites review/apply
- `src/hooks/useReviewDataController.ts` pour les refreshs et conflits
- `src/hooks/useLibraryPageController.ts` et `src/hooks/useRejectsPageController.ts` pour l'homogeneite des preconditions
- `src/hooks/useAuthPageController.ts` si l'extension admin/settings devient necessaire
- composants review/apply encore trop lies a l'ancien flux batch

## Base exploitable sans refonte lourde

- theme et primitives UI existantes
- socle i18n
- persistance query params / contexte de navigation
- auth publique et compte
- workspaces canoniques deja en place
