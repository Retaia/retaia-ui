# TODO Pre-v1 Final

## Remarques transverses (à garder en ligne directrice)
- `ReviewPage` est découpée, mais `useReviewPageController` reste massif: viser des sous-hooks métier.
- La navigation multi-pages existe, mais la persistance de contexte reste insuffisante.
- La `Library` doit être traitée comme un domaine de premier niveau, pas comme une extension du review.
- Le modèle d'états métier est encore simplifié (`ARCHIVED` mappé), ce qui peut brouiller les usages.
- La dette de raccourcis clavier peut vite croître sans gouvernance explicite (priorités/conflits).
- Une passe d'architecture/documentation est nécessaire pour stabiliser ownership et flux avant d'ajouter des features.

## Priorités (ordre d'exécution recommandé)

### P0 (bloquant pre-v1)
- [x] Implémenter `Library` (liste ARCHIVED + recherche + page détail partagée review/library).
- [x] Stabiliser la navigation: persistance de contexte inter-pages + query params API homogènes.
- [x] Corriger le modèle d'états domaine pour supporter `ARCHIVED` explicitement.
- [x] Ajouter tests E2E cross-page critiques (review -> activity -> library -> detail + retour contexte).

### P1 (important pre-v1)
- [ ] Splitter `useReviewPageController` en sous-hooks métier.
- [ ] Réduire la duplication visuelle entre les sections review/batch/report intégrées dans `/review`.
- [ ] Améliorer l'empty-state de la section report batch dans `/review`.
- [x] Mettre en place gouvernance des raccourcis clavier (registre + règles).
- [ ] Structurer auth en sous-pages/onglets et sous-controllers.

### P2 (durcissement)
- [ ] Renforcer observabilité (funnel, dashboard erreurs, corrélation API).
- [ ] Finaliser budgets performance + virtualisation liste.
- [ ] Compléter audits accessibilité WCAG AA sur tous les écrans.
- [ ] Documenter architecture cible (flux + ownership + standard controller).

## Checklist release (pre-v1)
- [ ] Valider manuellement les parcours critiques (review unitaire, batch, report, auth, settings) en FR et EN.
- [ ] Vérifier la conformité go/no-go (tests, typecheck, lint, a11y, perf, contract checks).
- [ ] Exécuter un dry-run de release (build, artefacts, tag) en environnement de pré-production.
- [ ] Vérifier la procédure de rollback front (version précédente, cache, smoke tests post-rollback).
- [ ] Geler la checklist finale signée (engineering + produit) avant le tag v1.

## Support & Debug (pre-v1)
- [ ] Définir le runbook support: points de collecte (`correlation_id`, route, action, timestamp, user role).
- [ ] Ajouter une UI/UX claire pour afficher/copier les identifiants de corrélation sur erreurs critiques.
- [ ] Standardiser le format des tickets d'incident (template unique avec champs obligatoires).
- [ ] Définir l'escalade support (L1/L2/dev) avec SLA et propriétaire par domaine (`review`, `auth`, `batch`).

## UX/UI (retours écran)
- [x] (1) Persister un `workspace state` minimal entre écrans (`filtres`, `batchIds`, sélection) pour éviter la perte de contexte au refresh.
- [ ] (2) Réduire la duplication visuelle entre les sections review/batch de `/review` (pipeline batch plus lisible).
- [ ] (3) Améliorer l'expérience empty-state de la section report batch (CTA actionnable + rapport récent quand disponible).
- [ ] (4) Clarifier les libellés proches (`Ops batch` / `Vue batch` / `Mode batch`) pour accessibilité et lisibilité.
- [ ] (5) Hiérarchiser `ActionPanels` (actions fréquentes visibles, actions avancées repliables).

## Fonctionnel demandé
- [x] Ajouter une page `Library` listant les assets `ARCHIVED` avec recherche.
- [x] Ajouter le détail d'asset utilisable depuis la `Library` pour lecture + ajout de keywords.
- [x] Ajouter une vraie page détail dans le flux review, en réutilisant le même écran que la `Library`.
- [x] Concevoir la `Library` comme un module first-class (routes dédiées, navigation dédiée, état/données dédiés).

## Navigation (pre-v1)
- [ ] Uniformiser la navigation contextuelle via query params API (filtres/recherche/tri) et retour fiable.
- [x] Ajouter une navigation secondaire/breadcrumbs (`Review > Asset ...`, `Library > Archived > Asset ...`).
- [x] Persister le contexte inter-pages (`last route`, filtres actifs, scroll list, sélection courante).
- [x] Rendre le comportement du bouton `Back` déterministe (retour liste vs écran précédent).
- [x] Ajouter une garde de navigation en cas d'édition metadata non sauvegardée.
- [ ] Uniformiser les labels de navigation pour éviter collisions UX/a11y/tests.
- [x] Ajouter des routes explicites `404` / `403` au lieu de redirections silencieuses.
- [x] Ajouter des tests E2E cross-page (review -> activity -> library -> detail + retour contexte).
- [x] Permettre l'ouverture d'un asset en nouvel onglet sans perdre l'état du workspace.
- [x] Instrumenter les événements de navigation (screen_view + origine des actions).

