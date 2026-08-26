#!/usr/bin/env bash
# Wait until a CloudFront invalidation completes.
# Usage: wait-invalidation.sh <distribution-id> <invalidation-id>
set -euo pipefail

DISTRIBUTION_ID="${1:?distribution id required}"
INVALIDATION_ID="${2:?invalidation id required}"

for _ in $(seq 1 36); do
  status="$(aws cloudfront get-invalidation \
    --distribution-id "${DISTRIBUTION_ID}" \
    --id "${INVALIDATION_ID}" \
    --query 'Invalidation.Status' \
    --output text)"
  echo "Invalidation ${INVALIDATION_ID}: ${status}"
  if [[ "${status}" == "Completed" ]]; then
    exit 0
  fi
  sleep 5
done

echo "::error::Timed out waiting for CloudFront invalidation ${INVALIDATION_ID}" >&2
exit 1
