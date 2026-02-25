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
- choisir le type de tag:
  - Release Candidate: `vX.Y.Z-rc.N` (ex: `v1.0.0-rc.1`)
  - Release stable: `vX.Y.Z` (ex: `v1.0.0`)
- créer et pousser le tag:
  - `git checkout master`
  - `git pull --ff-only origin master`
  - `git tag -a v1.0.0-rc.1 -m "UI v1.0.0 RC1"`
  - `git push origin v1.0.0-rc.1`
- publication GitHub Release automatique via `.github/workflows/release.yml`:
  - tag `v*-rc.*` => GitHub pre-release
  - tag `v*` (sans suffixe `-rc.N`) => GitHub release stable

## Post-release

- valider la smoke-prod (review -> batch-only -> execute -> report)
- archiver les notes de release dans l’outil de suivi
