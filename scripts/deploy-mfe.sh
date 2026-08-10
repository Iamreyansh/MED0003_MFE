#!/usr/bin/env bash
set -euo pipefail

# Promote an MFE build to S3 with immutable release prefix + atomic manifest.
# Usage: deploy-mfe.sh <mfe-name> <dist-dir> <bucket> <distribution-id> <git-sha>

NAME="${1:?mfe name required}"
DIST_DIR="${2:?dist dir required}"
BUCKET="${3:?bucket required}"
DISTRIBUTION_ID="${4:?distribution id required}"
GIT_SHA="${5:?git sha required}"

RELEASE_PREFIX="releases/${GIT_SHA}"

echo "Deploying ${NAME} @ ${GIT_SHA} to s3://${BUCKET}/${RELEASE_PREFIX}/"

aws s3 sync "${DIST_DIR}/" "s3://${BUCKET}/${RELEASE_PREFIX}/" \
  --delete \
  --only-show-errors \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "mf-manifest.json" \
  --exclude "index.html" \
  --exclude "*.json"

aws s3 sync "${DIST_DIR}/" "s3://${BUCKET}/${RELEASE_PREFIX}/" \
  --only-show-errors \
  --cache-control "public,max-age=0,must-revalidate" \
  --exclude "*" \
  --include "mf-manifest.json" \
  --include "index.html" \
  --include "*.json"

# Rewrite/copy stable root manifests last for atomic promotion.
if [[ -f "${DIST_DIR}/mf-manifest.json" ]]; then
  aws s3 cp "${DIST_DIR}/mf-manifest.json" "s3://${BUCKET}/mf-manifest.json" \
    --cache-control "public,max-age=0,must-revalidate" \
    --content-type "application/json"
fi

if [[ -f "${DIST_DIR}/remoteEntry.js" ]]; then
  aws s3 cp "${DIST_DIR}/remoteEntry.js" "s3://${BUCKET}/remoteEntry.js" \
    --cache-control "public,max-age=0,must-revalidate" \
    --content-type "application/javascript"
fi

# Also publish a current pointer for operators.
aws s3 cp "${DIST_DIR}/" "s3://${BUCKET}/current/" \
  --recursive \
  --only-show-errors \
  --cache-control "public,max-age=0,must-revalidate"

aws cloudfront create-invalidation \
  --distribution-id "${DISTRIBUTION_ID}" \
  --paths "/mf-manifest.json" "/remoteEntry.js" "/current/*" \
  --no-cli-pager

echo "Stable URL: https://${NAME}.mfe.nammamedmate.com/mf-manifest.json"
