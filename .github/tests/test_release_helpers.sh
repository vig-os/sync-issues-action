#!/usr/bin/env bash
# Tests for release_helpers.sh
#
# Run: bash .github/tests/test_release_helpers.sh
#
# Uses simple shell assertions (no external test framework required).
# Each test function prints PASS/FAIL and the script exits non-zero on
# any failure.
#
# Refs: https://github.com/vig-os/sync-issues-action/issues/13

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091  # path resolved at runtime
source "$SCRIPT_DIR/../release_helpers.sh"

FAILURES=0
TESTS=0

assert_ok() {
  local desc="$1"; shift
  TESTS=$((TESTS + 1))
  if "$@" 2>/dev/null; then
    echo "  PASS: $desc"
  else
    echo "  FAIL: $desc"
    FAILURES=$((FAILURES + 1))
  fi
}

assert_fail() {
  local desc="$1"; shift
  TESTS=$((TESTS + 1))
  if "$@" 2>/dev/null; then
    echo "  FAIL: $desc (expected failure, got success)"
    FAILURES=$((FAILURES + 1))
  else
    echo "  PASS: $desc"
  fi
}

echo "validate_version"
assert_ok   "accepts 1.2.3"         validate_version "1.2.3"
assert_ok   "accepts 0.0.0"         validate_version "0.0.0"
assert_ok   "accepts 10.20.30"      validate_version "10.20.30"
assert_fail "rejects empty string"  validate_version ""
assert_fail "rejects missing arg"   validate_version
assert_fail "rejects two-part"      validate_version "1.2"
assert_fail "rejects four-part"     validate_version "1.2.3.4"
assert_fail "rejects v-prefix"      validate_version "v1.2.3"
assert_fail "rejects alpha"         validate_version "abc"
assert_fail "rejects pre-release"   validate_version "1.2.3-rc.1"

echo ""
echo "Results: $TESTS tests, $FAILURES failures"
[ "$FAILURES" -eq 0 ]
