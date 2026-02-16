#!/usr/bin/env sh
set -eu

# Detached HEAD should not be treated as a branch commit.
current_branch="$(git symbolic-ref --quiet --short HEAD || true)"

if [ "$current_branch" = "master" ]; then
  echo "Direct commit on master is blocked. Create/use a feature branch (codex/*)." >&2
  exit 1
fi
