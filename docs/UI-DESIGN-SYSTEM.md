# UI Design System (TailAdmin/Tailwind) — retaia-ui

> Statut : non normatif.
> Source produit: `specs/`.
> Le repo est actuellement en phase `UI reset`.

Ce document decrit le systeme visuel vise pour la future UI.
Il ne decrit pas un produit deja implemente de bout en bout.

## Objectif

Conserver une UI cohérente et rapidement remplaçable en gardant:

- un shell TailAdmin clair (sidebar + contenu),
- des classes Tailwind explicites,
- un minimum d'abstractions de rendu.

## Principes

- Pas de Bootstrap/React-Bootstrap.
- Pas de "bridge CSS" entre systèmes UI.
- Rendu par défaut en Tailwind utilitaire.
- Composants partagés autorisés uniquement pour la duplication répétitive (ex: `AppButton`).

## Thème Light/Dark

- Le mode initial est `system` (suit l'OS).
- L'utilisateur peut forcer un mode via toggle.
- Cycle du toggle: `system -> light -> dark -> system`.
- Implémentation: `src/ui/tailadmin-theme.tsx`.

## Tokens visuels (via classes Tailwind)

- Couleurs marque: `brand-*`
- États: `success-*`, `warning-*`, `error-*`, `blue-light-*`
- Surfaces: `bg-white`, `bg-gray-50`, `border-gray-*`
- Radius: `rounded-lg`, `rounded-xl`
- Ombres: `shadow-theme-sm`

## Patterns de composants

- Boutons d'action:
  - `src/components/ui/AppButton.tsx`
  - variants `primary`, `outline-*`, `warning`, `danger`, `secondary`
- Sections:
  - cartes en `rounded-xl border bg-white p-4 shadow-theme-sm`
- Feedback:
  - `role="status"` + `aria-live="polite"` pour statuts async.

## Navigation

- Sidebar gauche:
  - top: navigation métier
  - bottom: admin/langue/thème
- Les details produit de navigation, routes et libelles visibles relevent de `specs/ui/UI-GLOBAL-SPEC.md`.
- Ce document local se limite aux principes visuels et de composition.

## Évolutions

- Toute nouvelle règle visuelle doit rester compatible avec l'approche TailAdmin/Tailwind.
- Si un composant partagé est introduit, documenter sa portée et éviter un "UI-kit" global.
