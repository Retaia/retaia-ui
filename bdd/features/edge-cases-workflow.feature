# language: fr

Fonctionnalité: Edge cases fonctionnels review desktop-like
  En tant qu'utilisateur desktop
  Je veux des comportements robustes sur les cas limites
  Afin de garder une navigation fiable

  Scénario: Redirection depuis une route inconnue vers review
    Given je suis sur la page "/foo"
    Then l'URL courante contient "/review"
    And le titre principal "Retaia UI" est visible

  Scénario: Deep-link avec asset inconnu garde une UI exploitable
    Given je suis sur la page "/review/A-999"
    Then le message "Clique un asset pour ouvrir le détail." est visible
    And le titre principal "Assets (3)" est visible

  Scénario: Flux anglais critique
    Given je suis sur la page d'accueil
    When je bascule la langue en anglais
    Then le libellé de recherche anglais est visible
    And le message "Simple review UI for KEEP or REJECT decisions" est visible

  Scénario: Roving tabindex et focus clavier restent cohérents
    Given je suis sur la page d'accueil
    Then la ligne asset "A-001" a tabindex "0"
    And la ligne asset "A-001" a aria-selected "false"
    When j'appuie sur la touche "Enter"
    Then la ligne asset "A-001" a aria-selected "true"
    And la ligne asset "A-001" a le focus

  Scénario: Détail conservé même si filtre masque la ligne sélectionnée
    Given je suis sur la page d'accueil
    When je clique sur l'asset "behind-the-scenes.jpg"
    And je filtre par état "DECISION_PENDING"
    Then le titre principal "Assets (1)" est visible
    And le panneau détail affiche l'asset "behind-the-scenes.jpg"
