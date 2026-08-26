#!/usr/bin/env bash
# Restore the previous known-good SHA recorded in SSM after a failed production smoke.
# Usage: restore-previous.sh <environment> <mfe-name>
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENVIRONMENT="${1:?environment required}"
NAME="${2:?mfe name required}"
PARAM="/medmate/mfe/${ENVIRONMENT}/${NAME}/previous"

if ! json="$(aws ssm get-parameter --name "${PARAM}" --query 'Parameter.Value' --output text 2>/dev/null)"; then
  echo "::error::No previous known-good SHA recorded at ${PARAM}" >&2
  exit 1
fi

sha="$(jq -r '.gitSha // empty' <<<"${json}")"
if [[ -z "${sha}" ]]; then
  echo "::error::previous parameter is missing gitSha" >&2
  exit 1
fi

chmod +x "${ROOT}/scripts/rollback-mfe.sh"
"${ROOT}/scripts/rollback-mfe.sh" "${ENVIRONMENT}" "${NAME}" "${sha}"
