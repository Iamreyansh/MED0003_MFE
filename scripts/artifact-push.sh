#!/usr/bin/env bash
# Upload built MFE dist trees to a private S3 staging prefix for later deploy jobs.
# Usage: artifact-push.sh
set -euo pipefail

BUCKET="${ARTIFACT_BUCKET:-${TURBO_CACHE_BUCKET:-}}"
PREFIX="${ARTIFACT_PREFIX:-ci-artifacts/${GITHUB_SHA:-local}}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CATALOG="${ROOT}/config/mfes.json"

if [ -z "$BUCKET" ]; then
  echo "ARTIFACT_BUCKET (or TURBO_CACHE_BUCKET) is required." >&2
  exit 1
fi

if [ ! -f "${CATALOG}" ]; then
  echo "Missing MFE catalog at ${CATALOG}" >&2
  exit 1
fi

echo "Uploading MFE dists to s3://${BUCKET}/${PREFIX}/ ..."
uploaded=0
while IFS= read -r row; do
  name="$(echo "${row}" | jq -r '.name')"
  rel="dist/${name}"
  dist="${ROOT}/${rel}"
  if [ ! -d "${dist}" ]; then
    echo "Missing dist for ${name}: ${rel}" >&2
    exit 1
  fi
  aws s3 sync "${dist}/" "s3://${BUCKET}/${PREFIX}/${rel}/" \
    --delete \
    --only-show-errors
  echo "  uploaded ${rel}"
  uploaded=$((uploaded + 1))
done < <(jq -c '.mfes[]' "${CATALOG}")

if [ "${uploaded}" -eq 0 ]; then
  echo "No catalog remotes to upload." >&2
  exit 1
fi

echo "Artifact push complete."
