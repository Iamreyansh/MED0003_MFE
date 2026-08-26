#!/usr/bin/env bash
# Verify Module Federation artefacts for one dist directory.
# Usage: verify-federation.sh <dist-dir> [mfe-name]
set -euo pipefail

DIST="${1:?dist dir required}"
NAME="${2:-}"

if [[ ! -f "${DIST}/mf-manifest.json" ]]; then
  echo "::error::Missing ${DIST}/mf-manifest.json" >&2
  exit 1
fi
if [[ ! -f "${DIST}/remoteEntry.js" ]]; then
  echo "::error::Missing ${DIST}/remoteEntry.js" >&2
  exit 1
fi

jq -e 'type == "object"' "${DIST}/mf-manifest.json" >/dev/null
if [[ -n "${NAME}" ]]; then
  jq -e --arg name "${NAME}" '
    (.id // .name // .meta?.name // "") as $id
    | ($id == "" or $id == $name or (.exposes? | type != "null"))
  ' "${DIST}/mf-manifest.json" >/dev/null
fi

if [[ -d "${DIST}/assets" ]] && [[ -z "$(find "${DIST}/assets" -type f | head -n 1)" ]]; then
  echo "::error::${DIST}/assets exists but contains no files" >&2
  exit 1
fi

echo "Verified federation artefacts in ${DIST}"
