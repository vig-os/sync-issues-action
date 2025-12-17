#!/bin/bash
# Integration test script to test the action locally
# This runs the action code directly with mocked inputs

set -e

# Navigate to project root (three levels up from src/__tests__/integration/)
cd "$(dirname "$0")/../../.."

# Main test function - wraps all logic to scope variables and prevent env pollution
main() {
  echo "🧪 Testing sync-issues action locally..."
  echo ""

  # Build the action if needed (check if dist/index.js exists and is up to date)
  local DIST_FILE="dist/index.js"
  local NEEDS_BUILD=true

  if [ -f "$DIST_FILE" ]; then
    # Check if any source file is newer than the dist file
    local NEWEST_SOURCE
    NEWEST_SOURCE=$(find src -name "*.ts" -type f -print0 | xargs -0 stat -c %Y 2>/dev/null | sort -n | tail -1)
    local DIST_TIME
    DIST_TIME=$(stat -c %Y "$DIST_FILE" 2>/dev/null)

    if [ -n "$NEWEST_SOURCE" ] && [ -n "$DIST_TIME" ] && [ "$NEWEST_SOURCE" -le "$DIST_TIME" ]; then
      NEEDS_BUILD=false
      echo "✓ Build is up to date, skipping..."
    fi
  fi

  if [ "$NEEDS_BUILD" = true ]; then
    echo "📦 Building action..."
    npm run build
    npm run package
  fi

  # Set up test environment variables (mocking GitHub inputs)
  # You can override these by setting environment variables before running the script:
  #   export INPUT_OUTPUT_DIR="my-custom-dir"  # Note: script converts to INPUT_OUTPUT-DIR for @actions/core
  #   export INPUT_SYNC_ISSUES="true"
  #   export INPUT_SYNC_PRS="true"
  #   export INPUT_INCLUDE_CLOSED="false"
  #   export GITHUB_REPOSITORY="my-org/my-repo"
  #   etc.

  # Check if GITHUB_TOKEN is set, otherwise use gh auth token
  local GITHUB_TOKEN="${GITHUB_TOKEN:-}"
  if [ -z "$GITHUB_TOKEN" ]; then
      GITHUB_TOKEN=$(gh auth token 2>/dev/null)
      if [ -z "$GITHUB_TOKEN" ]; then
          echo "❌ Failed to get GitHub token from gh"
          echo "   Please set GITHUB_TOKEN environment variable or run 'gh auth login'"
          return 1
      else
          echo "✓ Using GitHub token from gh"
      fi
  else
      echo "✓ Using provided GITHUB_TOKEN"
  fi

  # Set GitHub context variables (local to avoid env pollution)
  # Use environment variables if set, otherwise try to infer from git
  local GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-}"
  if [ -z "$GITHUB_REPOSITORY" ]; then
    # Try to get from git remote
    GITHUB_REPOSITORY="vig-os/actions"
  fi

  local GITHUB_REF="${GITHUB_REF:-}"
  local GITHUB_SHA="${GITHUB_SHA:-}"

  # Validate required variables
  if [ -z "$GITHUB_REPOSITORY" ]; then
    echo "❌ GITHUB_REPOSITORY is required"
    echo "   Set it as an environment variable or ensure git remote is configured"
    return 1
  fi

  # Set output directory (use bash-friendly name, but @actions/core expects INPUT_OUTPUT-DIR with hyphen)
  local OUTPUT_DIR="${INPUT_OUTPUT_DIR:-/workspace/actions/test_output/$(date +%Y-%m-%d_%H-%M-%S)}"
  mkdir -p "$OUTPUT_DIR"

  # Boolean inputs must be exactly "true" or "false" for getBooleanInput
  # @actions/core expects environment variables with hyphens: sync-issues -> INPUT_SYNC-ISSUES
  # getBooleanInput accepts: true, True, TRUE, false, False, FALSE
  # Trim all whitespace (including newlines) and normalize
  local SYNC_ISSUES
  SYNC_ISSUES=$(printf '%s' "${INPUT_SYNC_ISSUES:-true}" | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')
  local SYNC_PRS
  SYNC_PRS=$(printf '%s' "${INPUT_SYNC_PRS:-true}" | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')
  local INCLUDE_CLOSED
  INCLUDE_CLOSED=$(printf '%s' "${INPUT_INCLUDE_CLOSED:-true}" | tr -d '[:space:]' | tr '[:upper:]' '[:lower:]')

  # Ensure they're valid boolean values (exactly "true" or "false")
  [ "$SYNC_ISSUES" != "true" ] && [ "$SYNC_ISSUES" != "false" ] && SYNC_ISSUES="true"
  [ "$SYNC_PRS" != "true" ] && [ "$SYNC_PRS" != "false" ] && SYNC_PRS="true"
  [ "$INCLUDE_CLOSED" != "true" ] && [ "$INCLUDE_CLOSED" != "false" ] && INCLUDE_CLOSED="true"

  # Verify the values are correct (for debugging)
  if [ -n "${DEBUG:-}" ]; then
    echo "Debug - Boolean values:"
    echo "  SYNC_ISSUES='$SYNC_ISSUES' (length: ${#SYNC_ISSUES})"
    echo "  SYNC_PRS='$SYNC_PRS' (length: ${#SYNC_PRS})"
    echo "  INCLUDE_CLOSED='$INCLUDE_CLOSED' (length: ${#INCLUDE_CLOSED})"
  fi

  echo "Running action with:"
  echo "  GITHUB_REPOSITORY: $GITHUB_REPOSITORY"
  echo "  GITHUB_REF: $GITHUB_REF"
  echo "  GITHUB_SHA: $GITHUB_SHA"
  echo "  OUTPUT_DIR: $OUTPUT_DIR"
  echo "  SYNC_ISSUES: $SYNC_ISSUES"
  echo "  SYNC_PRS: $SYNC_PRS"
  echo "  INCLUDE_CLOSED: $INCLUDE_CLOSED"
  echo ""

  # Run the action with environment variables set correctly
  # @actions/core expects INPUT_<INPUT-NAME> with hyphens preserved
  echo "🚀 Executing action..."
  env \
    "INPUT_TOKEN=$GITHUB_TOKEN" \
    "GITHUB_REPOSITORY=$GITHUB_REPOSITORY" \
    "GITHUB_REF=$GITHUB_REF" \
    "GITHUB_SHA=$GITHUB_SHA" \
    "INPUT_OUTPUT-DIR=$OUTPUT_DIR" \
    "INPUT_SYNC-ISSUES=$SYNC_ISSUES" \
    "INPUT_SYNC-PRS=$SYNC_PRS" \
    "INPUT_INCLUDE-CLOSED=$INCLUDE_CLOSED" \
    node dist/index.js

  local EXIT_CODE=$?
  if [ $EXIT_CODE -ne 0 ]; then
    echo "❌ Action failed with exit code: $EXIT_CODE"
    return $EXIT_CODE
  fi

  echo ""
  echo "✅ Action completed!"
  echo "Check output in: $OUTPUT_DIR"
}

# Run main function and exit with its return code
main
exit $?
