Feature: Chargement de l'interface
  En tant qu'utilisateur
  Je veux ouvrir l'UI
  Afin de démarrer la review

  Scenario: Afficher la page principale
    Given je suis sur la page d'accueil
    Then le titre principal "Retaia UI" est visible
