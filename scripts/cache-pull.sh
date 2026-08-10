#!/usr/bin/env bash
# Pull Turborepo cache artefacts from the private S3 cache bucket.
set -euo pipefail

BUCKET="${TURBO_CACHE_BUCKET:-}"
PREFIX="${TURBO_CACHE_PREFIX:-turbo/}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CACHE_DIR="${ROOT}/.turbo/cache"

if [ -z "$BUCKET" ]; then
  echo "TURBO_CACHE_BUCKET is required (Terraform output turbo_cache_bucket)." >&2
  exit 1
fi

mkdir -p "$CACHE_DIR"
echo "Pulling turbo cache from s3://${BUCKET}/${PREFIX} ..."
if ! aws s3 sync "s3://${BUCKET}/${PREFIX}" "$CACHE_DIR" --only-show-errors; then
  if [ "${CI:-}" = "true" ]; then
    echo "::error::Turbo cache pull failed (CI=true — fail-fast)." >&2
    exit 1
  fi
  echo "Warning: turbo cache pull failed (non-CI). Continuing without remote cache." >&2
  exit 0
fi
echo "Turbo cache pull complete."
