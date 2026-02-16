@real-api
Feature: Real API smoke
  Scenario: Charger la review en source API sur un environnement reel
    Given je suis sur la page "/review?source=api"
    Then le titre principal "Retaia UI" est visible
    And l'URL courante contient "/review"

  Scenario: Ouvrir la page auth sur un environnement reel
    Given je suis sur la page "/auth"
    Then le bouton "Se connecter" est visible
    And l'URL courante contient "/auth"
