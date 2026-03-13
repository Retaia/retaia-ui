@ui-reset
Feature: Chargement de l'interface reset
  En tant qu'utilisateur
  Je veux vérifier les placeholders actifs
  Afin de garantir un smoke test BDD pendant le reset UI

  Scenario: Afficher le placeholder review
    Given je suis sur la page d'accueil
    Then le titre principal "Review UI removed" est visible
    And le message "UI reset in progress" est visible

  Scenario: Afficher le placeholder auth
    Given je suis sur la page "/auth"
    Then le titre principal "Auth UI removed" est visible
    And le message "UI reset in progress" est visible
