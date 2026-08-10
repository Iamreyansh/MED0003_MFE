#!/usr/bin/env bash
set -euo pipefail

# Promote an MFE build to S3 with immutable release prefix + atomic root promotion.
# Usage: deploy-mfe.sh <mfe-name> <dist-dir> <bucket> <distribution-id> <git-sha>
#
# Module Federation resolves chunk URLs from the remoteEntry origin with
# publicPath "auto", so the *entire* dist (assets + remoteEntry + manifest)
# must be available at the bucket root — not only remoteEntry/manifest.

NAME="${1:?mfe name required}"
DIST_DIR="${2:?dist dir required}"
BUCKET="${3:?bucket required}"
DISTRIBUTION_ID="${4:?distribution id required}"
GIT_SHA="${5:?git sha required}"

RELEASE_PREFIX="releases/${GIT_SHA}"

echo "Deploying ${NAME} @ ${GIT_SHA} to s3://${BUCKET}/${RELEASE_PREFIX}/"

# 1) Immutable release snapshot
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

# 2) Operator-friendly current/ pointer (full tree)
aws s3 sync "${DIST_DIR}/" "s3://${BUCKET}/current/" \
  --delete \
  --only-show-errors \
  --cache-control "public,max-age=0,must-revalidate"

# 3) Stable root promotion — FULL dist so /assets/* resolve next to remoteEntry.js
#    Hashed assets: long-cache. Entry/manifest/html/json: no-cache.
aws s3 sync "${DIST_DIR}/" "s3://${BUCKET}/" \
  --only-show-errors \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "releases/*" \
  --exclude "current/*" \
  --exclude "mf-manifest.json" \
  --exclude "remoteEntry.js" \
  --exclude "index.html" \
  --exclude "*.json"

aws s3 cp "${DIST_DIR}/remoteEntry.js" "s3://${BUCKET}/remoteEntry.js" \
  --cache-control "public,max-age=0,must-revalidate" \
  --content-type "application/javascript"

aws s3 cp "${DIST_DIR}/mf-manifest.json" "s3://${BUCKET}/mf-manifest.json" \
  --cache-control "public,max-age=0,must-revalidate" \
  --content-type "application/json"

if [[ -f "${DIST_DIR}/index.html" ]]; then
  aws s3 cp "${DIST_DIR}/index.html" "s3://${BUCKET}/index.html" \
    --cache-control "public,max-age=0,must-revalidate" \
    --content-type "text/html"
fi

aws cloudfront create-invalidation \
  --distribution-id "${DISTRIBUTION_ID}" \
  --paths "/mf-manifest.json" "/remoteEntry.js" "/current/*" \
  --no-cli-pager

echo "Stable URL: https://${NAME}.mfe.nammamedmate.com/mf-manifest.json"
