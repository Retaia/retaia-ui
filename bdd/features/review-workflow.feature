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

  Scenario: Ouvrir le prochain asset à traiter via raccourci
    Given je suis sur la page d'accueil
    When j'ouvre le prochain asset à traiter via la touche n
    Then le panneau détail affiche l'asset "interview-camera-a.mov"

  Scenario: Sortir du mode batch-only puis ouvrir le prochain asset via n
    Given je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "behind-the-scenes.jpg"
    And j'appuie sur la touche "b"
    Then le titre principal "Assets (1)" est visible
    When j'appuie sur la touche "n"
    Then le titre principal "Assets (3)" est visible
    And le panneau détail affiche l'asset "interview-camera-a.mov"

  Scenario: Vider le journal d'actions
    Given je suis sur la page d'accueil
    When je clique sur le bouton "KEEP visibles"
    And je clique sur le bouton "Vider journal"
    Then le message "Aucune action pour le moment." est visible

  Scenario: Vider le journal avec le raccourci l
    Given je suis sur la page d'accueil
    When je clique sur le bouton "KEEP visibles"
    And j'appuie sur la touche "l"
    Then le message "Aucune action pour le moment." est visible

  Scenario: Annuler une exécution batch avant envoi API
    Given je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je clique sur le bouton "Exécuter batch"
    Then le message "Fenêtre d'annulation" est visible
    When je clique sur le bouton "Annuler exécution"
    Then le message "annulée avant l'appel API" est visible

  Scenario: Filtrer la liste sur le batch via raccourci clavier
    Given je suis sur la page d'accueil
    When je fais Maj+clic sur l'asset "interview-camera-a.mov"
    And je fais Maj+clic sur l'asset "behind-the-scenes.jpg"
    And j'appuie sur la touche "b"
    Then le titre principal "Assets (2)" est visible

  Scenario: Appliquer un preset de filtres rapide
    Given je suis sur la page d'accueil
    When je clique sur le bouton "Images rejetées"
    Then le titre principal "Assets (1)" est visible
    And l'état "A-003 - DECIDED_REJECT" est visible

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

  Scenario: Basculer la densité de liste au clavier
    Given je suis sur la page d'accueil
    When j'appuie sur la touche "d"
    Then le bouton "Densité: compacte" est visible

  Scenario: Appliquer un preset rapide au clavier
    Given je suis sur la page d'accueil
    When j'appuie sur la touche "2"
    Then le titre principal "Assets (1)" est visible
    And l'état "A-003 - DECIDED_REJECT" est visible

  Scenario: Focus recherche avec slash
    Given je suis sur la page d'accueil
    When j'appuie sur la touche "/"
    Then le champ de recherche a le focus

  Scenario: Vider la recherche avec Escape
    Given je suis sur la page d'accueil
    When je recherche "behind"
    And j'appuie sur la touche "Escape"
    Then le titre principal "Assets (3)" est visible

  Scenario: Fermer la sélection au clavier
    Given je suis sur la page d'accueil
    When j'ouvre le premier asset au clavier
    And j'appuie sur la touche "Escape"
    Then le message "Clique un asset pour ouvrir le détail." est visible
