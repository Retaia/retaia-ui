#!/usr/bin/env sh
set -eu

base_ref="${BASE_REF:-master}"
app_url="${APP_URL:-http://127.0.0.1:4173}"
bdd_api_mode="${BDD_API_MODE:-mock}"

echo "[pre-push] Branch hygiene"
./scripts/hooks/prevent-master-commit.sh

echo "[pre-push] Sync refs"
git fetch --no-tags origin "${base_ref}"

echo "[pre-push] branch-up-to-date"
GITHUB_EVENT_NAME=pull_request GITHUB_BASE_REF="${base_ref}" node scripts/ci/check-branch-up-to-date.mjs

echo "[pre-push] commitlint"
npx commitlint --from "origin/${base_ref}" --to HEAD --verbose

echo "[pre-push] no-black-magic"
./scripts/no-black-magic.sh

echo "[pre-push] lint"
npm run lint

echo "[pre-push] lint:architecture"
npm run lint:architecture

echo "[pre-push] dup:check"
npm run dup:check

echo "[pre-push] typecheck"
npm run typecheck

echo "[pre-push] i18n:check"
npm run i18n:check

echo "[pre-push] api:contract:check"
npm run api:contract:check

echo "[pre-push] api:governance:check"
./scripts/hooks/run-openapi-governance-local.sh

echo "[pre-push] bdd:mock:contract:check"
npm run bdd:mock:contract:check

echo "[pre-push] test:coverage"
npm run test:coverage

echo "[pre-push] test:a11y"
npm run test:a11y

echo "[pre-push] security:audit"
npm run security:audit

echo "[pre-push] perf:ci"
npm run perf:ci

echo "[pre-push] playwright install"
npx playwright install chromium firefox webkit

for browser in chromium firefox webkit; do
  echo "[pre-push] e2e:bdd:ci (${browser})"
  PW_BROWSER="${browser}" APP_URL="${app_url}" BDD_API_MODE="${bdd_api_mode}" npm run e2e:bdd:ci

  if [ -n "${E2E_TEST_ENV_URL:-}" ]; then
    echo "[pre-push] bdd:test:real-api:ci (${browser})"
    PW_BROWSER="${browser}" APP_URL="${E2E_TEST_ENV_URL}" BDD_API_MODE=real-api npm run bdd:test:real-api:ci
  fi
done

echo "[pre-push] e2e:bdd:batch-preview-execute:ci (chromium)"
PW_BROWSER="chromium" APP_URL="${app_url}" BDD_API_MODE="${bdd_api_mode}" npm run e2e:bdd:batch-preview-execute:ci
