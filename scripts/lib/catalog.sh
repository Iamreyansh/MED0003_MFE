#!/usr/bin/env bash
# Shared catalog helpers for bash scripts.
load_catalog_json() {
  local root
  root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
  cat "${root}/config/mfes.json"
}
