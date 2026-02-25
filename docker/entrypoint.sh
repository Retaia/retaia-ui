#!/bin/sh
set -eu

escape_js_string() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

API_BASE_URL_VALUE="${API_BASE_URL:-/api/v1}"
API_TOKEN_VALUE="${API_TOKEN:-}"

API_BASE_URL_ESCAPED="$(escape_js_string "$API_BASE_URL_VALUE")"
API_TOKEN_ESCAPED="$(escape_js_string "$API_TOKEN_VALUE")"

cat > /srv/runtime-config.js <<CONFIG
window.__RETAIA_RUNTIME_CONFIG__ = {
  API_BASE_URL: "${API_BASE_URL_ESCAPED}",
  API_TOKEN: "${API_TOKEN_ESCAPED}"
};
CONFIG

exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
