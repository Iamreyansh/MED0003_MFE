#!/usr/bin/env bash
# Terraform CLI for MED0003 stacks. Lockfiles and plugin binaries live in S3, not git.
# Usage: tf.sh <command> [args]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TF_STATE_BUCKET="${TF_STATE_BUCKET:-terraform-locks-105927215604}"
TF_LOCK_PREFIX="${TF_LOCK_PREFIX:-MED0003}"
STACKS=(shared staging production)

usage() {
  cat <<'EOF'
Usage: tf.sh <command> [args]

Commands:
  fmt                         terraform fmt -recursive infra
  init                        pull lockfiles, then init every stack
  validate                    validate every stack
  test                        terraform test for the catalog module
  affected [base]             JSON matrix of stacks that changed
  plan <stack> [out]          checksummed plan
  plan-push <stack>           upload plan to the artifact bucket
  apply <stack> [plan]        apply the exact checksummed plan
  policy <plan.json> <env>    fail-closed plan policy scan
  lock-pull [stack]           download provider lockfiles from S3
  lock-push [stack]           upload provider lockfiles to S3
  lock-refresh                rebuild lockfiles for linux/darwin and upload
  plugin-cache <pull|push>    sync provider plugin binaries with S3
  migrate                     print the one-time state-migration checklist
EOF
}

tf_lock_uri() {
  echo "s3://${TF_STATE_BUCKET}/${TF_LOCK_PREFIX}/${1:?stack required}/.terraform.lock.hcl"
}

tf_plugin_cache_uri() {
  echo "s3://${TF_STATE_BUCKET}/${TF_LOCK_PREFIX}/plugin-cache"
}

tf_ensure_plugin_cache() {
  TF_PLUGIN_CACHE_DIR="${TF_PLUGIN_CACHE_DIR:-${ROOT}/infra/.plugin-cache}"
  mkdir -p "${TF_PLUGIN_CACHE_DIR}"
  export TF_PLUGIN_CACHE_DIR
}

# S3 sync does not preserve unix execute bits.
tf_chmod_providers() {
  local dir="${1:-}"
  [[ -n "${dir}" && -d "${dir}" ]] || return 0
  find "${dir}" -type f -name 'terraform-provider-*' -exec chmod +x {} + 2>/dev/null || true
}

tf_stack_dir() {
  local stack="${1:?stack required (shared|staging|production)}"
  local dir="${ROOT}/infra/${stack}"
  if [[ ! -d "${dir}" ]]; then
    echo "::error::Unknown Terraform stack: ${stack}" >&2
    exit 1
  fi
  printf '%s\n' "${dir}"
}

tf_shared_state_key() {
  echo "${TF_LOCK_PREFIX}/shared/terraform.tfstate"
}

# 0 = object exists, 1 = confirmed missing, 2 = AWS error (do not skip the plan).
tf_shared_state_status() {
  local err
  err="$(mktemp)"
  if aws s3api head-object --bucket "${TF_STATE_BUCKET}" --key "$(tf_shared_state_key)" >/dev/null 2>"${err}"; then
    rm -f "${err}"
    return 0
  fi
  if grep -Eqi 'Not Found|404|NoSuchKey' "${err}"; then
    rm -f "${err}"
    return 1
  fi
  cat "${err}" >&2
  rm -f "${err}"
  return 2
}

tf_write_skipped_plan() {
  local out="${1:?}"
  mkdir -p "$(dirname "${out}")"
  printf '%s\n' '{"format_version":"1.2","resource_changes":[],"output_changes":{}}' > "${out}.json"
          echo skipped > "${out}.exitcode"
          echo skipped > "${out}.sha256"
          rm -f "${out}"
          echo "Skipped plan written to ${out}.json"
}

cmd_fmt() {
  terraform fmt -recursive "${ROOT}/infra"
}

cmd_lock_pull() {
  pull_one() {
    local stack="${1:?}"
    local dest="${ROOT}/infra/${stack}/.terraform.lock.hcl"
    local src
    src="$(tf_lock_uri "${stack}")"
    mkdir -p "$(dirname "${dest}")"
    if ! aws s3 cp "${src}" "${dest}" --only-show-errors; then
      echo "::error::Missing provider lockfile ${src}. Generate and upload with: pnpm tf:lock:refresh" >&2
      exit 1
    fi
    echo "Pulled ${src}"
  }

  if [[ "${1:-}" == "" ]]; then
    local stack
    for stack in "${STACKS[@]}"; do
      pull_one "${stack}"
    done
  else
    pull_one "${1}"
  fi
}

