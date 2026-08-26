#!/usr/bin/env bash
# MFE release CLI: package, artifact store, promote, verify, rollback.
# Usage: release.sh <command> [args]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  cat <<'EOF'
Usage: release.sh <command> [args]

Commands:
  affected [base]                          JSON matrix of MFEs that changed
  verify <dist-dir> [name]                 federation artefact checks
  package <name> [git-sha]                 write release.json + SHA256SUMS
  push [name ...]                          upload dist trees to the artifact bucket
  pull <name>                              download one dist tree
  targets <env> <name>                     print SSM deploy targets
  promote <env> <name> <dist-dir> <sha>    sync origin + invalidate CloudFront
  record <env> <name> <sha> <digest>       write current/previous SSM pointers
  smoke <domain> [sha] [name]              post-deploy HTTP checks
  pdt <name> <domain>                      Playwright against the live origin
  rollback <env> <name> <sha>              promote a previous immutable release
  restore <env> <name>                     restore SSM previous SHA
  logs <label> <path> [path...]            upload CI diagnostics to S3
EOF
}

cmd_verify() {
  local dist="${1:?dist dir required}"
  local name="${2:-}"

  if [[ ! -f "${dist}/mf-manifest.json" ]]; then
    echo "::error::Missing ${dist}/mf-manifest.json" >&2
    exit 1
  fi
  if [[ ! -f "${dist}/remoteEntry.js" ]]; then
    echo "::error::Missing ${dist}/remoteEntry.js" >&2
    exit 1
  fi

  jq -e 'type == "object"' "${dist}/mf-manifest.json" >/dev/null
  if [[ -n "${name}" ]]; then
    jq -e --arg name "${name}" '
      (.id // .name // .meta?.name // "") as $id
      | ($id == "" or $id == $name or (.exposes? | type != "null"))
    ' "${dist}/mf-manifest.json" >/dev/null
  fi

  if [[ -d "${dist}/assets" ]] && [[ -z "$(find "${dist}/assets" -type f | head -n 1)" ]]; then
    echo "::error::${dist}/assets exists but contains no files" >&2
    exit 1
  fi

  echo "Verified federation artefacts in ${dist}"
}

cmd_package() {
  local name="${1:?mfe name required}"
  local git_sha="${2:-${GITHUB_SHA:-$(git -C "${ROOT}" rev-parse HEAD)}}"
  local dist="${ROOT}/dist/${name}"
  local checksums digest

  cmd_verify "${dist}" "${name}"

  checksums="$(
    (
      cd "${dist}"
      find . -type f | sort | while read -r file; do
        shasum -a 256 "${file}"
      done
    )
  )"
  digest="$(printf '%s\n' "${checksums}" | shasum -a 256 | awk '{print $1}')"

  cat >"${dist}/release.json" <<EOF
{
  "name": "${name}",
  "gitSha": "${git_sha}",
  "digest": "${digest}",
  "builtAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

  printf '%s\n' "${checksums}" >"${dist}/SHA256SUMS"
  echo "${digest}" >"${dist}/digest.sha256"
  echo "Packaged ${name} @ ${git_sha} digest=${digest}"
}

cmd_push() {
  local bucket="${ARTIFACT_BUCKET:?ARTIFACT_BUCKET is required}"
  local prefix="${ARTIFACT_PREFIX:-releases/${GITHUB_SHA:?GITHUB_SHA is required}}"
  local names=("${@}")
  local uploaded=0
  local name dist

  if [[ "${#names[@]}" -eq 0 ]]; then
    mapfile -t names < <(node "${ROOT}/scripts/catalog.mjs" list | jq -r '.[]')
  fi

  for name in "${names[@]}"; do
    dist="${ROOT}/dist/${name}"
    if [[ ! -d "${dist}" ]]; then
      echo "Missing dist for ${name}: dist/${name}" >&2
      exit 1
    fi
    cmd_verify "${dist}" "${name}"
    aws s3 sync "${dist}/" "s3://${bucket}/${prefix}/${name}/" \
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
}

cmd_pull() {
  local name="${1:?mfe name required (e.g. todo)}"
  local bucket="${ARTIFACT_BUCKET:?ARTIFACT_BUCKET is required}"
  local prefix="${ARTIFACT_PREFIX:-releases/${GITHUB_SHA:?GITHUB_SHA is required}}"
  local dest="${ROOT}/dist/${name}"

  mkdir -p "${dest}"
  echo "Downloading s3://${bucket}/${prefix}/${name}/ -> ${dest}/ ..."
  aws s3 sync "s3://${bucket}/${prefix}/${name}/" "${dest}/" \
    --delete \
    --only-show-errors
  cmd_verify "${dest}" "${name}"
  echo "Artifact pull complete."
}

cmd_targets() {
  local environment="${1:?environment required (staging|production)}"
  local name="${2:?mfe name required}"
  local param="/medmate/mfe/${environment}/${name}/targets"
  local json bucket distribution domain

  json="$(aws ssm get-parameter --name "${param}" --query 'Parameter.Value' --output text)"
  bucket="$(jq -r '.bucket_name // empty' <<<"${json}")"
  distribution="$(jq -r '.distribution_id // empty' <<<"${json}")"
  domain="$(jq -r '.domain_name // empty' <<<"${json}")"

  if [[ -z "${bucket}" || -z "${distribution}" || -z "${domain}" ]]; then
    echo "::error::Incomplete SSM target ${param}" >&2
    exit 1
  fi

  echo "bucket=${bucket}"
  echo "distribution_id=${distribution}"
  echo "domain=${domain}"
  echo "manifest_url=https://${domain}/mf-manifest.json"
}

wait_invalidation() {
  local distribution_id="${1:?distribution id required}"
  local invalidation_id="${2:?invalidation id required}"
  local status

  for _ in $(seq 1 36); do
    status="$(aws cloudfront get-invalidation \
      --distribution-id "${distribution_id}" \
      --id "${invalidation_id}" \
      --query 'Invalidation.Status' \
      --output text)"
    echo "Invalidation ${invalidation_id}: ${status}"
    if [[ "${status}" == "Completed" ]]; then
      return 0
    fi
    sleep 5
  done

  echo "::error::Timed out waiting for CloudFront invalidation ${invalidation_id}" >&2
  exit 1
}

cmd_promote() {
  local environment="${1:?environment required}"
  local name="${2:?mfe name required}"
  local dist_dir="${3:?dist dir required}"
  local git_sha="${4:?git sha required}"
  local packaged_sha bucket distribution_id release_prefix invalidation_id

  cmd_verify "${dist_dir}" "${name}"

  if [[ ! -f "${dist_dir}/release.json" ]]; then
    echo "::error::Missing release.json — release.sh package must run before promote" >&2
    exit 1
  fi

  packaged_sha="$(jq -r '.gitSha' "${dist_dir}/release.json")"
  if [[ "${packaged_sha}" != "${git_sha}" ]]; then
    echo "::error::Release SHA ${packaged_sha} does not match ${git_sha}" >&2
    exit 1
  fi

  eval "$(cmd_targets "${environment}" "${name}" | sed 's/^/TARGET_/')"
  bucket="${TARGET_bucket:?}"
  distribution_id="${TARGET_distribution_id:?}"
  release_prefix="releases/${git_sha}"

  echo "Promoting ${name} @ ${git_sha} to ${environment} s3://${bucket}/${release_prefix}/"

  aws s3 sync "${dist_dir}/" "s3://${bucket}/${release_prefix}/" \
    --delete \
    --only-show-errors \
    --cache-control "public,max-age=31536000,immutable" \
    --exclude "mf-manifest.json" \
    --exclude "index.html" \
    --exclude "release.json" \
    --exclude "SHA256SUMS" \
    --exclude "*.json"

  aws s3 sync "${dist_dir}/" "s3://${bucket}/${release_prefix}/" \
    --only-show-errors \
    --cache-control "public,max-age=0,must-revalidate" \
    --exclude "*" \
    --include "mf-manifest.json" \
    --include "index.html" \
    --include "release.json" \
    --include "SHA256SUMS" \
    --include "*.json"

  aws s3 sync "${dist_dir}/" "s3://${bucket}/current/" \
    --delete \
    --only-show-errors \
    --cache-control "public,max-age=0,must-revalidate"

  aws s3 sync "${dist_dir}/" "s3://${bucket}/" \
    --only-show-errors \
    --cache-control "public,max-age=31536000,immutable" \
    --exclude "releases/*" \
    --exclude "current/*" \
    --exclude "mf-manifest.json" \
    --exclude "remoteEntry.js" \
    --exclude "index.html" \
    --exclude "release.json" \
    --exclude "SHA256SUMS" \
    --exclude "*.json"

  aws s3 cp "${dist_dir}/remoteEntry.js" "s3://${bucket}/remoteEntry.js" \
    --cache-control "public,max-age=0,must-revalidate" \
    --content-type "application/javascript"

  aws s3 cp "${dist_dir}/mf-manifest.json" "s3://${bucket}/mf-manifest.json" \
    --cache-control "public,max-age=0,must-revalidate" \
    --content-type "application/json"

  aws s3 cp "${dist_dir}/release.json" "s3://${bucket}/release.json" \
    --cache-control "public,max-age=0,must-revalidate" \
    --content-type "application/json"

  if [[ -f "${dist_dir}/index.html" ]]; then
    aws s3 cp "${dist_dir}/index.html" "s3://${bucket}/index.html" \
      --cache-control "public,max-age=0,must-revalidate" \
      --content-type "text/html"
  fi

  invalidation_id="$(
    aws cloudfront create-invalidation \
      --distribution-id "${distribution_id}" \
      --paths "/mf-manifest.json" "/remoteEntry.js" "/release.json" "/index.html" "/current/*" \
      --query 'Invalidation.Id' \
      --output text \
      --no-cli-pager
  )"

  wait_invalidation "${distribution_id}" "${invalidation_id}"
  echo "Promoted ${name} ${environment} https://${TARGET_domain}/mf-manifest.json"
}

