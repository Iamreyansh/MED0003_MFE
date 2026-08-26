#!/usr/bin/env bash
# Upload CI/PDT diagnostics to the private S3 artifact bucket.
# GitHub Actions artifact storage is not used.
# Usage: ci-log-push.sh <label> <path> [path...]
set -euo pipefail

LABEL="${1:?label required}"
shift

if [[ -z "${ARTIFACT_BUCKET:-}" ]]; then
  echo "ARTIFACT_BUCKET is unset; skipping S3 log upload for ${LABEL}"
  exit 0
fi

RUN_ID="${GITHUB_RUN_ID:-local}"
SHA="${GITHUB_SHA:-unknown}"
DEST="s3://${ARTIFACT_BUCKET}/ci-logs/${SHA}/${RUN_ID}/${LABEL}/"

uploaded=0
for path in "$@"; do
  if [[ -e "${path}" ]]; then
    name="$(basename "${path}")"
    if [[ -d "${path}" ]]; then
      aws s3 sync "${path}/" "${DEST}${name}/" --only-show-errors
    else
      aws s3 cp "${path}" "${DEST}${name}" --only-show-errors
    fi
    uploaded=$((uploaded + 1))
  fi
done

if [[ "${uploaded}" -eq 0 ]]; then
  echo "No diagnostic files to upload for ${LABEL}"
  exit 0
fi

echo "Uploaded ${uploaded} path(s) to ${DEST}"
