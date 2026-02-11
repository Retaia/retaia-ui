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

  Scenario: Workflow batch complet avec sélection de plage et undo
    Given je suis sur la page d'accueil
    When j'ouvre le premier asset au clavier
    And j'étends la sélection de plage jusqu'à 3 assets
    Then le batch sélectionné affiche 3
    When j'applique l'action "KEEP batch"
    Then l'état "A-001 - DECIDED_KEEP" est visible
    Then l'état "A-003 - DECIDED_KEEP" est visible
    When j'utilise le raccourci annuler
    Then l'état "A-001 - DECISION_PENDING" est visible
    Then l'état "A-003 - DECIDED_REJECT" est visible

  Scenario: Filtres recherche et no-op sur reset
    Given je suis sur la page d'accueil
    When je recherche "behind"
    And je clique sur le bouton "Réinitialiser filtres"
    Then l'historique disponible affiche 1
    When je clique sur le bouton "Réinitialiser filtres"
    Then l'historique disponible affiche 1

  Scenario: Ajouter au batch via raccourci Shift+Espace
    Given je suis sur la page d'accueil
    When je clique sur l'asset "interview-camera-a.mov"
    And j'ajoute l'asset sélectionné au batch via Shift+Espace
    Then le batch sélectionné affiche 1

  Scenario: Sélectionner tous les assets visibles via Ctrl/Cmd+A
    Given je suis sur la page d'accueil
    When je sélectionne tous les assets visibles via Ctrl/Cmd+A
    Then le batch sélectionné affiche 3

  Scenario: Décider KEEP/REJECT/CLEAR au clavier
    Given je suis sur la page d'accueil
    When j'ouvre le premier asset au clavier
    And j'appuie sur la touche "v"
    Then l'état "A-001 - DECIDED_REJECT" est visible
    When j'appuie sur la touche "g"
    Then l'état "A-001 - DECIDED_KEEP" est visible
    When j'appuie sur la touche "x"
    Then l'état "A-001 - DECISION_PENDING" est visible

  Scenario: Appliquer le filtre pending au clavier
    Given je suis sur la page d'accueil
    When j'appuie sur la touche "p"
    Then l'état "A-001 - DECISION_PENDING" est visible

  Scenario: Focus recherche avec slash
    Given je suis sur la page d'accueil
    When j'appuie sur la touche "/"
    Then le champ de recherche a le focus

  Scenario: Fermer la sélection au clavier
    Given je suis sur la page d'accueil
    When j'ouvre le premier asset au clavier
    And j'appuie sur la touche "Escape"
    Then le message "Clique un asset pour ouvrir le détail." est visible
