#!/usr/bin/env bash
# Download a packaged MFE dist from the immutable artifact bucket.
# Usage: artifact-pull.sh <mfe-name>
set -euo pipefail

NAME="${1:?mfe name required (e.g. todo)}"
BUCKET="${ARTIFACT_BUCKET:?ARTIFACT_BUCKET is required}"
PREFIX="${ARTIFACT_PREFIX:-releases/${GITHUB_SHA:?GITHUB_SHA is required}}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${ROOT}/dist/${NAME}"

mkdir -p "${DEST}"
echo "Downloading s3://${BUCKET}/${PREFIX}/${NAME}/ -> ${DEST}/ ..."
aws s3 sync "s3://${BUCKET}/${PREFIX}/${NAME}/" "${DEST}/" \
  --delete \
  --only-show-errors

chmod +x "${ROOT}/scripts/verify-federation.sh"
"${ROOT}/scripts/verify-federation.sh" "${DEST}" "${NAME}"
echo "Artifact pull complete."
