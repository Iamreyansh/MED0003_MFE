#!/usr/bin/env bash
# Persist a checksummed Terraform plan to S3 (no GitHub Actions artifacts).
# Usage: tf-plan-push.sh <shared|staging|production>
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STACK="${1:?stack required}"
PLAN="${ROOT}/infra/${STACK}/tfplan"

if [[ -z "${ARTIFACT_BUCKET:-}" ]]; then
  echo "ARTIFACT_BUCKET is unset; skipping Terraform plan upload for ${STACK}"
  exit 0
fi

if [[ ! -f "${PLAN}" ]]; then
  echo "::error::Missing plan ${PLAN}" >&2
  exit 1
fi

SHA="${GITHUB_SHA:-unknown}"
RUN_ID="${GITHUB_RUN_ID:-local}"
PREFIX="s3://${ARTIFACT_BUCKET}/tfplans/${SHA}/${STACK}/${RUN_ID}"

aws s3 cp "${PLAN}" "${PREFIX}/tfplan" --only-show-errors
aws s3 cp "${PLAN}.json" "${PREFIX}/tfplan.json" --only-show-errors
aws s3 cp "${PLAN}.sha256" "${PREFIX}/tfplan.sha256" --only-show-errors
aws s3 cp "${PLAN}.exitcode" "${PREFIX}/tfplan.exitcode" --only-show-errors
echo "Uploaded Terraform plan to ${PREFIX}/"
