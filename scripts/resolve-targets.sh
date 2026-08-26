#!/usr/bin/env bash
# Resolve deploy targets from SSM. Never uses the legacy MFE_SITES_JSON variable.
# Usage: resolve-targets.sh <environment> <mfe-name>
set -euo pipefail

ENVIRONMENT="${1:?environment required (staging|production)}"
NAME="${2:?mfe name required}"
PARAM="/medmate/mfe/${ENVIRONMENT}/${NAME}/targets"

json="$(aws ssm get-parameter --name "${PARAM}" --query 'Parameter.Value' --output text)"
bucket="$(jq -r '.bucket_name // empty' <<<"${json}")"
distribution="$(jq -r '.distribution_id // empty' <<<"${json}")"
domain="$(jq -r '.domain_name // empty' <<<"${json}")"

if [[ -z "${bucket}" || -z "${distribution}" || -z "${domain}" ]]; then
  echo "::error::Incomplete SSM target ${PARAM}" >&2
  exit 1
fi

echo "bucket=${bucket}"
echo "distribution_id=${distribution}"
echo "domain=${domain}"
echo "manifest_url=https://${domain}/mf-manifest.json"