cmd_lock_push() {
  push_one() {
    local stack="${1:?}"
    local src="${ROOT}/infra/${stack}/.terraform.lock.hcl"
    local dest
    dest="$(tf_lock_uri "${stack}")"
    if [[ ! -f "${src}" ]]; then
      echo "::error::Missing ${src}. Run pnpm tf:lock:refresh first." >&2
      exit 1
    fi
    aws s3 cp "${src}" "${dest}" --only-show-errors
    echo "Uploaded ${dest}"
  }

  if [[ "${1:-}" == "" ]]; then
    local stack
    for stack in "${STACKS[@]}"; do
      push_one "${stack}"
    done
  else
    push_one "${1}"
  fi
}

cmd_plugin_cache() {
  local action="${1:?pull or push required}"
  tf_ensure_plugin_cache
  local remote
  remote="$(tf_plugin_cache_uri)"

  case "${action}" in
    pull)
      if aws s3 sync "${remote}" "${TF_PLUGIN_CACHE_DIR}" --only-show-errors; then
        tf_chmod_providers "${TF_PLUGIN_CACHE_DIR}"
        echo "Plugin cache pulled to ${TF_PLUGIN_CACHE_DIR}"
      else
        echo "::warning::Plugin cache pull failed; Terraform will download providers from the registry."
      fi
      ;;
    push)
      aws s3 sync "${TF_PLUGIN_CACHE_DIR}" "${remote}" --only-show-errors
      echo "Plugin cache pushed to ${remote}"
      ;;
    *)
      echo "::error::Unknown action ${action} (expected pull or push)" >&2
      exit 1
      ;;
  esac
}

cmd_lock_refresh() {
  tf_ensure_plugin_cache
  aws s3 sync "$(tf_plugin_cache_uri)" "${TF_PLUGIN_CACHE_DIR}" --only-show-errors || true

  local platforms=(linux_amd64 linux_arm64 darwin_amd64 darwin_arm64)
  local lock_args=()
  local platform stack
  for platform in "${platforms[@]}"; do
    lock_args+=(-platform="${platform}")
  done

  for stack in "${STACKS[@]}"; do
    echo "=== providers lock ${stack} ==="
    terraform -chdir="${ROOT}/infra/${stack}" providers lock "${lock_args[@]}"
  done

  cmd_lock_push
  cmd_plugin_cache push
  echo "Provider lockfiles and plugin cache are in s3://${TF_STATE_BUCKET}/${TF_LOCK_PREFIX}/"
}

cmd_init() {
  local stack
  cmd_lock_pull
  tf_ensure_plugin_cache
  cmd_plugin_cache pull
  for stack in "${STACKS[@]}"; do
    terraform -chdir="${ROOT}/infra/${stack}" init -input=false -lockfile=readonly
    tf_chmod_providers "${ROOT}/infra/${stack}/.terraform/providers"
  done
}

cmd_validate() {
  local stack
  for stack in "${STACKS[@]}"; do
    terraform -chdir="${ROOT}/infra/${stack}" validate
  done
}

cmd_test() {
  terraform -chdir="${ROOT}/infra/modules/catalog" test
}

cmd_prepare_init() {
  local stack="${1:?}"
  local dir
  dir="$(tf_stack_dir "${stack}")"
  cmd_lock_pull "${stack}"
  tf_ensure_plugin_cache
  cmd_plugin_cache pull
  terraform -chdir="${dir}" init -input=false -lockfile=readonly
  tf_chmod_providers "${TF_PLUGIN_CACHE_DIR}"
  tf_chmod_providers "${dir}/.terraform/providers"
}

