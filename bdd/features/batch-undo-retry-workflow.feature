Feature: Workflow batch undo + retry
  En tant qu'utilisateur desktop-like
  Je veux confirmer/annuler l'exécution et tolérer une erreur temporaire
  Afin de garder un flux batch fiable

  Scenario: Prévisualisation batch réussie après un retry temporaire
    Given le mock API retourne TEMPORARY_UNAVAILABLE une fois sur la preview batch
    And je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je fais Maj+clic sur l'asset "behind-the-scenes.jpg"
    And je clique sur le bouton "Prévisualiser batch"
    Then le statut de prévisualisation contient "BOTH"

  Scenario: Exécution batch annulée pendant la fenêtre undo
    Given je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je clique sur le bouton "Exécuter batch"
    Then le message "Fenêtre d'annulation" est visible
    When je clique sur le bouton "Annuler exécution"
    Then le message "annulée avant l'appel API" est visible

  Scenario: Exécution batch confirmée immédiatement
    Given je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je fais Maj+clic sur l'asset "behind-the-scenes.jpg"
    And je clique sur le bouton "Exécuter batch"
    And je clique sur le bouton "Exécuter maintenant"
    Then le statut d'exécution contient "acceptée"
