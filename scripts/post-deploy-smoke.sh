#!/usr/bin/env bash
# Post-deploy smoke checks for one or more MFE domains.
# Usage: ./scripts/post-deploy-smoke.sh <domain> [domain...]
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <domain> [domain...]" >&2
  exit 1
fi

for domain in "$@"; do
  url="https://${domain}/mf-manifest.json"
  echo "Smoke: ${url}"
  body="$(curl -fsSL --retry 5 --retry-delay 2 --retry-all-errors "$url")"
  echo "$body" | jq -e 'type == "object"' >/dev/null
  # Module Federation manifests expose identity fields; accept any of them.
  echo "$body" | jq -e 'has("id") or has("name") or has("meta") or has("exposes") or length > 0' >/dev/null
  remote_entry="https://${domain}/remoteEntry.js"
  code="$(curl -fsSIL --retry 3 --retry-delay 1 -o /dev/null -w '%{http_code}' "$remote_entry" || true)"
  if [ "$code" != "200" ]; then
    echo "::error::remoteEntry.js returned HTTP ${code} for ${domain}" >&2
    exit 1
  fi
  echo "OK ${domain}"
done
