# Guide Utilisateur Rapide (UI v1)

## Démarrage

1. Ouvrir l'écran de review.
2. Sélectionner un asset dans la liste (clic).
3. Utiliser `KEEP`, `REJECT` ou `CLEAR`.

## Batch desktop-like

- `Shift+clic`: ajouter/retirer un asset du batch.
- lire le bloc `Périmètre d'exécution` pour vérifier le scope avant action.
- `Prévisualiser batch`: valider le scope.
- `Exécuter batch`: lancer le traitement.
- le rapport se charge automatiquement après exécution.
- `Rafraîchir rapport`: relancer la lecture du rapport si besoin.

## Vues enregistrées

- `Standard`: revient à la vue globale.
- `À traiter`: applique la vue `DECISION_PENDING`.
- `Batch`: active la vue `batch seul`.

## Purge d'un asset rejeté

- ouvrir le détail d'un asset en `DECIDED_REJECT`
- cliquer `Prévisualiser purge`
- vérifier le message de preview
- cliquer `Confirmer purge`
- vérifier le message de résultat (succès ou erreur)

## Raccourcis

- au premier lancement, le panneau raccourcis s'ouvre automatiquement.
- `j` / `k`: navigation.
- `?`: ouvrir/fermer l'aide des raccourcis.
- `p`: filtre rapide sur les assets à traiter.
- `b`: bascule filtre "batch seul".
- `n`: ouvre le prochain asset à traiter et sort des filtres actifs.
- `/`: focus direct sur la recherche.
- `Shift+Flèches`: extension de sélection batch.
- `Ctrl/Cmd+A`: ajouter visibles au batch.
- `Ctrl/Cmd+Z`: annuler dernière action.

## Erreurs fréquentes

- scope manquant: vérifier les droits API (`batches:execute`).
- conflit d'état: rafraîchir et relancer.
- indisponibilité temporaire: le client relance automatiquement avec backoff (jusqu'à 2 retries), puis affiche l'erreur finale.
- purge désactivée: vérifier que l'asset est bien en état `DECIDED_REJECT`.

## États vides

- si le filtre/recherche est trop restrictif, ajuster ou réinitialiser les filtres.
- en mode `batch seul`, ajouter des assets via `Shift+clic` pour remplir la liste.

## Journal d'actions

- le journal trace les dernières actions utilisateur.
- `Vider journal`: remet l'historique visuel à zéro sans modifier les assets.
