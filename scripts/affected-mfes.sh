#!/usr/bin/env bash
set -euo pipefail

# Emit JSON matrix of MFEs affected by the current git range.
# Usage: affected-mfes.sh [base_ref]

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CATALOG="${ROOT}/config/mfes.json"
BASE_REF="${1:-origin/main}"

if ! git rev-parse --verify "${BASE_REF}" >/dev/null 2>&1; then
  # First push / empty history — treat all as affected.
  jq -c '{include: [.mfes[] | {name, package, path, domain}]}' "${CATALOG}"
  exit 0
fi

CHANGED="$(git diff --name-only "${BASE_REF}...HEAD" || true)"
SHARED_HIT=0
if echo "${CHANGED}" | grep -E '^(packages/|config/|scripts/|\.github/workflows/|pnpm-lock\.yaml|package\.json|turbo\.json|pnpm-workspace\.yaml)' >/dev/null; then
  SHARED_HIT=1
fi

INCLUDE='[]'
while IFS= read -r row; do
  name="$(echo "${row}" | jq -r '.name')"
  path="$(echo "${row}" | jq -r '.path')"
  package="$(echo "${row}" | jq -r '.package')"
  domain="$(echo "${row}" | jq -r '.domain')"
  if [[ "${SHARED_HIT}" -eq 1 ]] || echo "${CHANGED}" | grep -E "^${path}/" >/dev/null; then
    INCLUDE="$(jq -c --arg name "${name}" --arg package "${package}" --arg path "${path}" --arg domain "${domain}" \
      '. + [{name:$name, package:$package, path:$path, domain:$domain}]' <<<"${INCLUDE}")"
  fi
done < <(jq -c '.mfes[]' "${CATALOG}")

if [[ "${INCLUDE}" == "[]" ]]; then
  # Force catalog remotes when the catalog itself changed.
  if echo "${CHANGED}" | grep -E '^config/mfes\.json$' >/dev/null; then
    INCLUDE="$(jq -c '[.mfes[] | {name, package, path, domain}]' "${CATALOG}")"
  fi
fi

jq -cn --argjson include "${INCLUDE}" '{include:$include}'
