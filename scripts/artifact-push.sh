#!/usr/bin/env bash
# Upload built MFE dist trees to a private S3 staging prefix for later deploy jobs.
# Usage: artifact-push.sh
set -euo pipefail

BUCKET="${ARTIFACT_BUCKET:-${TURBO_CACHE_BUCKET:-}}"
PREFIX="${ARTIFACT_PREFIX:-ci-artifacts/${GITHUB_SHA:-local}}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -z "$BUCKET" ]; then
  echo "ARTIFACT_BUCKET (or TURBO_CACHE_BUCKET) is required." >&2
  exit 1
fi

shopt -s nullglob
dists=("${ROOT}"/packages/components/*/dist)
if [ "${#dists[@]}" -eq 0 ]; then
  echo "No packages/components/*/dist directories found." >&2
  exit 1
fi

echo "Uploading MFE dists to s3://${BUCKET}/${PREFIX}/ ..."
for dist in "${dists[@]}"; do
  rel="${dist#"${ROOT}"/}"
  aws s3 sync "${dist}/" "s3://${BUCKET}/${PREFIX}/${rel}/" \
    --delete \
    --only-show-errors
  echo "  uploaded ${rel}"
done
echo "Artifact push complete."