cmd_plan() {
  local stack="${1:?stack required (shared|staging|production)}"
  local dir out code shared_status
  dir="$(tf_stack_dir "${stack}")"
  out="${2:-"${dir}/tfplan"}"

  terraform -chdir="${dir}" fmt -check -recursive
  cmd_prepare_init "${stack}"
  terraform -chdir="${dir}" validate

  if [[ "${stack}" != "shared" ]]; then
    set +e
    tf_shared_state_status
    shared_status=$?
    set -e
    if [[ "${shared_status}" -eq 1 ]]; then
      echo "::warning::Shared remote state s3://${TF_STATE_BUCKET}/$(tf_shared_state_key) is missing; skipping ${stack} plan until shared is applied."
      tf_write_skipped_plan "${out}"
      return 0
    fi
  fi

  cmd_plugin_cache push || echo "::warning::Plugin cache push failed for ${stack}"

  set +e
  terraform -chdir="${dir}" plan \
    -input=false \
    -lock-timeout=5m \
    -detailed-exitcode \
    -out="${out}"
  code=$?
  set -e

  if [[ "${code}" -eq 1 ]]; then
    echo "::error::Terraform plan failed for ${stack}" >&2
    exit 1
  fi

  terraform -chdir="${dir}" show -json "${out}" > "${out}.json"
  shasum -a 256 "${out}" | awk '{print $1}' > "${out}.sha256"
  echo "${code}" > "${out}.exitcode"
  echo "Plan written to ${out} (detailed-exitcode=${code})"
}

cmd_plan_push() {
  local stack="${1:?stack required}"
  local plan="${ROOT}/infra/${stack}/tfplan"

  if [[ -z "${ARTIFACT_BUCKET:-}" ]]; then
    echo "ARTIFACT_BUCKET is unset; skipping Terraform plan upload for ${stack}"
    return 0
  fi

  if [[ -f "${plan}.exitcode" && "$(tr -d '[:space:]' < "${plan}.exitcode")" == "skipped" ]]; then
    echo "Skipping Terraform plan upload for ${stack} (shared state is not applied yet)"
    return 0
  fi

  if [[ ! -f "${plan}" ]]; then
    echo "::error::Missing plan ${plan}" >&2
    exit 1
  fi

  local sha="${GITHUB_SHA:-unknown}"
  local run_id="${GITHUB_RUN_ID:-local}"
  local prefix="s3://${ARTIFACT_BUCKET}/tfplans/${sha}/${stack}/${run_id}"

  aws s3 cp "${plan}" "${prefix}/tfplan" --only-show-errors
  aws s3 cp "${plan}.json" "${prefix}/tfplan.json" --only-show-errors
  aws s3 cp "${plan}.sha256" "${prefix}/tfplan.sha256" --only-show-errors
  aws s3 cp "${plan}.exitcode" "${prefix}/tfplan.exitcode" --only-show-errors
  echo "Uploaded Terraform plan to ${prefix}/"
}

cmd_apply() {
  local stack="${1:?stack required (shared|staging|production)}"
  local dir plan actual expected post
  dir="$(tf_stack_dir "${stack}")"
  plan="${2:-"${dir}/tfplan"}"

  if [[ -f "${plan}.exitcode" && "$(tr -d '[:space:]' < "${plan}.exitcode")" == "skipped" ]]; then
    echo "::error::Cannot apply ${stack}: shared remote state has not been applied yet." >&2
    exit 1
  fi

  if [[ ! -f "${plan}" || ! -f "${plan}.sha256" ]]; then
    echo "::error::Missing checksummed plan at ${plan}" >&2
    exit 1
  fi

  actual="$(shasum -a 256 "${plan}" | awk '{print $1}')"
  expected="$(tr -d '[:space:]' < "${plan}.sha256")"
  if [[ "${actual}" != "${expected}" ]]; then
    echo "::error::Terraform plan checksum mismatch for ${stack}" >&2
    exit 1
  fi

  cmd_prepare_init "${stack}"
  terraform -chdir="${dir}" apply -input=false -lock-timeout=5m "${plan}"
  terraform -chdir="${dir}" output -json > "${dir}/outputs.json"

  set +e
  terraform -chdir="${dir}" plan \
    -input=false \
    -lock-timeout=5m \
    -detailed-exitcode \
    -out="${dir}/tfplan.post"
  post=$?
  set -e

  if [[ "${post}" -ne 0 ]]; then
    echo "::error::Post-apply plan for ${stack} is not drift-free (exit ${post})" >&2
    terraform -chdir="${dir}" show -no-color "${dir}/tfplan.post" | tail -n 80 >&2
    exit 1
  fi

  echo "Applied ${stack} from exact plan ${plan}"
}

