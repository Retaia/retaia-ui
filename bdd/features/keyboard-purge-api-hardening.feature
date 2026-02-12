# language: fr

Fonctionnalité: Hardening clavier, purge deep-link et API assets
  En tant qu'utilisateur review desktop-like
  Je veux couvrir des flux non régressifs critiques
  Afin de sécuriser le comportement cross-browser

  Scénario: Le raccourci ? ouvre/ferme l'aide en français
    Given je suis sur la page d'accueil
    When j'appuie sur la touche "?"
    Then le bouton "Voir raccourcis" est visible
    When j'appuie sur la touche "?"
    Then le bouton "Masquer raccourcis" est visible

  Scénario: Le raccourci ? ouvre/ferme l'aide en anglais
    Given je suis sur la page d'accueil
    And je bascule la langue en anglais
    When j'appuie sur la touche "?"
    Then le bouton "Show shortcuts" est visible
    When j'appuie sur la touche "?"
    Then le bouton "Hide shortcuts" est visible

  Scénario: Purge via deep-link d'un asset rejeté
    Given je suis sur la page "/review/A-003"
    Then le panneau détail affiche l'asset "behind-the-scenes.jpg"
    When je clique sur le bouton "Prévisualiser purge"
    Then le statut purge contient "prévisualisation purge prête"
    When je clique sur le bouton "Confirmer purge"
    Then le statut purge contient "Purge exécutée"

  Scénario: Focus robuste quand le filtre masque la sélection active
    Given je suis sur la page d'accueil
    When je clique sur l'asset "behind-the-scenes.jpg"
    And je filtre par état "DECISION_PENDING"
    Then la ligne asset "A-001" a tabindex "0"
    And la ligne asset "A-001" a le focus

  Scénario: Sélection de plage Shift+ArrowDown stable multi-browser
    Given je suis sur la page d'accueil
    When j'ouvre le premier asset au clavier
    And j'étends la sélection de plage jusqu'à 3 assets
    Then le batch sélectionné affiche 3

  Scénario: Liste assets API partiellement invalide sans crash UI
    Given le mock API retourne une liste assets partiellement invalide
    And je suis sur la page d'accueil en mode source API
    Then le message "Assets (1)" est visible
    And le message "UNKNOWN-ASSET-1" est visible
