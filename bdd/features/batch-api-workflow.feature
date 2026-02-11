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
    Then le message "Prévisualisation prête pour BOTH (2 assets)" est visible
    When je clique sur le bouton "Exécuter batch"
    Then le message "Exécution du batch acceptée" est visible
    When je clique sur le bouton "Rafraîchir rapport"
    Then le message "Rapport chargé pour batch-e2e-1" est visible
    And le rapport de batch contient "\"status\": \"DONE\""
