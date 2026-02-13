# UI Accessibility (v1)

## Objectif

Maintenir un niveau minimum WCAG AA sur les parcours critiques desktop.

## Gates automatiques

- `npm run test:a11y` (axe-core via `jest-axe`) sur les ecrans critiques.
- scenarios clavier BDD dans `bdd/features/**/*.feature`.

## Checklist v1

- Navigation clavier complete sur la liste, actions et raccourcis.
- Focus visible sur elements interactifs.
- Roles/labels ARIA presents sur regions principales.
- Messages d'etat via zones live (`role=\"status\"`) sur feedbacks critiques.
- Erreurs fatales couvertes par `AppErrorBoundary`.
