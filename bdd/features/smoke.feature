@canonical-ui
@smoke
Feature: Chargement de l'interface canonique
  En tant qu'utilisateur
  Je veux vérifier les surfaces canoniques actives
  Afin de garantir un smoke test BDD sur le runtime reellement livre

  Scenario: Afficher le shell review canonique
    Given je suis sur la page d'accueil
    Then le titre principal "Review" est visible
    And le message "Le workspace Review sert maintenant la lecture liste + détail" est visible

  Scenario: Afficher la surface auth publique
    Given je suis sur la page "/auth"
    Then le titre principal "Authentification et récupération" est visible
    And le message "Surface publique pour connexion" est visible

  Scenario: Afficher le workspace activity borne
    Given je suis sur la page "/activity"
    Then le titre principal "Activité" est visible
    And le message "Journal local uniquement" est visible

  Scenario: Signaler une exécution batch partielle sur révision obsolète
    Given le mock API retourne PRECONDITION_FAILED une seule fois sur le patch asset
    And je suis sur la page d'accueil en mode source API
    When je fais Maj+clic sur l'asset "A-001"
    And je fais Maj+clic sur l'asset "A-003"
    And je clique sur le bouton "Conserver batch"
    And je clique sur le bouton "Exécuter batch"
    And je clique sur le bouton "Exécuter maintenant"
    Then le statut d'exécution contient "partielle"
    And le statut d'exécution contient "Révision obsolète"
