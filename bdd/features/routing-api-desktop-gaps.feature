# language: fr

Fonctionnalité: Couverture fonctionnelle routing, API source et signaux desktop
  En tant qu'utilisateur review desktop-like
  Je veux des flux navigateur/API/UI vérifiés en BDD
  Afin de sécuriser les comportements hors cas nominaux

  Scénario: Deep-link vers un détail via route
    Given je suis sur la page "/review/A-003"
    Then le panneau détail affiche l'asset "behind-the-scenes.jpg"
    And l'URL courante contient "/review/A-003"

  Scénario: Navigation browser back/forward entre deux détails
    Given je suis sur la page d'accueil
    When je clique sur l'asset "interview-camera-a.mov"
    And je clique sur l'asset "behind-the-scenes.jpg"
    Then l'URL courante contient "/review/A-003"
    When je reviens en arrière dans l'historique navigateur
    Then l'URL courante contient "/review/A-001"
    And le panneau détail affiche l'asset "interview-camera-a.mov"
    When j'avance dans l'historique navigateur
    Then l'URL courante contient "/review/A-003"
    And le panneau détail affiche l'asset "behind-the-scenes.jpg"

  Scénario: Signaux desktop de sélection et batch
    Given je suis sur la page d'accueil
    Then le statut de sélection affiche "Aucun asset sélectionné"
    And le statut batch affiche 0
    When je clique sur l'asset "interview-camera-a.mov"
    Then le statut de sélection affiche "Sélection active: A-001"
    When je fais Maj+clic sur l'asset "behind-the-scenes.jpg"
    Then le statut batch affiche 1
    And le panneau détail est sticky en desktop

  Scénario: Mode source API affiche un chargement
    Given le mock API retarde la liste assets de 1200 ms
    And je suis sur la page d'accueil en mode source API
    Then le statut de chargement assets API est visible

  Scénario: Mode source API affiche une erreur et garde une UI exploitable
    Given le mock API retourne une erreur sur la liste assets
    And je suis sur la page d'accueil en mode source API
    Then le statut d'erreur assets API est visible
    And le message "Assets (3)" est visible
