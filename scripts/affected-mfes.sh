#!/usr/bin/env bash
set -euo pipefail

# Emit JSON matrix of MFEs affected by the current git range.
# Usage: affected-mfes.sh [base_ref]
# Shared/tooling/catalog changes select every remote.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "${ROOT}/scripts/lib/catalog.sh"
BASE_REF="${1:-origin/main}"
CATALOG="$(load_catalog_json)"

if ! git -C "${ROOT}" rev-parse --verify "${BASE_REF}" >/dev/null 2>&1; then
  node "${ROOT}/scripts/catalog.mjs" matrix
  exit 0
fi

CHANGED="$(git -C "${ROOT}" diff --name-only "${BASE_REF}...HEAD" || true)"
SHARED_HIT=0
if echo "${CHANGED}" | grep -E '^(packages/|config/|scripts/|infra/|\.github/|pnpm-lock\.yaml|package\.json|turbo\.json|pnpm-workspace.yaml|eslint.config.js|tsconfig.json)' >/dev/null; then
  SHARED_HIT=1
fi

NAMES=()
while IFS= read -r row; do
  name="$(echo "${row}" | jq -r '.name')"
  path="$(echo "${row}" | jq -r '.path')"
  if [[ "${SHARED_HIT}" -eq 1 ]] || echo "${CHANGED}" | grep -E "^${path}/" >/dev/null; then
    NAMES+=("${name}")
  fi
done < <(echo "${CATALOG}" | jq -c '.mfes[]')

if [[ "${#NAMES[@]}" -eq 0 ]]; then
  echo '{"include":[]}'
  exit 0
fi

FILTER="$(printf '%s\n' "${NAMES[@]}" | jq -R . | jq -s .)"
echo "${CATALOG}" | jq -c --argjson names "${FILTER}" '
  . as $catalog
  | {
      include: [
        .mfes[]
        | select(.name as $n | $names | index($n))
        | {
            name,
            package,
            path,
            federationName,
            port,
            owner,
            domain,
            stagingDomain: "\(.name).\($catalog.environments.staging.domainSuffix)",
            productionDomain: .domain
          }
      ]
    }
'
