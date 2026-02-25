# Docker Development — retaia-ui

> Statut : non normatif.

## État actuel

Le repository UI fournit une image Docker de production basée sur Caddy.
La topologie de déploiement (NAS/LAN, Core privé, gateway Caddy, flux API) est normative dans:

- `specs/architecture/DEPLOYMENT-TOPOLOGY.md`

Fichiers clés:

- `Dockerfile` (build Vite + runtime Caddy)
- `docker/Caddyfile` (serveur statique pour l'image UI)
- `docker/Caddyfile.prod.example` (Caddy frontal Core FPM + UI)
- `docker/entrypoint.sh` (injection runtime `API_BASE_URL`/`API_TOKEN` dans `runtime-config.js`)
- `docker-compose.prod.yml` (exemple Core + UI + Caddy + DB)

## Variables runtime UI

- `API_BASE_URL` (défaut: `/api/v1`)
- `API_TOKEN` (optionnel)

Recommandation:

- en production, utiliser `API_BASE_URL=/api/v1`
- éviter les hostnames Docker internes côté navigateur (`core:9000`, etc.).
- utiliser la gateway LAN documentée dans la spec de déploiement.

Note:

- `docker-compose.prod.yml` reste un exemple local au repo UI.
- la topologie et les règles d'exposition réseau restent centralisées dans les specs.

## Build image

```bash
docker build -t retaia-ui:local .
```

## Run local

```bash
docker run --rm -p 8080:80 \
  -e API_BASE_URL=/api/v1 \
  retaia-ui:local
```
