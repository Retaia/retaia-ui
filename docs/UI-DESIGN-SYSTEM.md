# UI Design System (Bootstrap/Sass) — retaia-ui

> Statut : non normatif.
> Source produit: `specs/`.

## Objectif

Conserver une UI simple, cohérente et desktop-like en privilégiant Bootstrap, avec un minimum de surcharge locale.

## Règles

- Utiliser d'abord les composants Bootstrap/React-Bootstrap.
- Éviter le CSS custom par composant.
- Limiter les ajustements visuels aux variables Sass globales.

## Tokens Sass actifs

Fichier source: `src/index.scss`

- Typo: `$font-family-sans-serif`, `$headings-font-family`
- Couleurs: `$primary`, `$success`, `$danger`, `$warning`, `$info`
- Rayons: `$border-radius*`, `$btn-border-radius`, `$input-border-radius`, `$card-border-radius`, `$list-group-border-radius`
- Densité: `$card-cap-padding-*`, `$list-group-item-padding-*`
- Badge: `$badge-border-radius`

## Patterns de composants

- Boutons d'actions: variantes Bootstrap (`outline-success`, `outline-danger`, `outline-secondary`, `warning`)
- Actions: séparer visuellement les actions générales et les actions batch via sections `Card`/`section` Bootstrap
- Cartes de sections: `Card` avec hiérarchie typographique (`h5`, `h6`, `small`)
- Liste interactive: `ListGroup` + état `active` + état batch (`list-group-item-warning`)
- Layout principal: grille Bootstrap (`Container`, `Row`, `Col`)
- Action destructive (purge): bloc dédié avec bordure `danger-subtle`, CTA en 2 étapes (preview puis confirm)
- Feedback asynchrone: message `role=\"status\"` / `aria-live=\"polite\"` pour preview/execute/report/purge

## Évolutions

- Toute nouvelle personnalisation visuelle doit d'abord être tentée via variables Sass Bootstrap.
- Si un style local devient nécessaire, documenter la raison et garder la portée minimale.
