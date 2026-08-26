#!/usr/bin/env bash
# Record current and previous known-good SHAs after a successful promotion.
# Usage: record-release.sh <environment> <mfe-name> <git-sha> <digest>
set -euo pipefail

ENVIRONMENT="${1:?environment required}"
NAME="${2:?mfe name required}"
GIT_SHA="${3:?git sha required}"
DIGEST="${4:?digest required}"
CURRENT="/medmate/mfe/${ENVIRONMENT}/${NAME}/current"
PREVIOUS="/medmate/mfe/${ENVIRONMENT}/${NAME}/previous"

if current="$(aws ssm get-parameter --name "${CURRENT}" --query 'Parameter.Value' --output text 2>/dev/null)"; then
  aws ssm put-parameter --name "${PREVIOUS}" --type String --overwrite --value "${current}" >/dev/null
fi

payload="$(jq -cn --arg sha "${GIT_SHA}" --arg digest "${DIGEST}" '{gitSha:$sha, digest:$digest}')"
aws ssm put-parameter --name "${CURRENT}" --type String --overwrite --value "${payload}" >/dev/null
echo "Recorded ${NAME} ${ENVIRONMENT} ${GIT_SHA}"
