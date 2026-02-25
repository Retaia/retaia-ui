# Docker Development — retaia-ui

> Statut : non normatif.

## État actuel

Le repository UI fournit une image Docker de production basée sur Caddy.

Fichiers clés:

- `Dockerfile` (build Vite + runtime Caddy)
- `docker/Caddyfile` (static + reverse proxy `/api/*`)
- `docker/entrypoint.sh` (injection runtime `API_BASE_URL`/`API_TOKEN` dans `runtime-config.js`)
- `docker-compose.prod.yml` (exemple Core + UI)

## Variables runtime UI

- `API_BASE_URL` (défaut: `/api/v1`)
- `API_TOKEN` (optionnel)
- `API_UPSTREAM` (défaut: `core:8000`)

Recommandation:

- en production, utiliser `API_BASE_URL=/api/v1`
- laisser Caddy proxyfier vers Core via `API_UPSTREAM`
- éviter `API_BASE_URL=http://core:8000/api/v1` côté navigateur (hostname Docker non résolvable hors réseau conteneur)

Pattern NAS + workstations (recommandé):

- NAS expose uniquement `ui` (port 8080), pas `core`.
- `ui` proxyfie `/api/*` vers `core:8000` en interne Docker.
- les agents desktop/workstations utilisent l'URL NAS:
  - `http://192.168.0.14:8080/api/v1`
- ainsi, `core` reste non exposé hors réseau Docker.

## Build image

```bash
docker build -t retaia-ui:local .
```

## Run local

```bash
docker run --rm -p 8080:80 \
  -e API_BASE_URL=/api/v1 \
  -e API_UPSTREAM=host.docker.internal:8000 \
  retaia-ui:local
```
