# Docs Locales — retaia-ui

> Statut : non normatif.
> Source de vérité produit : `specs/`.

## Contenu

- `docs/DEVELOPMENT-BEST-PRACTICES.md`
- `docs/BOOTSTRAP-TECHNIQUE.md`
- `docs/UI-DESIGN-SYSTEM.md`
- `docs/UI-ARCHITECTURE.md`
- `docs/GITHUB-WORKFLOWS.md`
- `docs/DOCKER-DEVELOPMENT.md`
- `docs/USER-QUICKSTART.md`
- `docs/RELEASE-CHECKLIST.md`
- `docs/UI-QUALITY-RUNBOOK.md`
- `docs/UI-ACCESSIBILITY.md`
- `bdd/features/`

## Lecture minimale avant de coder

- `specs/change-management/CODE-QUALITY.md`
- `specs/tests/TEST-PLAN.md`
- `specs/api/API-CONTRACTS.md`
- `specs/policies/I18N-LOCALIZATION.md`
- `specs/policies/AUTHZ-MATRIX.md`
- `specs/state-machine/STATE-MACHINE.md`
- `specs/workflows/WORKFLOWS.md`

## Notes architecture UI (actuel)

- `src/App.tsx` reste un point d'entrée (pas de logique métier UI).
- Le routing applicatif est centralisé dans `src/routes/AppRoutes.tsx`.
- La config/session API (token, base URL, email login) est centralisée via `src/services/apiSession.ts` et `src/hooks/useApiClient.ts`.
- Le flux Review isole aussi les concerns runtime/URL via `src/hooks/useReviewApiRuntime.ts` et `src/hooks/useReviewRouteSelection.ts`.
- Les écrans sont portés par des pages dédiées:
- `src/pages/ReviewPage.tsx`
- `src/pages/AuthPage.tsx` (route `/auth`, incluant login/logout/2FA, gouvernance feature globale admin (`/app/features`) puis préférence user (`/auth/me/features`), lost-password et verify-email).
- La logique d'orchestration Auth est centralisée dans `src/hooks/useAuthPageController.ts` (séparation vue/controller).
- Les tests UI sont à placer au plus près des pages/composants (`src/pages`, `src/components`) plutôt qu'en fichier monolithique.

## Architecture DDD (V1)

- La V1 UI suit une architecture DDD pragmatique.
- `src/domain/*` porte les règles métier pures (sans side-effects UI/API).
- `src/application/*` porte les use-cases d'orchestration (sans dépendance directe `api/*`).
- `src/infrastructure/*` porte les adapters techniques (API mapping, intégrations runtime).
- `src/pages/*` et `src/components/*` restent orientés vue/composition, sans logique métier profonde.
- `src/App.tsx` reste strictement un point d'entrée de composition/routing et non une zone d'implémentation métier.
- Toute nouvelle feature doit suivre cette séparation et ajouter les tests de couche (`domain`, `application`, UI).
- Vérification locale des frontières d'architecture: `npm run lint:architecture`.

## Commandes BDD/E2E locales

- `npm run bdd:test`
- `npm run bdd:test:real-api`
- `npm run e2e:bdd`
- `npm run e2e:bdd:ci` (CI par defaut sur serveur dev local)
- `APP_URL=http://127.0.0.1:4173 BDD_API_MODE=mock npm run bdd:test` (suite mock)
- `APP_URL=http://127.0.0.1:4173 BDD_API_MODE=real-api npm run bdd:test:real-api` (suite real-api)
- `APP_ENV=test` (ou `VITE_APP_ENV=test`) active une mock DB in-memory dans l'UI.
- CI: definir la variable repo `E2E_TEST_ENV_URL` pour executer les BDD contre un environnement test distant.
