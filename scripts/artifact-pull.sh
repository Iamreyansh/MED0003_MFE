#!/usr/bin/env bash
# Download a previously staged MFE dist tree from S3 into the workspace.
# Usage: artifact-pull.sh <mfe-name>
# Example: artifact-pull.sh todo
set -euo pipefail

NAME="${1:?mfe name required (e.g. todo)}"
BUCKET="${ARTIFACT_BUCKET:-${TURBO_CACHE_BUCKET:-}}"
PREFIX="${ARTIFACT_PREFIX:-ci-artifacts/${GITHUB_SHA:-local}}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${ROOT}/dist/${NAME}"

if [ -z "$BUCKET" ]; then
  echo "ARTIFACT_BUCKET (or TURBO_CACHE_BUCKET) is required." >&2
  exit 1
fi

mkdir -p "${DEST}"
echo "Downloading s3://${BUCKET}/${PREFIX}/dist/${NAME}/ -> ${DEST}/ ..."
aws s3 sync "s3://${BUCKET}/${PREFIX}/dist/${NAME}/" "${DEST}/" \
  --delete \
  --only-show-errors

if [ ! -f "${DEST}/mf-manifest.json" ] || [ ! -f "${DEST}/remoteEntry.js" ]; then
  echo "Missing federation artefacts under ${DEST}" >&2
  exit 1
fi

echo "Artifact pull complete."
