# Contributing (retaia-ui)

## Source de vérité
Le comportement UI doit rester aligné sur `retaia-docs`.
Ne pas inventer de logique produit en dehors de la spec.

## Workflow Git
- Branche depuis `master` (préfixe recommandé: `codex/`).
- Commits et PR atomiques.
- Rebase sur `master` avant merge.
- Pas de merge commit de synchronisation.

## Exigences de PR
- Utiliser les payloads runtime contractuels sans heuristiques locales.
- Respecter l'arbitrage: `feature_flags -> app_feature_enabled -> user_feature_enabled -> dependencies/escalation`.
- `app_feature_enabled` est global admin.
- L'UI applique `effective_feature_enabled` pour le rendu et les actions.
- Couvrir les cas OFF/ON et les refus `403 FORBIDDEN_SCOPE`.

## Règles sécurité
- Ne jamais afficher/exporter les tokens sensibles.
- Éviter toute fuite PII/secrets dans logs, crash reports ou analytics.
