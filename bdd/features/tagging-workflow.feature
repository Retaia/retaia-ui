Feature: Workflow tagging v1
  En tant qu'utilisateur de review
  Je veux éditer tags et notes depuis le détail asset
  Afin d'enregistrer un tagging humain conforme au contrat API

  Scenario: Sauvegarder tags et notes en mode source API
    Given je suis sur la page d'accueil en mode source API
    When je clique sur l'asset "A-001"
    And je saisis le tag "urgent"
    And je clique sur ajouter tag
    And je saisis la note "Plan de montage"
    And je sauvegarde le tagging
    Then le statut tagging contient "Tagging enregistré"
    And la liste de tags contient "urgent"
    And le mock API reçoit un patch asset avec le tag "urgent" et la note "Plan de montage"

  Scenario: Erreur de scope lors du patch tagging
    Given le mock API retourne FORBIDDEN_SCOPE sur le patch asset
    And je suis sur la page d'accueil en mode source API
    When je clique sur l'asset "A-001"
    And je saisis le tag "blocked"
    And je clique sur ajouter tag
    And je saisis la note "No rights"
    And je sauvegarde le tagging
    Then le statut tagging contient "scope manquant"
