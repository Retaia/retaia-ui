# Release Checklist (UI v1)

## Pré-release

- `npm ci`
- `npm run qa:v1:go-no-go`
- `npm run qa`
- `npm run qa:v1:flows`
- `npm run e2e:bdd:ci`
- `npm run visual:test`
- vérifier le runbook `docs/UI-QUALITY-RUNBOOK.md`
- vérifier `.env.example` (`VITE_API_BASE_URL`, `VITE_API_TOKEN`)

## GitHub

- toutes les PR ciblées sont mergées sur `master`
- checks CI verts sur `master`
- pas de PR critique en attente

## Versioning

- mettre à jour `CHANGELOG.md` (`[Unreleased]` -> version/date)
- créer un tag release:
  - `git checkout master`
  - `git pull --ff-only origin master`
  - `git tag -a ui-v1.0.0 -m "UI v1.0.0"`
  - `git push origin ui-v1.0.0`

## Post-release

- valider la smoke-prod (review -> batch-only -> execute -> report)
- archiver les notes de release dans l’outil de suivi
