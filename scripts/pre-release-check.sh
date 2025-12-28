#!/usr/bin/env bash
set -euo pipefail

missing=0

check_var() {
  local name="$1"
  local value="${!name-}"

  if [[ -z "${value}" ]]; then
    echo "Missing required env var: ${name}" 1>&2
    missing=1
  else
    echo "OK: ${name} is set"
  fi
}

check_var "API_PORT"
check_var "WEB_PORT"
check_var "RAGFLOW_API_URL"
check_var "RAGFLOW_API_KEY"
check_var "PROVIDER_API_KEY"

if [[ "${missing}" -ne 0 ]]; then
  echo "Pre-release check failed" 1>&2
  exit 1
fi

echo "Pre-release check passed"
