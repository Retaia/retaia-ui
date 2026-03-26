# TailAdmin Technique — retaia-ui

> Statut : non normatif.
> Les règles métier restent dans `specs/`.
> Le repo est actuellement en phase `UI reset`.

Ce document decrit la direction technique et visuelle cible pour la future implementation UI.
Il ne faut pas le lire comme une description d'une interface deja livree.

## Stack cible

- Runtime UI: React 19 + TypeScript + Vite
- UI/CSS: Tailwind CSS, patterns TailAdmin
- Tests: Vitest + Testing Library + Cucumber/Playwright

## Règles UI

- Utiliser uniquement des composants HTML + classes Tailwind/TailAdmin.
- Ne pas introduire Bootstrap/React-Bootstrap, ni héritage Bootstrap.
- Éviter les abstractions UI larges; garder des composants locaux ciblés et simples.
- Les wrappers partagés sont permis pour réduire la duplication (ex: `AppButton`) sans recréer un UI-kit complexe.

## Système Light/Dark

- Le thème par défaut est `system` (suivi du thème OS).
- L'utilisateur peut changer manuellement le mode.
- Le toggle suit un cycle: `system -> light -> dark -> system`.
- Source: `src/ui/tailadmin-theme.tsx`.

## Navigation et layout

- Navigation principale en sidebar gauche.
- La composition exacte du shell, des workspaces, des routes et des libelles visibles releve de `specs/ui/UI-GLOBAL-SPEC.md`.
- Localement, on documente seulement la direction technique du rendu et du theming.

## Batch UX

- Les details produit de multi-selection et d'actions groupees relevent de `specs/`.
- Localement, l'implementation doit garder ces flux explicites, lisibles et testables.

## Références

- `docs/UI-DESIGN-SYSTEM.md`
- `docs/UI-ARCHITECTURE.md`
- `src/components/ui/AppButton.tsx`
- `src/ui/tailadmin-theme.tsx`
