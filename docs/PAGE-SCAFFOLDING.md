# Scaffold Page Orchestree

> Statut: non normatif.
> Source de verite produit: `specs/`.
> Utilitaire de preparation pour la future implementation apres `UI reset`.

## Objectif

Generer rapidement un squelette conforme au standard `Page + Controller + Sections`.

## Commande

```bash
npm run scaffold:page -- --name <FeatureName>
```

Exemple:

```bash
npm run scaffold:page -- --name ModerationQueue
```

Option overwrite:

```bash
npm run scaffold:page -- --name ModerationQueue --force
```

## Fichiers generes

Pour `FeatureName=ModerationQueue`:

- `src/pages/ModerationQueuePage.tsx`
- `src/hooks/useModerationQueuePageController.ts`
- `src/hooks/useModerationQueuePageController.test.ts`
- `src/components/moderation-queue/ModerationQueueMainSection.tsx`

## Ce que le scaffold couvre

- `Page` de composition Tailwind/TailAdmin (wrapper `main` + classes utilitaires) branchee au controller.
- `Controller` minimal avec statuts explicites (`isLoading`, `errorMessage`).
- `Section` principale de rendu avec fallback loading/error.
- Test unitaire de base du controller.

## Ce que le scaffold ne fait pas

- n'ajoute pas la route automatiquement dans `src/routes/AppRoutes.tsx`
- n'ajoute pas de logique API/Redux
- n'ajoute pas d'i18n

## Post-generation recommande

1. Corriger le nommage si necessaire (acronymes/metier) avant commit.
2. Brancher la route.
3. Remplacer les placeholders controller par les vrais use-cases.
4. Decouper en sections supplementaires (overview/list/detail/actions) selon le besoin.
5. Ajouter tests integration + parcours critique.

## References

- `docs/UI-ARCHITECTURE.md`
- `docs/DEVELOPMENT-BEST-PRACTICES.md`
- `docs/PR-CHECKLIST-UI-STATEFUL-REFACTOR.md`
