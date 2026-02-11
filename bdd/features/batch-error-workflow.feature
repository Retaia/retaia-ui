Feature: Workflow batch API en erreur
  En tant qu'utilisateur
  Je veux des messages explicites sur les erreurs API critiques
  Afin de savoir quoi faire ensuite

  Scenario: erreur de scope lors de la preview batch
    Given le mock API retourne FORBIDDEN_SCOPE sur la preview batch
    And je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je clique sur le bouton "Prévisualiser batch"
    Then le message "Prévisualisation en échec: Droit insuffisant pour cette action (scope manquant)." est visible

  Scenario: conflit d'état lors de l'exécution batch
    Given le mock API retourne STATE_CONFLICT sur l'exécution batch
    And je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je clique sur le bouton "Exécuter batch"
    Then le message "Exécution en échec: Conflit d'état: rafraîchir puis réessayer." est visible

  Scenario: indisponibilité temporaire lors du chargement rapport
    Given le mock API retourne TEMPORARY_UNAVAILABLE sur le rapport batch
    And je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je clique sur le bouton "Exécuter batch"
    And je clique sur le bouton "Rafraîchir rapport"
    Then le message "Chargement rapport en échec: Indisponibilité temporaire: réessayer plus tard." est visible
