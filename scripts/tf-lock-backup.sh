#!/usr/bin/env bash
# Sync provider lockfile backups into the Terraform state bucket.
set -euo pipefail

BUCKET="${TF_STATE_BUCKET:-terraform-locks-105927215604}"
KEY_PREFIX="${TF_LOCK_PREFIX:-MED0003}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

for stack in shared staging production; do
  lock="${ROOT}/infra/${stack}/.terraform.lock.hcl"
  if [ ! -f "${lock}" ]; then
    echo "Missing ${lock}" >&2
    exit 1
  fi
  dest="s3://${BUCKET}/${KEY_PREFIX}/${stack}/.terraform.lock.hcl"
  echo "Uploading provider lock to ${dest}"
  aws s3 cp "${lock}" "${dest}" --only-show-errors
done
echo "Lockfile backup complete."
