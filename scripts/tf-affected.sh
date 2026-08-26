#!/usr/bin/env bash
# Emit JSON describing Terraform stacks that changed vs a git base.
# Usage: tf-affected.sh [base_ref]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_REF="${1:-origin/main}"
STACKS='["shared","staging","production"]'

if ! git -C "${ROOT}" rev-parse --verify "${BASE_REF}" >/dev/null 2>&1; then
  jq -cn --argjson stacks "${STACKS}" '{include: $stacks | map({stack: .})}'
  exit 0
fi

CHANGED="$(git -C "${ROOT}" diff --name-only "${BASE_REF}...HEAD" || true)"
INCLUDE='[]'

add_stack() {
  local stack="$1"
  INCLUDE="$(jq -c --arg stack "${stack}" '. + [{stack:$stack}]' <<<"${INCLUDE}")"
}

if echo "${CHANGED}" | grep -E '^(config/mfes.json|infra/modules/|infra/\.tflint\.hcl|infra/\.checkov.yaml)' >/dev/null; then
  add_stack shared
  add_stack staging
  add_stack production
else
  echo "${CHANGED}" | grep -E '^infra/shared/' >/dev/null && add_stack shared
  echo "${CHANGED}" | grep -E '^infra/staging/' >/dev/null && add_stack staging
  echo "${CHANGED}" | grep -E '^infra/production/' >/dev/null && add_stack production
fi

# Unique
INCLUDE="$(jq -c 'unique_by(.stack)' <<<"${INCLUDE}")"
jq -cn --argjson include "${INCLUDE}" '{include:$include}'
