#!/usr/bin/env bash
# Post-deploy smoke checks for one MFE domain and expected git SHA.
# Usage: post-deploy-smoke.sh <domain> [git-sha] [mfe-name]
set -euo pipefail

DOMAIN="${1:?domain required}"
GIT_SHA="${2:-}"
NAME="${3:-}"

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

manifest_url="https://${DOMAIN}/mf-manifest.json"
entry_url="https://${DOMAIN}/remoteEntry.js"
release_url="https://${DOMAIN}/release.json"

echo "Smoke: ${manifest_url}"
body="$(retry 8 fetch "${manifest_url}")"
echo "${body}" | jq -e 'type == "object"' >/dev/null
echo "${body}" | jq -e 'has("id") or has("name") or has("meta") or has("exposes") or length > 0' >/dev/null
if [[ -n "${NAME}" ]]; then
  echo "${body}" | jq -e --arg name "${NAME}" '
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
  echo "::error::remoteEntry.js returned HTTP ${code} for ${DOMAIN}" >&2
  exit 1
fi

# Request a referenced file from the manifest when present.
chunk="$(echo "${body}" | jq -r '
  .. | objects | .file // .src // empty | select(test("\\.(js|css)$"))
' | head -n 1)"
if [[ -n "${chunk}" && "${chunk}" != "null" ]]; then
  chunk="${chunk#./}"
  chunk_url="https://${DOMAIN}/${chunk}"
  chunk_code="$(curl -fsSIL --retry 3 --retry-delay 1 -o /dev/null -w '%{http_code}' "${chunk_url}" || true)"
  if [[ "${chunk_code}" != "200" ]]; then
    echo "::error::Referenced chunk ${chunk_url} returned HTTP ${chunk_code}" >&2
    exit 1
  fi
fi

if [[ -n "${GIT_SHA}" ]]; then
  release="$(retry 8 fetch "${release_url}")"
  deployed="$(echo "${release}" | jq -r '.gitSha // empty')"
  if [[ "${deployed}" != "${GIT_SHA}" ]]; then
    echo "::error::Deployed SHA ${deployed} does not match ${GIT_SHA}" >&2
    exit 1
  fi
fi

echo "OK ${DOMAIN}"
