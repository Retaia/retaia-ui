# Guide Utilisateur Rapide (UI v1)

## Démarrage

1. Ouvrir l'écran de review.
2. Sélectionner un asset dans la liste (clic).
3. Utiliser `KEEP`, `REJECT` ou `CLEAR`.

## Batch desktop-like

- `Shift+clic`: ajouter/retirer un asset du batch.
- `Prévisualiser batch`: valider le scope.
- `Exécuter batch`: lancer le traitement.
- `Rafraîchir rapport`: charger le statut et les échecs.

## Purge d'un asset rejeté

- ouvrir le détail d'un asset en `DECIDED_REJECT`
- cliquer `Prévisualiser purge`
- vérifier le message de preview
- cliquer `Confirmer purge`
- vérifier le message de résultat (succès ou erreur)

## Raccourcis

- `j` / `k`: navigation.
- `p`: filtre rapide sur les assets à traiter.
- `/`: focus direct sur la recherche.
- `Shift+Flèches`: extension de sélection batch.
- `Ctrl/Cmd+A`: ajouter visibles au batch.
- `Ctrl/Cmd+Z`: annuler dernière action.

## Erreurs fréquentes

- scope manquant: vérifier les droits API (`batches:execute`).
- conflit d'état: rafraîchir et relancer.
- indisponibilité temporaire: réessayer plus tard.
- purge désactivée: vérifier que l'asset est bien en état `DECIDED_REJECT`.

## Journal d'actions

- le journal trace les dernières actions utilisateur.
- `Vider journal`: remet l'historique visuel à zéro sans modifier les assets.
