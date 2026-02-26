@critical
Feature: Parcours critiques de review
  En tant qu'utilisateur
  Je veux que les flux essentiels restent stables
  Afin de pouvoir reviewer rapidement sans regression majeure

  @critical
  Scenario: Ouvrir le detail d'un asset au clic
    Given je suis sur la page d'accueil
    When je clique sur l'asset "behind-the-scenes.jpg"
    Then le panneau détail affiche l'asset "behind-the-scenes.jpg"

  @critical
  Scenario: Creer un batch avec Maj+clic puis appliquer KEEP
    Given je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je fais Maj+clic sur l'asset "behind-the-scenes.jpg"
    Then le batch sélectionné affiche 2
    When je clique sur le bouton "KEEP batch"
    Then l'état "A-001 - DECIDED_KEEP" est visible
    And l'état "A-003 - DECIDED_KEEP" est visible

  @critical
  Scenario: Annuler une decision au clavier
    Given je suis sur la page d'accueil
    When je rejette le premier asset de la liste
    Then l'état "A-001 - DECIDED_REJECT" est visible
    When j'utilise le raccourci annuler
    Then l'état "A-001 - DECISION_PENDING" est visible

  @critical
  Scenario: Executer un batch et voir le rapport
    Given je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je clique sur le bouton "Exécuter batch"
    And j'appuie sur la touche "Shift+Enter"
    Then le message "Exécution du batch acceptée" est visible
    And le rapport batch affiche le statut "DONE"

  @critical
  Scenario: Changer la langue vers l'anglais
    Given je suis sur la page d'accueil
    When je bascule la langue en anglais
    Then le libellé de recherche anglais est visible

  @critical
  Scenario: Naviguer entre review activity library detail et retour contexte
    Given je suis sur la page "/review?state=DECISION_PENDING&media_type=VIDEO&sort=name&q=interview"
    When je clique sur le bouton "Activité"
    Then l'URL courante contient "/activity"
    When je clique sur le bouton "Review"
    Then l'URL courante contient "/review"
    And l'URL courante contient "state=DECISION_PENDING"
    And l'URL courante contient "media_type=VIDEO"
    And l'URL courante contient "sort=name"
    And l'URL courante contient "q=interview"
    When je clique sur l'asset "interview-camera-a.mov"
    And je clique sur l'element testid "asset-open-standalone"
    Then l'URL courante contient "/review/detail/A-001"
    And l'URL courante contient "from=%2Freview%3Fstate%3DDECISION_PENDING"
    When je clique sur le bouton "Retour review"
    Then l'URL courante contient "/review"
    And l'URL courante contient "state=DECISION_PENDING"
    And l'URL courante contient "media_type=VIDEO"
    And l'URL courante contient "sort=name"
    And l'URL courante contient "q=interview"
    When je clique sur le bouton "Library"
    Then l'URL courante contient "/library"
    Given je suis sur la page "/library/detail/A-002?from=%2Flibrary"
    Then l'URL courante contient "/library/detail/A-002"
    When je clique sur le bouton "Retour library"
    Then l'URL courante contient "/library"
