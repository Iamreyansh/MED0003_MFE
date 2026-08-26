#!/usr/bin/env bash
# Rollback one MFE by promoting a previous immutable release.
# Usage: rollback-mfe.sh <environment> <mfe-name> <git-sha>
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENVIRONMENT="${1:?environment required}"
NAME="${2:?mfe name required}"
GIT_SHA="${3:?git sha required}"
BUCKET="${ARTIFACT_BUCKET:?ARTIFACT_BUCKET is required}"

chmod +x "${ROOT}/scripts/artifact-pull.sh" "${ROOT}/scripts/promote-mfe.sh"
ARTIFACT_PREFIX="releases/${GIT_SHA}" ARTIFACT_BUCKET="${BUCKET}" \
  "${ROOT}/scripts/artifact-pull.sh" "${NAME}"

if [[ ! -f "${ROOT}/dist/${NAME}/release.json" ]]; then
  echo "::error::Release ${GIT_SHA} for ${NAME} is missing release.json" >&2
  exit 1
fi

"${ROOT}/scripts/promote-mfe.sh" "${ENVIRONMENT}" "${NAME}" "${ROOT}/dist/${NAME}" "${GIT_SHA}"
