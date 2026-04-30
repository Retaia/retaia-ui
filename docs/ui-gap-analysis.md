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
| Haute | Conformite runtime | disponibilite review pilotee sur `feature_flags` bruts | `useReviewDataController` lit directement `server_policy.feature_flags['features.decisions.bulk']` | decisions UI derivees du resultat effectif gouverne, pas d'heuristique locale | branchement UI faux si app/user gating diverge du flag brut |

### Ecarts importants

| Priorite | Type d'ecart | Ecart | Situation actuelle | Attendu | Risque |
| --- | --- | --- | --- | --- | --- |
| Haute | Ambiguite UX | `Review` default sur `ALL` | `reviewWorkspaceSlice` initialise `filter: 'ALL'` | workspace centre sur le flux operateur, sans masquer les autres etats mais sans les melanger par defaut | confusion entre queue de travail et catalogue |
| Moyenne | Ecran incomplet | `Library` reste une recherche minimale | seulement recherche + tri + drawer detail | vrais facettes utiles et langage de requalification | `Library` trop pauvre pour un usage long |
| Moyenne | Ecran incomplet | `Rejects` reste une requalification partielle | recherche + tri + actions unitaires; pas encore de langage ni d'outillage plus dense pour traitement long | espace prudent de remise a decision et purge differee, avec outillage plus complet | `Rejects` reste utilisable mais encore etroit pour un usage intensif |
| Moyenne | Surface trop technique | `Settings` et `Auth` exposent les controles `API base URL` / `API token` | surfaces visibles dans le produit | ces controles restent secondaires et clairement environnement/dev | pollution de l'IA operateur |
| Moyenne | Surface publique inachevee | `/auth` n'est pas traite comme une vraie route `public only` | pas de redirection explicite si deja connecte | auth publique exclusive hors shell | friction et confusion de navigation |

### Ecarts secondaires

| Priorite | Type d'ecart | Ecart | Situation actuelle | Attendu | Risque |
| --- | --- | --- | --- | --- | --- |
| Basse/moyenne | Cohesion visuelle | shell encore trop TailAdmin/template | hero cards, gradients et panneaux heterogenes | rendu plus sobre et plus operateur | dette visuelle et surcharge cognitive |
| Basse/moyenne | Architecture code | controllers trop gros | `useReviewPageController.ts` concentre beaucoup trop de roles | orchestration plus decoupee par sections | refactor plus risque que necessaire |
| Basse | Terminologie | encore des labels et comportements mixtes entre termes metier et termes UI | certaines surfaces sont claires, d'autres restent tres techniques | vocabulaire stable par contexte | comprehension moins immediate |
| Basse | Persistance locale | persistance plus solide sur `Review` que sur les autres workspaces | query params et contexte de retour heterogenes | persistence coherente par workspace | perte de contexte secondaire |

### Ecrans manquants ou insuffisants

- version mature de `library` avec filtres utiles et posture "recherche + requalification"
- version plus dense de `rejects` pour usage long et requalification prudente

### Etats manquants ou mal exposes

- `DECIDED_KEEP` / `DECIDED_REJECT` ne sont pas assez traites comme des etats intermediaires a part entiere
- `PURGED` n'a pas de surface informative dediee si reference directe

### Flux incorrects

- pilotage d'une disponibilite critique depuis les flags bruts

### Ambiguities UX

- `Review` = flux entrant ou catalogue global?
- `Activity` = journal local ou audit serveur?
- `Settings` = preferences UI ou console runtime/admin?

### Actions dangereuses mal encadrees

- `apply decisions` reste a rendre plus lisible et plus explicite sur son scope exact

### Suppressions ou refontes recommandees

#### Sortir du flux principal

- `UiResetPage`
- controles dev `API token` / `API base URL` dans les parcours metier
- hero sections trop demonstratives dans les pages de travail

#### Refondre

- `src/pages/RejectsPage.tsx`
- `src/pages/LibraryPage.tsx`
- `src/pages/ReviewWorkspacePage.tsx`
- `src/components/app/AssetDetailPanel.tsx`
- `src/hooks/useReviewPageController.ts`
- `src/hooks/useReviewDataController.ts`
