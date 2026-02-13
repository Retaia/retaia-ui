Feature: Workflow décision API
  En tant qu'utilisateur en mode API réel
  Je veux envoyer les décisions KEEP/REJECT au serveur
  Afin de respecter le contrat d'autorisation et d'état

  Scenario: REJECT déclenche un POST décision et met à jour l'état
    Given je suis sur la page d'accueil en mode source API
    When je clique sur l'asset "A-001"
    And j'appuie sur la touche "v"
    Then l'état "A-001 - DECIDED_REJECT" est visible
    And le message "Décision REJECT enregistrée" est visible

  Scenario: Conflit d'état sur une décision API
    Given le mock API retourne STATE_CONFLICT sur la décision asset
    And je suis sur la page d'accueil en mode source API
    When je clique sur l'asset "A-001"
    And j'appuie sur la touche "v"
    Then le message "Conflit d'état" est visible
    And l'état "A-001 - DECISION_PENDING" est visible

  Scenario: Proposer un rafraîchissement asset après conflit d'état
    Given le mock API retourne STATE_CONFLICT sur la décision asset
    And je suis sur la page d'accueil en mode source API
    When je clique sur l'asset "A-001"
    And j'appuie sur la touche "v"
    And je clique sur le bouton "Rafraîchir l'asset"
    Then le message "Détail de l'asset rafraîchi." est visible
