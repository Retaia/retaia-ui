# UI Accessibility (v1)

> Statut : cible qualite/accessibilite pour la future implementation.
> Le repo est actuellement en phase `UI reset`.

## Objectif

Maintenir un niveau minimum WCAG AA sur les surfaces critiques.

## Gates automatiques

- `npm run test:a11y` (axe-core via `jest-axe`) sur les ecrans critiques.
- scenarios clavier BDD dans `bdd/features/**/*.feature`.

## Checklist v1

- Navigation clavier complete sur les surfaces interactives critiques.
- Focus visible sur elements interactifs.
- Roles/labels ARIA presents sur regions principales.
- Messages d'etat via zones live (`role=\"status\"`) sur feedbacks critiques.
- Erreurs fatales couvertes par `AppErrorBoundary`.

## Gouvernance raccourcis

- Registre central: `specs/ui/KEYBOARD-SHORTCUTS-REGISTRY.md`.
- Toute modification de binding clavier doit mettre a jour registre + tests + aide UI.