cmd_record() {
  local environment="${1:?environment required}"
  local name="${2:?mfe name required}"
  local git_sha="${3:?git sha required}"
  local digest="${4:?digest required}"
  local current="/medmate/mfe/${environment}/${name}/current"
  local previous="/medmate/mfe/${environment}/${name}/previous"
  local payload existing

  if existing="$(aws ssm get-parameter --name "${current}" --query 'Parameter.Value' --output text 2>/dev/null)"; then
    aws ssm put-parameter --name "${previous}" --type String --overwrite --value "${existing}" >/dev/null
  fi

  payload="$(jq -cn --arg sha "${git_sha}" --arg digest "${digest}" '{gitSha:$sha, digest:$digest}')"
  aws ssm put-parameter --name "${current}" --type String --overwrite --value "${payload}" >/dev/null
  echo "Recorded ${name} ${environment} ${git_sha}"
}

cmd_smoke() {
  local domain="${1:?domain required}"
  local git_sha="${2:-}"
  local name="${3:-}"
  local manifest_url="https://${domain}/mf-manifest.json"
  local entry_url="https://${domain}/remoteEntry.js"
  local release_url="https://${domain}/release.json"
  local body headers code chunk chunk_url chunk_code release deployed

  retry() {
    local attempts="$1"
    shift
    local n=0
    until "$@"; do
      n=$((n + 1))
      if [[ "${n}" -ge "${attempts}" ]]; then
        return 1
      fi
      sleep 2
    done
  }

  fetch() {
    curl -fsSL --retry 5 --retry-delay 2 --retry-all-errors "$1"
  }

  echo "Smoke: ${manifest_url}"
  body="$(retry 8 fetch "${manifest_url}")"
  echo "${body}" | jq -e 'type == "object"' >/dev/null
  echo "${body}" | jq -e 'has("id") or has("name") or has("meta") or has("exposes") or length > 0' >/dev/null
  if [[ -n "${name}" ]]; then
    echo "${body}" | jq -e --arg name "${name}" '
      (.id // .name // .meta.name // $name) as $id | $id == $name or has("exposes")
    ' >/dev/null
  fi

  headers="$(curl -fsSIL --retry 5 --retry-delay 2 "${manifest_url}")"
  echo "${headers}" | grep -qiE 'access-control-allow-origin' || {
    echo "::error::Missing CORS header on ${manifest_url}" >&2
    exit 1
  }
  echo "${headers}" | grep -qiE 'strict-transport-security' || {
    echo "::error::Missing HSTS header on ${manifest_url}" >&2
    exit 1
  }

  code="$(curl -fsSIL --retry 5 --retry-delay 2 -o /dev/null -w '%{http_code}' "${entry_url}")"
  if [[ "${code}" != "200" ]]; then
    echo "::error::remoteEntry.js returned HTTP ${code} for ${domain}" >&2
    exit 1
  fi

  chunk="$(echo "${body}" | jq -r '
    .. | objects | .file // .src // empty | select(test("\\.(js|css)$"))
  ' | head -n 1)"
  if [[ -n "${chunk}" && "${chunk}" != "null" ]]; then
    chunk="${chunk#./}"
    chunk_url="https://${domain}/${chunk}"
    chunk_code="$(curl -fsSIL --retry 3 --retry-delay 1 -o /dev/null -w '%{http_code}' "${chunk_url}" || true)"
    if [[ "${chunk_code}" != "200" ]]; then
      echo "::error::Referenced chunk ${chunk_url} returned HTTP ${chunk_code}" >&2
      exit 1
    fi
  fi

  if [[ -n "${git_sha}" ]]; then
    release="$(retry 8 fetch "${release_url}")"
    deployed="$(echo "${release}" | jq -r '.gitSha // empty')"
    if [[ "${deployed}" != "${git_sha}" ]]; then
      echo "::error::Deployed SHA ${deployed} does not match ${git_sha}" >&2
      exit 1
    fi
  fi

  echo "OK ${domain}"
}

cmd_pdt() {
  local name="${1:?mfe name required}"
  local domain="${2:?domain required}"
  local package
  package="$(node "${ROOT}/scripts/catalog.mjs" get "${name}" | jq -r '.package')"

  export PDT_BASE_URL="https://${domain}"
  export CI=true

  pnpm exec playwright install --with-deps chromium
  pnpm --filter "${package}" exec playwright test -c e2e/playwright.config.ts
}

cmd_rollback() {
  local environment="${1:?environment required}"
  local name="${2:?mfe name required}"
  local git_sha="${3:?git sha required}"
  local bucket="${ARTIFACT_BUCKET:?ARTIFACT_BUCKET is required}"

  ARTIFACT_PREFIX="releases/${git_sha}" ARTIFACT_BUCKET="${bucket}" cmd_pull "${name}"

  if [[ ! -f "${ROOT}/dist/${name}/release.json" ]]; then
    echo "::error::Release ${git_sha} for ${name} is missing release.json" >&2
    exit 1
  fi

  cmd_promote "${environment}" "${name}" "${ROOT}/dist/${name}" "${git_sha}"
}

cmd_restore() {
  local environment="${1:?environment required}"
  local name="${2:?mfe name required}"
  local param="/medmate/mfe/${environment}/${name}/previous"
  local json sha

  if ! json="$(aws ssm get-parameter --name "${param}" --query 'Parameter.Value' --output text 2>/dev/null)"; then
    echo "::error::No previous known-good SHA recorded at ${param}" >&2
    exit 1
  fi

  sha="$(jq -r '.gitSha // empty' <<<"${json}")"
  if [[ -z "${sha}" ]]; then
    echo "::error::previous parameter is missing gitSha" >&2
    exit 1
  fi

  cmd_rollback "${environment}" "${name}" "${sha}"
}

cmd_logs() {
  local label="${1:?label required}"
  shift
  local run_id="${GITHUB_RUN_ID:-local}"
  local sha="${GITHUB_SHA:-unknown}"
  local dest uploaded=0 path name

  if [[ -z "${ARTIFACT_BUCKET:-}" ]]; then
    echo "ARTIFACT_BUCKET is unset; skipping S3 log upload for ${label}"
    return 0
  fi

  dest="s3://${ARTIFACT_BUCKET}/ci-logs/${sha}/${run_id}/${label}/"

  for path in "$@"; do
    if [[ -e "${path}" ]]; then
      name="$(basename "${path}")"
      if [[ -d "${path}" ]]; then
        aws s3 sync "${path}/" "${dest}${name}/" --only-show-errors
      else
        aws s3 cp "${path}" "${dest}${name}" --only-show-errors
      fi
      uploaded=$((uploaded + 1))
    fi
  done

  if [[ "${uploaded}" -eq 0 ]]; then
    echo "No diagnostic files to upload for ${label}"
    return 0
  fi

  echo "Uploaded ${uploaded} path(s) to ${dest}"
}

cmd_affected() {
  local base_ref="${1:-origin/main}"
  local catalog changed shared_hit=0
  local names=()
  local row name path filter

  catalog="$(cat "${ROOT}/config/mfes.json")"

  if ! git -C "${ROOT}" rev-parse --verify "${base_ref}" >/dev/null 2>&1; then
    node "${ROOT}/scripts/catalog.mjs" matrix
    return 0
  fi

  changed="$(git -C "${ROOT}" diff --name-only "${base_ref}...HEAD" || true)"
  if echo "${changed}" | grep -E '^(packages/|config/|scripts/|infra/|\.github/|pnpm-lock\.yaml|package\.json|turbo\.json|pnpm-workspace.yaml|eslint.config.js|tsconfig.json)' >/dev/null; then
    shared_hit=1
  fi

  while IFS= read -r row; do
    name="$(echo "${row}" | jq -r '.name')"
    path="$(echo "${row}" | jq -r '.path')"
    if [[ "${shared_hit}" -eq 1 ]] || echo "${changed}" | grep -E "^${path}/" >/dev/null; then
      names+=("${name}")
    fi
  done < <(echo "${catalog}" | jq -c '.mfes[]')

  if [[ "${#names[@]}" -eq 0 ]]; then
    echo '{"include":[]}'
    return 0
  fi

  filter="$(printf '%s\n' "${names[@]}" | jq -R . | jq -s .)"
  echo "${catalog}" | jq -c --argjson names "${filter}" '
    . as $catalog
    | {
        include: [
          .mfes[]
          | select(.name as $n | $names | index($n))
          | {
              name,
              package,
              path,
              federationName,
              port,
              owner,
              domain,
              stagingDomain: "\(.name).\($catalog.environments.staging.domainSuffix)",
              productionDomain: .domain
            }
        ]
      }
  '
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

COMMAND="${1}"
shift

case "${COMMAND}" in
  -h | --help | help) usage ;;
  affected) cmd_affected "$@" ;;
  verify) cmd_verify "$@" ;;
  package) cmd_package "$@" ;;
  push) cmd_push "$@" ;;
  pull) cmd_pull "$@" ;;
  targets) cmd_targets "$@" ;;
  promote) cmd_promote "$@" ;;
  record) cmd_record "$@" ;;
  smoke) cmd_smoke "$@" ;;
  pdt) cmd_pdt "$@" ;;
  rollback) cmd_rollback "$@" ;;
  restore) cmd_restore "$@" ;;
  logs) cmd_logs "$@" ;;
  *)
    echo "::error::Unknown command: ${COMMAND}" >&2
    usage >&2
    exit 1
    ;;
esac
