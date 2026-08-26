#!/usr/bin/env bash
# Create a checksummed Terraform plan for one stack.
# Usage: tf-plan.sh <shared|staging|production> [plan-out-path]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STACK="${1:?stack required (shared|staging|production)}"
OUT="${2:-"${ROOT}/infra/${STACK}/tfplan"}"
DIR="${ROOT}/infra/${STACK}"

if [[ ! -d "${DIR}" ]]; then
  echo "::error::Unknown Terraform stack: ${STACK}" >&2
  exit 1
fi

terraform -chdir="${DIR}" fmt -check -recursive
terraform -chdir="${DIR}" init -input=false -lockfile=readonly
terraform -chdir="${DIR}" validate

set +e
terraform -chdir="${DIR}" plan \
  -input=false \
  -lock-timeout=5m \
  -detailed-exitcode \
  -out="${OUT}"
code=$?
set -e

if [[ "${code}" -eq 1 ]]; then
  echo "::error::Terraform plan failed for ${STACK}" >&2
  exit 1
fi

terraform -chdir="${DIR}" show -json "${OUT}" > "${OUT}.json"
shasum -a 256 "${OUT}" | awk '{print $1}' > "${OUT}.sha256"
echo "${code}" > "${OUT}.exitcode"
echo "Plan written to ${OUT} (detailed-exitcode=${code})"
exit 0
