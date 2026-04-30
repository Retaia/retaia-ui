# UI Gap Analysis - Retaia-UI

## 7. Gap analysis

Comparaison faite entre:

- vision README racine du repo
- specs normatives
- recommandations non normatives de `specs/ui/*`
- code actuellement livre dans `src/*`

### Ecarts critiques

| Priorite | Type d'ecart | Ecart | Situation actuelle | Attendu | Risque |
| --- | --- | --- | --- | --- | --- |

### Ecarts importants

| Priorite | Type d'ecart | Ecart | Situation actuelle | Attendu | Risque |
| --- | --- | --- | --- | --- | --- |

### Ecarts secondaires

| Priorite | Type d'ecart | Ecart | Situation actuelle | Attendu | Risque |
| --- | --- | --- | --- | --- | --- |
| Basse/moyenne | Cohesion visuelle | shell encore trop TailAdmin/template | hero cards, gradients et panneaux heterogenes | rendu plus sobre et plus operateur | dette visuelle et surcharge cognitive |
| Basse/moyenne | Architecture code | controllers trop gros | `useReviewPageController.ts` concentre beaucoup trop de roles | orchestration plus decoupee par sections | refactor plus risque que necessaire |
| Basse | Terminologie | encore des labels et comportements mixtes entre termes metier et termes UI | certaines surfaces sont claires, d'autres restent tres techniques | vocabulaire stable par contexte | comprehension moins immediate |
| Basse | Persistance locale | persistance plus solide sur `Review` que sur les autres workspaces | query params et contexte de retour heterogenes | persistence coherente par workspace | perte de contexte secondaire |

### Etats manquants ou mal exposes

- `DECIDED_KEEP` / `DECIDED_REJECT` ne sont pas assez traites comme des etats intermediaires a part entiere
- `PURGED` n'a pas de surface informative dediee si reference directe

### Flux incorrects

### Ambiguities UX

- `Review` = flux entrant ou catalogue global?
- `Activity` = journal local ou audit serveur?
- `Settings` = preferences UI ou console runtime/admin?

### Actions dangereuses mal encadrees

- `apply decisions` reste a rendre plus lisible et plus explicite sur son scope exact

### Suppressions ou refontes recommandees

#### Sortir du flux principal

- `UiResetPage`
- hero sections trop demonstratives dans les pages de travail

#### Refondre

- `src/pages/RejectsPage.tsx`
- `src/pages/LibraryPage.tsx`
- `src/pages/ReviewWorkspacePage.tsx`
- `src/components/app/AssetDetailPanel.tsx`
- `src/hooks/useReviewPageController.ts`
- `src/hooks/useReviewDataController.ts`
