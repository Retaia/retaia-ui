# TODO Pre-v1 Final

## UX/UI (retours écran)
- [ ] (1) Persister un `workspace state` minimal entre écrans (`filtres`, `batchIds`, sélection) pour éviter la perte de contexte au refresh.
- [ ] (2) Réduire la duplication visuelle entre `/review` et `/batch` (faire de `/batch` un écran réellement spécialisé pipeline batch).
- [ ] (3) Améliorer l'expérience empty-state de `/batch/reports` (CTA actionnable + rapport récent quand disponible).
- [ ] (4) Clarifier les libellés proches (`Ops batch` / `Vue batch` / `Mode batch`) pour accessibilité et lisibilité.
- [ ] (5) Hiérarchiser `ActionPanels` (actions fréquentes visibles, actions avancées repliables).

## Fonctionnel demandé
- [ ] Ajouter une page `Library` listant les assets `ARCHIVED` avec recherche.
- [ ] Ajouter le détail d'asset utilisable depuis la `Library` pour lecture + ajout de keywords.
- [ ] Ajouter une vraie page détail dans le flux review, en réutilisant le même écran que la `Library`.
