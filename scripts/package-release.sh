#!/usr/bin/env bash
# Package a built MFE dist into an immutable release metadata payload.
# Usage: package-release.sh <mfe-name> [git-sha]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NAME="${1:?mfe name required}"
GIT_SHA="${2:-${GITHUB_SHA:-$(git -C "${ROOT}" rev-parse HEAD)}}"
DIST="${ROOT}/dist/${NAME}"

chmod +x "${ROOT}/scripts/verify-federation.sh"
"${ROOT}/scripts/verify-federation.sh" "${DIST}" "${NAME}"

checksums="$(
  (
    cd "${DIST}"
    find . -type f | sort | while read -r file; do
      shasum -a 256 "${file}"
    done
  )
)"
digest="$(printf '%s\n' "${checksums}" | shasum -a 256 | awk '{print $1}')"

cat > "${DIST}/release.json" <<EOF
{
  "name": "${NAME}",
  "gitSha": "${GIT_SHA}",
  "digest": "${digest}",
  "builtAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

printf '%s\n' "${checksums}" > "${DIST}/SHA256SUMS"
echo "${digest}" > "${DIST}/digest.sha256"
echo "Packaged ${NAME} @ ${GIT_SHA} digest=${digest}"
