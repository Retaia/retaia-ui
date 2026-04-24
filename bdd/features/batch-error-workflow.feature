@canonical-ui
Feature: Workflow batch API en erreur
  En tant qu'utilisateur
  Je veux des messages explicites sur les erreurs API critiques
  Afin de savoir quoi faire ensuite

  Scenario: preview batch sans décision éligible
    Given je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je clique sur le bouton "Prévisualiser batch"
    Then le statut de prévisualisation contient "échec"
    And le statut de prévisualisation contient "Aucune décision batch éligible"

  Scenario: erreur de scope lors de l'application batch
    Given le mock API retourne FORBIDDEN_SCOPE sur le patch asset
    And je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je clique sur le bouton "Conserver batch"
    And je clique sur le bouton "Exécuter batch"
    And je clique sur le bouton "Exécuter maintenant"
    Then le statut d'exécution contient "échec"
    And le statut d'exécution contient "Droit insuffisant"

  Scenario: rapport local déjà à jour après exécution
    Given je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je clique sur le bouton "Conserver batch"
    And je clique sur le bouton "Exécuter batch"
    And je clique sur le bouton "Exécuter maintenant"
    And je clique sur le bouton "Rafraîchir rapport"
    Then le message "Rapport local déjà à jour." est visible