## Auth (pre-v1)
- [ ] Extraire la logique auth en sous-controllers clairs (`session`, `recovery`, `verify-email`, `mfa`, `api-connection`) avec contrats stables.
- [ ] Introduire des sous-pages/onglets auth dédiés (`/auth/session`, `/auth/recovery`, `/auth/verify-email`, `/auth/mfa`).
- [ ] Extraire un layout auth réutilisable (`AuthShell`, `AuthStatusBanner`, `AuthActions`) pour réduire la duplication UI.
- [ ] Uniformiser la machine d'états async auth (`idle/loading/success/error`) sur tous les sous-flux.
- [ ] Centraliser le mapping erreurs auth/API (codes, messages, retryabilité) dans un module unique.
- [x] Ajouter une garde de navigation en cas de formulaire auth modifié non sauvegardé.
- [ ] Ajouter des tests d'intégration par sous-flux auth (login, recovery, verify-email, MFA).
- [ ] Ajouter des tests E2E auth multi-pages avec persistance de session au retour vers review/settings.
- [ ] Définir une source unique d'état de session (token + user + features) partagée globalement.
- [ ] Instrumenter les événements auth (attempt/success/failure par étape) pour pilotage UX.

## API & Contrat (pre-v1)
- [x] Gérer explicitement `ARCHIVED` comme état domaine (au lieu d'un mapping implicite vers KEEP).
- [ ] Versionner/fixer les payloads UI critiques (batch report, asset detail, metadata).
- [ ] Ajouter des tests contract pour les nouvelles routes (library, page détail partagée).

## Architecture applicative (pre-v1)
- [ ] Splitter `useReviewPageController` en sous-hooks (`selection`, `decisions`, `batch`, `metadata/purge`, `navigation`).
- [ ] Définir un contrat commun pour les controllers de page (shape état/actions) afin d'aligner `review` et `auth`.
- [x] Introduire un store global `Redux Toolkit` (migration `review` + `library`) pour centraliser l'état UI partagé.
- [x] Finaliser la migration Redux côté `auth` (session, recovery, mfa, api-connection).
- [ ] Documenter un diagramme de flux UI (écrans, transitions, état partagé) avec ownership par module.

## Performance (pre-v1)
- [ ] Ajouter la virtualisation de la liste assets pour gros volumes.
- [ ] Activer le code-splitting par page (`review`, `batch`, `reports`, `auth`, `library`).
- [ ] Définir des budgets performance (TTI/LCP) avec contrôle CI.

## Accessibilité (pre-v1)
- [ ] Faire un audit clavier complet cross-page (focus management, skip links, traps).
- [ ] Uniformiser les annonces ARIA pour tous les statuts asynchrones.
- [ ] Vérifier contraste et états disabled/destructifs en conformité WCAG AA.
- [x] Définir un registre des raccourcis clavier (priorité, scope, conflits, exceptions en contexte saisie).

## Design System (pre-v1)
- [ ] Standardiser les design tokens (spacing, color, typo, elevation).
- [ ] Définir un système de variantes d'actions (`primary`, `secondary`, `destructive`).
- [ ] Harmoniser les patterns `empty/error/loading` avec templates communs.

## Observabilité (pre-v1)
- [ ] Corréler tous les appels API UI avec `correlation_id` dans les logs.
- [ ] Ajouter un dashboard erreurs UI par écran/flow.
- [ ] Instrumenter le funnel de décision (open -> decide -> batch -> report).

## Sécurité (pre-v1)
- [ ] Revoir la stratégie stockage token/session (durée, clear policy, expiry).
- [ ] Mettre en place une politique de redaction logs (token/PII).
- [ ] Gérer permissions/403 par écran avec fallback explicite.

## Qualité & Tests (pre-v1)
- [x] Ajouter des tests visuels pour les pages critiques (`/review`, `/activity`, `/library`, `/auth`, `/settings`, détail standalone).
- [x] Ajouter des tests E2E pour les nouveaux parcours de navigation.
- [ ] Renforcer la stratégie anti-flaky (retries ciblés + artefacts diagnostics).

## DevEx (pre-v1)
- [x] Documenter le standard d'architecture (`pages + controller + sections`).
- [ ] Ajouter un scaffold pour générer une page orchestrée.
- [x] Ajouter un scaffold pour générer une page orchestrée.
- [ ] Ajouter une checklist PR dédiée aux refactors UI stateful.
