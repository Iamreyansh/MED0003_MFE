#!/usr/bin/env bash
# Post-deployment tests against a deployed MFE origin.
# Usage: post-deploy-pdt.sh <mfe-name> <domain>
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NAME="${1:?mfe name required}"
DOMAIN="${2:?domain required}"
PACKAGE="$(node "${ROOT}/scripts/catalog.mjs" get "${NAME}" | jq -r '.package')"

export PDT_BASE_URL="https://${DOMAIN}"
export CI=true

pnpm exec playwright install --with-deps chromium
pnpm --filter "${PACKAGE}" exec playwright test -c e2e/playwright.config.ts
