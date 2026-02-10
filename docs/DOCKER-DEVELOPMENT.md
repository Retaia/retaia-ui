# Docker Development — retaia-ui

> Statut : non normatif.

## État actuel

Le repository UI ne contient pas encore de stack Docker dédiée.

## Recommandation

- Développer localement via Node.js LTS + npm.
- Utiliser `npm run dev` pour l'UI.
- Utiliser Docker seulement si une contrainte d'environnement l'impose (CI parity, outillage partagé).

## Si Docker est ajouté plus tard

Prévoir:

- un service `ui` (Vite)
- un volume pour le code source
- un cache `node_modules` maîtrisé
- des commandes CI identiques (`lint`, `typecheck`, `test`, `bdd`, `build`)
