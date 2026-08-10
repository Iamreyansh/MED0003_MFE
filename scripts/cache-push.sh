#!/usr/bin/env bash
# Push Turborepo cache artefacts to the private S3 cache bucket.
set -euo pipefail

BUCKET="${TURBO_CACHE_BUCKET:-}"
PREFIX="${TURBO_CACHE_PREFIX:-turbo/}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CACHE_DIR="${ROOT}/.turbo/cache"

if [ -z "$BUCKET" ]; then
  echo "TURBO_CACHE_BUCKET is required (Terraform output turbo_cache_bucket)." >&2
  exit 1
fi

if [ ! -d "$CACHE_DIR" ]; then
  echo "No local .turbo/cache directory; nothing to push."
  exit 0
fi

echo "Pushing turbo cache to s3://${BUCKET}/${PREFIX} ..."
aws s3 sync "$CACHE_DIR" "s3://${BUCKET}/${PREFIX}" --only-show-errors
echo "Turbo cache push complete."
