# TailAdmin Technique — retaia-ui

> Statut : non normatif.
> Les règles métier restent dans `specs/`.

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
- Ordre principal: `Review`, `Library`, `Rejects`.
- Actions admin placées en bas de sidebar.

## Batch UX

- La liste d'assets expose une checkbox batch par ligne.
- Cocher une checkbox ajoute l'asset au batch et ouvre le panneau d'édition batch.
- Le panneau batch reste la source d'actions batch (preview/execute/cancel/report).

## Références

- `docs/UI-DESIGN-SYSTEM.md`
- `docs/UI-ARCHITECTURE.md`
- `src/components/ui/AppButton.tsx`
- `src/ui/tailadmin-theme.tsx`
