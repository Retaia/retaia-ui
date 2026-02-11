Feature: Workflow purge asset
  En tant qu'utilisateur de review
  Je veux prévisualiser puis confirmer une purge
  Afin d'exécuter une suppression destructive en sécurité

  Scenario: purge réussie après prévisualisation
    Given je suis sur la page d'accueil
    When je clique sur l'asset "behind-the-scenes.jpg"
    And je clique sur le bouton "Prévisualiser purge"
    Then le statut purge contient "prévisualisation purge prête"
    When je clique sur le bouton "Confirmer purge"
    Then le statut purge contient "Purge exécutée"
    And l'asset "behind-the-scenes.jpg" n'est plus visible dans la liste

  Scenario: erreur de scope sur la prévisualisation purge
    Given le mock API retourne FORBIDDEN_SCOPE sur la preview purge
    And je suis sur la page d'accueil
    When je clique sur l'asset "behind-the-scenes.jpg"
    And je clique sur le bouton "Prévisualiser purge"
    Then le statut purge contient "scope manquant"

  Scenario: conflit d'état sur la confirmation purge
    Given le mock API retourne STATE_CONFLICT sur la confirmation purge
    And je suis sur la page d'accueil
    When je clique sur l'asset "behind-the-scenes.jpg"
    And je clique sur le bouton "Prévisualiser purge"
    And je clique sur le bouton "Confirmer purge"
    Then le statut purge contient "Conflit d'état"
