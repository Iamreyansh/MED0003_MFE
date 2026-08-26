#!/usr/bin/env bash
# Promote an immutable MFE release to an environment origin.
# Used for staging, production, and rollback.
# Usage: promote-mfe.sh <environment> <mfe-name> <dist-dir> <git-sha>
set -euo pipefail

ENVIRONMENT="${1:?environment required}"
NAME="${2:?mfe name required}"
DIST_DIR="${3:?dist dir required}"
GIT_SHA="${4:?git sha required}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

chmod +x "${ROOT}/scripts/verify-federation.sh" \
  "${ROOT}/scripts/resolve-targets.sh" \
  "${ROOT}/scripts/wait-invalidation.sh"

"${ROOT}/scripts/verify-federation.sh" "${DIST_DIR}" "${NAME}"

if [[ ! -f "${DIST_DIR}/release.json" ]]; then
  echo "::error::Missing release.json — package-release.sh must run before promote" >&2
  exit 1
fi

packaged_sha="$(jq -r '.gitSha' "${DIST_DIR}/release.json")"
if [[ "${packaged_sha}" != "${GIT_SHA}" ]]; then
  echo "::error::Release SHA ${packaged_sha} does not match ${GIT_SHA}" >&2
  exit 1
fi

eval "$(${ROOT}/scripts/resolve-targets.sh "${ENVIRONMENT}" "${NAME}" | sed 's/^/TARGET_/')"
BUCKET="${TARGET_bucket:?}"
DISTRIBUTION_ID="${TARGET_distribution_id:?}"
RELEASE_PREFIX="releases/${GIT_SHA}"

echo "Promoting ${NAME} @ ${GIT_SHA} to ${ENVIRONMENT} s3://${BUCKET}/${RELEASE_PREFIX}/"

aws s3 sync "${DIST_DIR}/" "s3://${BUCKET}/${RELEASE_PREFIX}/" \
  --delete \
  --only-show-errors \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "mf-manifest.json" \
  --exclude "index.html" \
  --exclude "release.json" \
  --exclude "SHA256SUMS" \
  --exclude "*.json"

aws s3 sync "${DIST_DIR}/" "s3://${BUCKET}/${RELEASE_PREFIX}/" \
  --only-show-errors \
  --cache-control "public,max-age=0,must-revalidate" \
  --exclude "*" \
  --include "mf-manifest.json" \
  --include "index.html" \
  --include "release.json" \
  --include "SHA256SUMS" \
  --include "*.json"

aws s3 sync "${DIST_DIR}/" "s3://${BUCKET}/current/" \
  --delete \
  --only-show-errors \
  --cache-control "public,max-age=0,must-revalidate"

# Full dist at bucket root so Module Federation publicPath auto resolves.
aws s3 sync "${DIST_DIR}/" "s3://${BUCKET}/" \
  --only-show-errors \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "releases/*" \
  --exclude "current/*" \
  --exclude "mf-manifest.json" \
  --exclude "remoteEntry.js" \
  --exclude "index.html" \
  --exclude "release.json" \
  --exclude "SHA256SUMS" \
  --exclude "*.json"

aws s3 cp "${DIST_DIR}/remoteEntry.js" "s3://${BUCKET}/remoteEntry.js" \
  --cache-control "public,max-age=0,must-revalidate" \
  --content-type "application/javascript"

aws s3 cp "${DIST_DIR}/mf-manifest.json" "s3://${BUCKET}/mf-manifest.json" \
  --cache-control "public,max-age=0,must-revalidate" \
  --content-type "application/json"

aws s3 cp "${DIST_DIR}/release.json" "s3://${BUCKET}/release.json" \
  --cache-control "public,max-age=0,must-revalidate" \
  --content-type "application/json"

if [[ -f "${DIST_DIR}/index.html" ]]; then
  aws s3 cp "${DIST_DIR}/index.html" "s3://${BUCKET}/index.html" \
    --cache-control "public,max-age=0,must-revalidate" \
    --content-type "text/html"
fi

invalidation_id="$(
  aws cloudfront create-invalidation \
    --distribution-id "${DISTRIBUTION_ID}" \
    --paths "/mf-manifest.json" "/remoteEntry.js" "/release.json" "/index.html" "/current/*" \
    --query 'Invalidation.Id' \
    --output text \
    --no-cli-pager
)"

"${ROOT}/scripts/wait-invalidation.sh" "${DISTRIBUTION_ID}" "${invalidation_id}"
echo "Promoted ${NAME} ${ENVIRONMENT} https://${TARGET_domain}/mf-manifest.json"
