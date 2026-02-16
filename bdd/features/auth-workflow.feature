Feature: Workflow authentification API
  En tant qu'utilisateur
  Je veux gérer auth, recovery et MFA via l'écran Auth
  Afin de couvrir les flux v1 alignés au contrat API

  Scenario: Login avec challenge OTP puis activation/desactivation 2FA
    Given le mock API auth requiert OTP une fois
    And je suis sur la page "/auth"
    When je saisis "admin@example.com" dans le champ testid "auth-email-input"
    And je saisis "secret" dans le champ testid "auth-password-input"
    And je clique sur l'element testid "auth-login"
    Then le testid "auth-status" contient "La 2FA est requise"
    When je saisis "123456" dans le champ testid "auth-otp-input"
    And je clique sur l'element testid "auth-login"
    Then le testid "auth-status" contient "Authentification réussie."
    And le testid "auth-mfa-setup" est visible
    When je clique sur l'element testid "auth-mfa-setup"
    Then le testid "auth-mfa-setup-material" est visible
    When je saisis "123456" dans le champ testid "auth-mfa-otp-action-input"
    And je clique sur l'element testid "auth-mfa-enable"
    Then le testid "auth-mfa-status" contient "activée"
    When je saisis "654321" dans le champ testid "auth-mfa-otp-action-input"
    And je clique sur l'element testid "auth-mfa-disable"
    Then le testid "auth-mfa-status" contient "désactivée"

  Scenario: Recovery mot de passe et verification email
    Given je suis sur la page "/auth"
    When je saisis "user@example.com" dans le champ testid "auth-lost-password-email-input"
    And je clique sur l'element testid "auth-lost-password-request"
    Then le testid "auth-lost-password-status" contient "Demande envoyée"
    When je clique sur l'element testid "auth-lost-password-mode-reset"
    And je saisis "token-123" dans le champ testid "auth-lost-password-token-input"
    And je saisis "new-secret" dans le champ testid "auth-lost-password-new-password-input"
    And je clique sur l'element testid "auth-lost-password-reset"
    Then le testid "auth-lost-password-status" contient "Mot de passe réinitialisé."
    When je saisis "user@example.com" dans le champ testid "auth-verify-email-input"
    And je clique sur l'element testid "auth-verify-email-request"
    Then le testid "auth-verify-email-status" contient "Demande de vérification envoyée."
    When je clique sur l'element testid "auth-verify-email-mode-confirm"
    And je saisis "verify-token" dans le champ testid "auth-verify-email-token-input"
    And je clique sur l'element testid "auth-verify-email-confirm"
    Then le testid "auth-verify-email-status" contient "Email vérifié."

  Scenario: Admin bascule la feature globale 2FA
    Given je suis sur la page "/auth"
    When je saisis "admin@example.com" dans le champ testid "auth-email-input"
    And je saisis "secret" dans le champ testid "auth-password-input"
    And je clique sur l'element testid "auth-login"
    Then le testid "auth-status" contient "Authentification réussie."
    And le testid "auth-app-feature-state" contient "Feature globale 2FA: activée"
    When je clique sur l'element testid "auth-app-feature-toggle"
    Then le testid "auth-app-feature-status" contient "Feature globale 2FA désactivée."

  Scenario: Connexion API settings et deconnexion
    Given je suis sur la page "/auth"
    When je saisis "https://api.local/v1" dans le champ testid "api-base-url-input"
    And je clique sur l'element testid "api-connection-save"
    Then le testid "api-connection-status" contient "Configuration API enregistrée."
    When je saisis "admin@example.com" dans le champ testid "auth-email-input"
    And je saisis "secret" dans le champ testid "auth-password-input"
    And je clique sur l'element testid "auth-login"
    Then le testid "auth-status" contient "Authentification réussie."
    When je clique sur l'element testid "api-connection-test"
    Then le testid "api-connection-status" contient "Connexion API valide."
    When je clique sur l'element testid "api-connection-clear"
    Then le testid "api-connection-status" contient "Configuration API supprimée."
    When je clique sur l'element testid "auth-logout"
    Then le testid "auth-status" contient "Déconnexion effectuée."

  Scenario: Admin confirme un email utilisateur
    Given je suis sur la page "/auth"
    When je saisis "admin@example.com" dans le champ testid "auth-email-input"
    And je saisis "secret" dans le champ testid "auth-password-input"
    And je clique sur l'element testid "auth-login"
    Then le testid "auth-status" contient "Authentification réussie."
    When je clique sur l'element testid "auth-verify-email-mode-admin"
    And je saisis "target@example.com" dans le champ testid "auth-verify-email-input"
    And je clique sur l'element testid "auth-verify-email-admin-confirm"
    Then le testid "auth-verify-email-status" contient "Email confirmé par admin."
