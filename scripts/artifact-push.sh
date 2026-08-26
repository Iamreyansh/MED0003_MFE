#!/usr/bin/env bash
# Upload packaged MFE dist trees to the immutable artifact bucket.
# Usage: artifact-push.sh [mfe-name ...]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUCKET="${ARTIFACT_BUCKET:?ARTIFACT_BUCKET is required}"
PREFIX="${ARTIFACT_PREFIX:-releases/${GITHUB_SHA:?GITHUB_SHA is required}}"
NAMES=("${@}")

if [[ "${#NAMES[@]}" -eq 0 ]]; then
  mapfile -t NAMES < <(node "${ROOT}/scripts/catalog.mjs" list | jq -r '.[]')
fi

uploaded=0
for name in "${NAMES[@]}"; do
  dist="${ROOT}/dist/${name}"
  if [[ ! -d "${dist}" ]]; then
    echo "Missing dist for ${name}: dist/${name}" >&2
    exit 1
  fi
  chmod +x "${ROOT}/scripts/verify-federation.sh"
  "${ROOT}/scripts/verify-federation.sh" "${dist}" "${name}"
  aws s3 sync "${dist}/" "s3://${BUCKET}/${PREFIX}/${name}/" \
    --delete \
    --only-show-errors
  echo "  uploaded ${name}"
  uploaded=$((uploaded + 1))
done

if [[ "${uploaded}" -eq 0 ]]; then
  echo "No remotes to upload." >&2
  exit 1
fi

echo "Artifact push complete (${uploaded})."