cmd_policy() {
  node "${ROOT}/scripts/tf-policy.mjs" "$@"
}

git_changed_from() {
  local base="${1}"
  git -C "${ROOT}" cat-file -e "${base}^{commit}" 2>/dev/null || return 1
  git -C "${ROOT}" diff --name-only "${base}" HEAD
}

cmd_affected() {
  local requested=""
  local stacks='["shared","staging","production"]'
  local changed="" resolved="" include

  if [[ $# -lt 1 ]]; then
    requested="origin/main"
  else
    requested="${1}"
  fi

  if [[ -n "${requested}" && "${requested}" != "0000000000000000000000000000000000000000" ]]; then
    if changed="$(git_changed_from "${requested}")"; then
      resolved="${requested}"
    fi
  fi
  if [[ -z "${resolved}" ]]; then
    if changed="$(git_changed_from "HEAD~1")"; then
      resolved="HEAD~1"
    else
      jq -cn --argjson stacks "${stacks}" '{include: $stacks | map({stack: .})}'
      return 0
    fi
  fi
  echo "Affected Terraform stacks compared against ${resolved}" >&2
  include='[]'

  add_stack() {
    include="$(jq -c --arg stack "${1}" '. + [{stack:$stack}]' <<<"${include}")"
  }

  if echo "${changed}" | grep -E '^(config/mfes.json|infra/modules/|infra/\.tflint\.hcl|infra/\.checkov.yaml|scripts/tf\.sh|scripts/tf-policy\.mjs|\.github/workflows/(terraform|deploy|drift)\.yml)' >/dev/null; then
    add_stack shared
    add_stack staging
    add_stack production
  else
    echo "${changed}" | grep -E '^infra/shared/' >/dev/null && add_stack shared
    echo "${changed}" | grep -E '^infra/staging/' >/dev/null && add_stack staging
    echo "${changed}" | grep -E '^infra/production/' >/dev/null && add_stack production
  fi

  include="$(jq -c 'unique_by(.stack)' <<<"${include}")"
  jq -cn --argjson include "${include}" '{include:$include}'
}

cmd_migrate() {
  cat <<'EOF'
State migration (run from a trusted admin workstation):

1. ./scripts/tf.sh lock-pull && ./scripts/tf.sh init
2. terraform -chdir=infra/shared import of ACM / IAM / artifacts as needed
   (new resources can be applied instead of imported).
3. Copy the existing state key MED0003/terraform.tfstate (already used by
   infra/production) and migrate MFE module addresses:

   cd infra/production
   terraform init -lockfile=readonly
   terraform state mv 'module.mfe["todo"]' 'module.env.module.site["todo"]'

4. Remove account-level resources that now live in shared:

   terraform state rm aws_acm_certificate.mfe_wildcard
   terraform state rm aws_acm_certificate_validation.mfe_wildcard
   terraform state rm aws_iam_role.github_actions
   terraform state rm aws_iam_role.github_actions_terraform
   terraform state rm aws_s3_bucket.turbo_cache

   Only remove addresses that still exist in the production state.

5. terraform -chdir=infra/staging init && plan && apply
6. Deploy Todo to staging, run smoke + PDT, then apply production.

Never force-unlock state automatically. If a lock is stuck, follow
docs/infra/aws-bootstrap.md.
EOF
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

COMMAND="${1}"
shift

case "${COMMAND}" in
  -h | --help | help) usage ;;
  fmt) cmd_fmt "$@" ;;
  init) cmd_init "$@" ;;
  validate) cmd_validate "$@" ;;
  test) cmd_test "$@" ;;
  affected) cmd_affected "$@" ;;
  plan) cmd_plan "$@" ;;
  plan-push) cmd_plan_push "$@" ;;
  apply) cmd_apply "$@" ;;
  policy) cmd_policy "$@" ;;
  lock-pull) cmd_lock_pull "$@" ;;
  lock-push) cmd_lock_push "$@" ;;
  lock-refresh) cmd_lock_refresh "$@" ;;
  plugin-cache) cmd_plugin_cache "$@" ;;
  migrate) cmd_migrate "$@" ;;
  *)
    echo "::error::Unknown command: ${COMMAND}" >&2
    usage >&2
    exit 1
    ;;
esac
