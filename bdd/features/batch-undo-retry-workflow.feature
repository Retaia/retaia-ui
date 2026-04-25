@canonical-ui
Feature: Workflow batch preview + execute now
  En tant qu'utilisateur desktop-like
  Je veux previsualiser puis confirmer l'execution
  Afin de garder un flux batch fiable

  Scenario: Prévisualisation batch réussie sur plusieurs assets éligibles
    And je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je fais Maj+clic sur l'asset "behind-the-scenes.jpg"
    And je clique sur le bouton "Prévisualiser batch"
    Then le statut de prévisualisation contient "BOTH"

  Scenario: Exécution batch confirmée immédiatement
    Given je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je fais Maj+clic sur l'asset "behind-the-scenes.jpg"
    And je clique sur le bouton "Exécuter batch"
    And je clique sur le bouton "Exécuter maintenant"
    Then le statut d'exécution contient "acceptée"
