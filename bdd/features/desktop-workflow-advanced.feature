Feature: Workflow desktop avancé
  En tant qu'utilisateur desktop
  Je veux enchaîner les interactions clés sans friction
  Afin de traiter plus vite les assets

  Scenario: Ouvrir un détail puis créer un batch sans perdre le focus métier
    Given je suis sur la page d'accueil
    When je clique sur l'asset "interview-camera-a.mov"
    Then le panneau détail affiche l'asset "interview-camera-a.mov"
    When je fais Maj+clic sur l'asset "behind-the-scenes.jpg"
    Then le batch sélectionné affiche 1

  Scenario: Basculer batch-only puis revenir sur le flux pending
    Given je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je fais Maj+clic sur l'asset "behind-the-scenes.jpg"
    And j'appuie sur la touche "b"
    Then le titre principal "Assets (2)" est visible
    When j'appuie sur la touche "p"
    Then le titre principal "Assets (1)" est visible

  Scenario: Démarrer une exécution batch et confirmer immédiatement au clavier
    Given je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je clique sur le bouton "Exécuter batch"
    Then le message "Fenêtre d'annulation" est visible
    When j'appuie sur la touche "Shift+Enter"
    Then le message "Exécution du batch acceptée" est visible

  Scenario: Réinitialiser la recherche après focus slash
    Given je suis sur la page d'accueil
    When j'appuie sur la touche "/"
    Then le champ de recherche a le focus
    When je recherche "behind"
    Then le titre principal "Assets (1)" est visible
    When j'appuie sur la touche "Escape"
    Then le titre principal "Assets (3)" est visible

  Scenario: Action rapide depuis l'aide raccourcis pour ouvrir le pending
    Given je suis sur la page d'accueil
    When je clique sur le bouton "Aller à traiter"
    Then l'état "A-001 - DECISION_PENDING" est visible
