Feature: Workflow batch API
  En tant qu'utilisateur de review desktop-like
  Je veux prévisualiser, exécuter puis consulter le rapport d'un batch
  Afin de valider les actions move côté UI

  Scenario: Preview et exécution avec récupération du rapport
    Given je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je fais Maj+clic sur l'asset "behind-the-scenes.jpg"
    Then le batch sélectionné affiche 2
    When je clique sur le bouton "Prévisualiser batch"
    Then le statut de prévisualisation contient "BOTH"
    When je clique sur le bouton "Exécuter batch"
    Then le statut d'exécution contient "acceptée"
    When je clique sur le bouton "Rafraîchir rapport"
    Then le rapport batch affiche le statut "DONE"
    And le rapport batch affiche 2 assets déplacés
    And le rapport batch affiche 0 assets en échec

  Scenario: Exécution avec chargement automatique du rapport
    Given je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je fais Maj+clic sur l'asset "behind-the-scenes.jpg"
    And je clique sur le bouton "Exécuter batch"
    Then le statut d'exécution contient "acceptée"
    And le rapport batch affiche le statut "DONE"

  Scenario: Fast-path desktop avec filtre batch-only puis exécution
    Given je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je fais Maj+clic sur l'asset "behind-the-scenes.jpg"
    And j'appuie sur la touche "b"
    Then le titre principal "Assets (2)" est visible
    When je clique sur le bouton "Exécuter batch"
    Then le statut d'exécution contient "acceptée"
    And le rapport batch affiche le statut "DONE"
