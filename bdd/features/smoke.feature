@ui-reset
Feature: Chargement de l'interface reset
  En tant qu'utilisateur
  Je veux vérifier les surfaces canoniques actives
  Afin de garantir un smoke test BDD pendant la refonte UI

  Scenario: Afficher le shell review canonique
    Given je suis sur la page d'accueil
    Then le titre principal "Review" est visible
    And le message "Le workspace Review sert maintenant la lecture liste + détail" est visible

  Scenario: Afficher la surface auth publique
    Given je suis sur la page "/auth"
    Then le titre principal "Authentification et récupération" est visible
    And le message "Surface publique pour connexion" est visible
