#!/usr/bin/env bash
set -euo pipefail

# Patterns disallowed in application/runtime code to avoid hidden behavior.
readonly FORBIDDEN_PATTERN='\beval\s*\(|\bnew\s+Function\s*\(|\bFunction\s*\(|\bsetTimeout\s*\(\s*["\x27`]|\bsetInterval\s*\(\s*["\x27`]|\brequire\s*\(\s*[^"\x27`]|\bdocument\.write\s*\('

# Restrict scan to runtime source paths to avoid false positives in docs/build artifacts.
readonly TARGETS=(src)

if rg -n --pcre2 --color=never "$FORBIDDEN_PATTERN" "${TARGETS[@]}"; then
  echo
  echo "Forbidden dynamic/runtime pattern detected."
  echo "Refactor to explicit dependencies and typed code paths."
  exit 1
fi

echo "No forbidden dynamic/runtime patterns detected."
