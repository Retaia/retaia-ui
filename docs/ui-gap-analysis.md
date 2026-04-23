# UI Gap Analysis - Retaia-UI

## 7. Gap analysis

### Ecarts critiques

| Priorite | Ecart | Existant | Attendu | Risque |
| --- | --- | --- | --- | --- |
| Haute | Routing canonique absent | `/review/detail/:assetId`, `/library/detail/:assetId`, pas de `/rejects`, `/account`, `/auth/reset-password`, `/auth/verify-email` | routes canoniques du cadrage UI recommande et des parcours auth/specs | deep links faux, architecture non migrable |
| Haute | Pages runtime inexistantes | `UiResetPage` pour review/library/auth/settings/detail | vrais workspaces et detail focus | impossible d'auditer le comportement utilisateur final |
| Haute | Machine a etats reduite localement | 4 etats dans `src/domain/assets.ts` | etats complets de `STATE-MACHINE.md` | contresens metier dans toute la UI |
| Haute | Endpoints inventes | `/batches/moves/*`, `/assets/{uuid}/decision` | `PATCH /assets/{uuid}`, `POST /assets/{uuid}/purge`, `POST /assets/purge`, `POST /assets/{uuid}/reopen`, `POST /assets/{uuid}/reprocess` | wiring API invalide |
| Haute | Mapping etats faux | `REJECTED` et `PURGED` maps vers `DECIDED_REJECT` | distinctions strictes entre decision, rejected et purged | actions destructives mal cadrees |
| Haute | Mapping workspace faux | library accepte `DECIDED_KEEP`, pas de workspace rejects | `ARCHIVED` dans library, `REJECTED` dans rejects, `DECIDED_*` dans review/apply queue | confusion produit majeure |
| Haute | Review media nommee en `proxy_*` | `proxyVideoUrl`, `has_proxy`, `proxy_*` | previews/derived `preview_*`, `waveform`, `thumbs` | s'emboite mal avec le contrat v1 |
| Haute | Auth/account incomplet | auth compacte, pas de route account, pas de sessions UI | surfaces distinctes auth/account/settings | compte utilisateur sous-specifie |
| Haute | Tests de validation legacy | BDD `@legacy-ui`, visual baselines sur batch/detail legacy | suites reconstruites depuis specs v1 | faux sentiment de securite |

### Ecarts importants

| Priorite | Ecart | Existant | Attendu | Risque |
| --- | --- | --- | --- | --- |
| Moyenne/haute | `Accept-Language` absent du transport | `src/api/transport.ts` n'envoie pas le header | locale utilisateur transportee a l'API | messages incoherents et non conformes |
| Moyenne/haute | Concurrence optimistic partiellement optionnelle | `If-Match` passe parfois mais pas impose par les flows UI | toute mutation asset partagee branchee sur `revision_etag` | `428` et `412` non geres proprement |
| Moyenne/haute | Feature runtime branchee de facon partielle | poll `GET /app/policy`, mais surface review finale absente | gating complet par disponibilite serveur | UI incoherente entre code et runtime |
| Moyenne/haute | Activity sans contrat clair | activity heritagee du review | journal local borne ou vraie surface si backend l'expose plus tard | faux audit systeme |
| Moyenne | Shell global incomplet | pas de shell connecte, header legacy non servi | shell stable de production | perte de contexte entre workspaces |
| Moyenne | Metadata humaine incomplete | tags/notes presentes, `projects` absent du rendu legacy echantillonne | `projects`, localisation, fields dedies visibles | detail asset incomplet |
| Moyenne | Qualification audio absente | aucun vrai flow `REVIEW_PENDING_PROFILE` | action explicite de choix `audio_music`/`audio_voice` | blocage produit non adresse |
| Moyenne | Ops admin non integres | endpoints presents dans OpenAPI, UI locale absente | exposition admin minimale si retenue | manque de diagnosique operateur |

### Ecarts secondaires

| Priorite | Ecart | Existant | Attendu | Risque |
| --- | --- | --- | --- | --- |
| Basse/moyenne | Vocabulaire incoherent | header legacy associe `activity` au label rejects | vocabulaire stable par workspace | confusion navigation |
| Basse/moyenne | Persistance locale non etendue | review/library seulement | review/library/rejects/activity selon besoin | experience fragile |
| Basse | Design system encore generic TailAdmin | primitives presentes, pas d'identite produit | rendu d'outil operateur sobre et robuste | dette cosmétique, pas blocage contractuel |

## Points de suppression/refonte prioritaires

### Supprimer

- references a `/batches/moves/*`
- references a `/assets/{uuid}/decision`
- baselines visuelles legacy `batch-*`, `detail-*`, `activity-route-*` comme cible produit
- scenarios BDD `@legacy-ui` comme gates de conformite

### Refondre

- `src/domain/assets.ts`
- `src/api/contracts.ts`
- `src/api/assetMapper.ts`
- `src/api/mockDb.ts`
- `src/routes/AppRoutes.tsx`
- `src/pages/*`
- `src/hooks/useReviewPageController.ts`
- `src/hooks/useLibraryPageController.ts`
- `src/hooks/useStandaloneAssetDetailController.ts`
- tous les composants legacy app/review qui portent l'ancien flux batch/proxy

## Ce qui peut servir de base sans imposer l'ancienne UX

- gestion du theme
- infrastructure i18n
- persistance query params
- persistance du contexte de navigation
- une partie du socle auth
- quelques helpers de selection/focus/statut apres requalification unitaire
