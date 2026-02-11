Feature: Workflow batch API en erreur
  En tant qu'utilisateur
  Je veux des messages explicites sur les erreurs API critiques
  Afin de savoir quoi faire ensuite

  Scenario: erreur de scope lors de la preview batch
    Given le mock API retourne FORBIDDEN_SCOPE sur la preview batch
    And je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je clique sur le bouton "Prévisualiser batch"
    Then le statut de prévisualisation contient "échec"
    And le statut de prévisualisation contient "scope manquant"

  Scenario: conflit d'état lors de l'exécution batch
    Given le mock API retourne STATE_CONFLICT sur l'exécution batch
    And je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je clique sur le bouton "Exécuter batch"
    Then le statut d'exécution contient "échec"
    And le statut d'exécution contient "Conflit d'état"

  Scenario: indisponibilité temporaire lors du chargement rapport
    Given le mock API retourne TEMPORARY_UNAVAILABLE sur le rapport batch
    And je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je clique sur le bouton "Exécuter batch"
    And je clique sur le bouton "Rafraîchir rapport"
    Then le message "Chargement rapport en échec" est visible
    And le message "Indisponibilité temporaire" est visible
