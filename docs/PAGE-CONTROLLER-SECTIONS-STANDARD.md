# Standard Architecture UI - Page + Controller + Sections

> Statut: non normatif.
> Source de verite produit: `specs/`.
> Standard cible pour les tranches restantes et les refactors incrementaux.

## Objectif

Definir un standard unique pour construire une page orchestree sans melanger rendering, orchestration et logique metier.

## Contrat de structure

Chaque page feature suit ce triplet:

- `Page` (`src/pages/*Page.tsx`): composition layout/routing et wiring des callbacks.
- `Controller` (`src/hooks/use*PageController.ts`): orchestration d'etat, side-effects et actions UI.
- `Sections` (`src/components/<feature>/*Section.tsx`): blocs de rendu focalises, sans acces API direct.

## Responsabilites

### Page

- Lit les params de route/query utiles a la navigation.
- Instancie un controller unique pour la page.
- Passe uniquement des props explicites aux sections.
- Porte les gardes de navigation (`unsaved changes`, redirects explicites).

Interdits:

- pas d'appel API direct
- pas de logique metier inline complexe

### Controller

- Compose les sous-hooks de domaine (`selection`, `batch`, `auth`, etc.).
- Expose un shape stable: `state derive`, `actions`, `availability`.
- Centralise les side-effects runtime (telemetry, persistance locale, sync URL).
- Delegue la logique metier pure vers `src/domain/*` et `src/application/*`.

Interdits:

- pas de JSX
- pas d'import de `src/pages/*` ou `src/components/*`

### Sections

- Rendent un sous-flux lisible et focalise.
- Restent deterministes selon les props recues.
- Emettent des intentions utilisateur via callbacks nommes.

Interdits:

- pas d'acces API direct
- pas de state metier long-terme duplique

## Shape recommande d'un controller

```ts
export type FeaturePageController = {
  // Etat derive
  isLoading: boolean
  errorMessage: string | null
  availability: {
    canExecute: boolean
    canUndo: boolean
  }

  // Etat de donnees
  items: ItemSummary[]
  selectedItemId: string | null

  // Actions utilisateur
  onSelectItem: (itemId: string) => void
  onExecutePrimaryAction: () => Promise<void>
  onUndo: () => void
}
```

Regles:

- nommer les callbacks avec prefixe `on*`
- eviter les unions de props non necessaires
- exposer les statuts async de facon explicite (`idle/loading/success/error`)

## Arborescence cible par feature

```text
src/
  pages/
    FeaturePage.tsx
  hooks/
    useFeaturePageController.ts
    feature/
      useFeatureSelection.ts
      useFeatureActions.ts
  components/
    feature/
      FeatureOverviewSection.tsx
      FeatureListSection.tsx
      FeatureDetailSection.tsx
  application/feature/
    featureUseCases.ts
  domain/feature/
    featureRules.ts
```

## Checklist de review associee

- La page reste un fichier de composition.
- Le controller expose un contrat stable et testable.
- Chaque section a un scope de rendu clair.
- Les invariants d'etat partage sont preservés.
- Les tests couvrent au minimum: une action critique, un etat d'erreur, un retour navigation.

## Migration incrementalement sure

1. Extraire une section UI a la fois depuis la page.
2. Deplacer la logique non-UI dans le controller.
3. Isoler les calculs purs dans `application/` ou `domain/`.
4. Stabiliser les props publiques avant refactor suivant.

## References internes

- `docs/UI-ARCHITECTURE.md`
- `docs/DEVELOPMENT-BEST-PRACTICES.md`
- `docs/PR-CHECKLIST-UI-STATEFUL-REFACTOR.md`
