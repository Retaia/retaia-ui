#!/usr/bin/env sh
set -eu

changed_openapi=0

if git diff --name-only "origin/${BASE_REF:-master}"...HEAD | grep -Eq '^(api/openapi/v1\.yaml|specs)$'; then
  changed_openapi=1
fi

if [ "$changed_openapi" -eq 0 ]; then
  echo "OpenAPI governance check not required for this branch."
  exit 0
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "OpenAPI changed but GitHub CLI is unavailable for PR governance validation." >&2
  exit 1
fi

pr_json="$(mktemp)"
trap 'rm -f "$pr_json"' EXIT

if ! gh pr view --json body,baseRefName >"$pr_json"; then
  echo "OpenAPI changed but no open PR metadata is available. Open a PR before pushing again." >&2
  exit 1
fi

base_ref="$(node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); process.stdout.write(data.baseRefName || 'master');" "$pr_json")"

GITHUB_EVENT_NAME=pull_request \
GITHUB_BASE_REF="$base_ref" \
GITHUB_EVENT_PATH="$pr_json" \
npm run api:governance:check
