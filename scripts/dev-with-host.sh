#!/usr/bin/env bash
# Start the Todo MFE and print a Pharmacy Portal .env snippet.
# Expects sibling layout: ../MED0002_PharmacyPortal next to this repo.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${TODO_PORT:-5101}"
MANIFEST_URL="http://localhost:${PORT}/mf-manifest.json"
PORTAL_DIR="${PORTAL_DIR:-${ROOT}/../MED0002_PharmacyPortal}"

cd "$ROOT"

echo "==> Starting @medmate/todo on port ${PORT}"
pnpm --filter @medmate/todo exec vite --port "$PORT" --strictPort &
TODO_PID=$!

cleanup() {
  if kill -0 "$TODO_PID" 2>/dev/null; then
    kill "$TODO_PID" 2>/dev/null || true
    wait "$TODO_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "==> Waiting for ${MANIFEST_URL}"
ready=0
for _ in $(seq 1 60); do
  if curl -fsS "$MANIFEST_URL" >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done

if [ "$ready" -ne 1 ]; then
  echo "Timed out waiting for mf-manifest.json at ${MANIFEST_URL}" >&2
  exit 1
fi

echo
echo "Todo remote is healthy."
echo
echo "---- Pharmacy Portal .env snippet ----"
echo "VITE_REMOTE_TODO_URL=${MANIFEST_URL}"
echo "--------------------------------------"
echo
if [ -d "$PORTAL_DIR" ]; then
  echo "Sibling portal detected at: ${PORTAL_DIR}"
  echo "In that repo: cp .env.example .env  # then set VITE_REMOTE_TODO_URL as above"
  echo "               pnpm install && pnpm dev"
else
  echo "No sibling portal at ${PORTAL_DIR} (set PORTAL_DIR to override)."
fi
echo
echo "Press Ctrl+C to stop the Todo remote."

wait "$TODO_PID"
