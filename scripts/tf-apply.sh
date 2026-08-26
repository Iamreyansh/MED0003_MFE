#!/usr/bin/env bash
# Apply an exact checksummed Terraform plan, then assert a no-drift follow-up plan.
# Usage: tf-apply.sh <shared|staging|production> [plan-path]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STACK="${1:?stack required (shared|staging|production)}"
PLAN="${2:-"${ROOT}/infra/${STACK}/tfplan"}"
DIR="${ROOT}/infra/${STACK}"

if [[ ! -f "${PLAN}" || ! -f "${PLAN}.sha256" ]]; then
  echo "::error::Missing checksummed plan at ${PLAN}" >&2
  exit 1
fi

actual="$(shasum -a 256 "${PLAN}" | awk '{print $1}')"
expected="$(tr -d '[:space:]' < "${PLAN}.sha256")"
if [[ "${actual}" != "${expected}" ]]; then
  echo "::error::Terraform plan checksum mismatch for ${STACK}" >&2
  exit 1
fi

terraform -chdir="${DIR}" init -input=false -lockfile=readonly
terraform -chdir="${DIR}" apply -input=false -lock-timeout=5m "${PLAN}"
terraform -chdir="${DIR}" output -json > "${DIR}/outputs.json"

set +e
terraform -chdir="${DIR}" plan \
  -input=false \
  -lock-timeout=5m \
  -detailed-exitcode \
  -out="${DIR}/tfplan.post"
post=$?
set -e

if [[ "${post}" -ne 0 ]]; then
  echo "::error::Post-apply plan for ${STACK} is not drift-free (exit ${post})" >&2
  terraform -chdir="${DIR}" show -no-color "${DIR}/tfplan.post" | tail -n 80 >&2
  exit 1
fi

echo "Applied ${STACK} from exact plan ${PLAN}"
