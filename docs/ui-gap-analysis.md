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
| Haute | Ecran manquant / flux incomplet | Detail standalone non implemente | `src/pages/StandaloneAssetDetailPage.tsx` rend un `WorkspaceScaffold` placeholder au lieu d'un vrai detail actionnable | detail complet dans les contextes `review`, `library`, `rejects` | route utile en theorie, vide en pratique |
| Haute | Flux incorrect | `Rejects` n'expose pas `reopen` ni `reprocess` | `src/pages/RejectsPage.tsx` ne passe que les actions de purge au detail | `REJECTED` doit permettre `reopen`, `reprocess`, `purge` | l'UI bloque des transitions normatives |
| Haute | Flux incorrect | route `/rejects/asset/:assetId` sans controller reel | la route existe, mais la page standalone detail est generique et le controller detail ne couvre pas `rejects` | detail `rejects` pleinement fonctionnel | trou fonctionnel sur un flux destructif |
| Haute | Conformite runtime | `GET /app/policy` n'embarque pas `client_feature_flags_contract_version` | `src/api/client.ts` appelle `/app/policy` sans query contractuelle | negotiation de version explicite | divergence silencieuse avec le contrat flags |
| Haute | Conformite runtime | disponibilite review pilotee sur `feature_flags` bruts | `useReviewDataController` lit directement `server_policy.feature_flags['features.decisions.bulk']` | decisions UI derivees du resultat effectif gouverne, pas d'heuristique locale | branchement UI faux si app/user gating diverge du flag brut |

### Ecarts importants

| Priorite | Type d'ecart | Ecart | Situation actuelle | Attendu | Risque |
| --- | --- | --- | --- | --- | --- |
| Haute | Ambiguite UX | `Review` default sur `ALL` | `reviewWorkspaceSlice` initialise `filter: 'ALL'` | workspace centre sur le flux operateur, sans masquer les autres etats mais sans les melanger par defaut | confusion entre queue de travail et catalogue |
| Haute | Action dangereuse mal encadree | fallback waveform synthetique | `AssetMediaPreview.tsx` invente une waveform locale si `waveformUrl` manque | fallback explicite "waveform indisponible" sans simulation | faire croire qu'un derive de review existe quand il n'existe pas |
| Moyenne | Ecran incomplet | `Library` reste une recherche minimale | seulement recherche + tri + drawer detail | vrais facettes utiles et langage de requalification | `Library` trop pauvre pour un usage long |
| Moyenne | Ecran incomplet | `Rejects` n'est pas un vrai workspace de requalification | recherche + tri + purge; pas de batch `reopen`, pas d'indicateurs de retention | espace prudent de remise a decision et purge differee | `Rejects` ressemble a une impasse destructive |
| Moyenne | IA incoherente | `Library` et `Rejects` utilisent un drawer plein ecran lateral plutot qu'un split workspace stable | detail en aside fixe | meme logique d'inspecteur et de densite que `Review` | discontinuite mentale inutile |
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

- detail standalone `review`
- detail standalone `library`
- detail standalone `rejects`
- vrai workspace `rejects` avec requalification complete
- version mature de `library` avec filtres utiles et posture "recherche + requalification"

### Etats manquants ou mal exposes

- `DECIDED_KEEP` / `DECIDED_REJECT` ne sont pas assez traites comme des etats intermediaires a part entiere
- `REJECTED` n'offre pas tous les parcours normatifs a l'endroit logique
- `PURGED` n'a pas de surface informative dediee si reference directe

### Flux incorrects

- `Rejects` -> `reopen`
- `Rejects` -> `reprocess`
- detail standalone `rejects`
- negotiation de version du contrat feature flags

### Ambiguities UX

- `Review` = flux entrant ou catalogue global?
- `Activity` = journal local ou audit serveur?
- `Settings` = preferences UI ou console runtime/admin?

### Actions dangereuses mal encadrees

- purge encore trop proche d'une action directe sans assez de contexte de retention
- waveform fallback locale pouvant donner une fausse impression de derive disponible

### Suppressions ou refontes recommandees

#### Sortir du flux principal

- `UiResetPage`
- controles dev `API token` / `API base URL` dans les parcours metier
- hero sections trop demonstratives dans les pages de travail

#### Refondre

- `src/pages/StandaloneAssetDetailPage.tsx`
- `src/pages/RejectsPage.tsx`
- `src/pages/LibraryPage.tsx`
- `src/pages/ReviewWorkspacePage.tsx`
- `src/components/app/AssetDetailPanel.tsx`
- `src/components/app/AssetMediaPreview.tsx`
- `src/hooks/useReviewPageController.ts`
- `src/hooks/useReviewDataController.ts`
