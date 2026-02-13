Feature: Workflow décisions batch API
  En tant qu'utilisateur en mode API réel
  Je veux que les actions batch envoient des décisions au serveur
  Afin de garder l'état UI aligné avec l'API

  Scenario: KEEP batch envoie une décision par asset du batch
    Given je suis sur la page d'accueil en mode source API
    When je fais Maj+clic sur l'asset "A-001"
    And je fais Maj+clic sur l'asset "A-003"
    And je clique sur le bouton "KEEP batch"
    Then le mock API a reçu 2 décisions asset
    And l'état "A-001 - DECIDED_KEEP" est visible
    And l'état "A-003 - DECIDED_KEEP" est visible
