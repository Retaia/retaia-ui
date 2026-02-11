Feature: Workflow de review desktop-like
  En tant qu'utilisateur de review
  Je veux appliquer les interactions desktop clés
  Afin d'aller plus vite sur mes décisions

  Scenario: Ouvrir le détail au clic
    Given je suis sur la page d'accueil
    When je clique sur l'asset "behind-the-scenes.jpg"
    Then le panneau détail affiche l'asset "behind-the-scenes.jpg"

  Scenario: Créer un batch avec Maj+clic
    Given je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je fais Maj+clic sur l'asset "behind-the-scenes.jpg"
    Then le batch sélectionné affiche 2

  Scenario: Annuler une décision avec Ctrl/Cmd+Z
    Given je suis sur la page d'accueil
    When je rejette le premier asset de la liste
    Then l'état "A-001 - DECIDED_REJECT" est visible
    When j'utilise le raccourci annuler
    Then l'état "A-001 - DECISION_PENDING" est visible
