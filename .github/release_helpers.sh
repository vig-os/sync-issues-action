#!/usr/bin/env bash
# Release helper functions for CI/CD workflows.
#
# Sourced by prepare-release.yml and release.yml to avoid duplicating
# validation logic inline. Each function returns 0 on success, 1 on failure.
#
# Usage:
#   source .github/release_helpers.sh
#   validate_version "1.2.3"
#
# Refs: https://github.com/vig-os/sync-issues-action/issues/13

set -euo pipefail

validate_version() {
  local version="${1:-}"
  if [[ -z "$version" ]]; then
    echo "ERROR: Version argument is required" >&2
    return 1
  fi
  if ! echo "$version" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
    echo "ERROR: Invalid version format '$version'" >&2
    echo "Version must follow semantic versioning: MAJOR.MINOR.PATCH (e.g., 1.2.3)" >&2
    return 1
  fi
}
