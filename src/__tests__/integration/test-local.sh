#!/bin/bash
# Integration test script to test the action locally using @github/local-action

set -e

# Navigate to project root (three levels up from src/__tests__/integration/)
cd "$(dirname "$0")/../../.."

echo "🧪 Testing sync-issues action locally..."

# Check if local-action is installed
if ! command -v local-action &> /dev/null; then
    echo "❌ @github/local-action is not installed"
    echo "📦 Installing @github/local-action..."
    npm install -g @github/local-action
fi

# Build the action first
echo "🔨 Building action..."
npm run build
npm run package

# Check if GITHUB_TOKEN is set, otherwise use gh auth token
if [ -z "${GITHUB_TOKEN:-}" ]; then
    GITHUB_TOKEN=$(gh auth token 2>/dev/null)
    if [ -z "$GITHUB_TOKEN" ]; then
        echo "❌ GITHUB_TOKEN is required"
        echo "   Please set GITHUB_TOKEN environment variable or run 'gh auth login'"
        exit 1
    fi
fi

# Set GitHub context if not provided
export GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-vig-os/sync-issues-action}"

# Create a temporary .env file for local-action
ENV_FILE=$(mktemp)
OUTPUT_FILE=$(mktemp)
cat > "$ENV_FILE" <<EOF
INPUT_TOKEN=$GITHUB_TOKEN
GITHUB_REPOSITORY=$GITHUB_REPOSITORY
INPUT_OUTPUT-DIR=test_output
INPUT_SYNC-ISSUES=true
INPUT_SYNC-PRS=true
INPUT_INCLUDE-CLOSED=false
EOF

# Run local-action with entrypoint and capture outputs
echo "🚀 Running local-action..."
GITHUB_OUTPUT="$OUTPUT_FILE" local-action run . dist/index.js "$ENV_FILE" || {
    echo "❌ local-action failed. Make sure @github/local-action is up to date."
    rm -f "$ENV_FILE" "$OUTPUT_FILE"
    exit 1
}

# Show outputs if any were written
if [ -s "$OUTPUT_FILE" ]; then
    echo ""
    echo "================ Outputs ================"
    cat "$OUTPUT_FILE"
    echo "========================================"
else
    echo ""
    echo "⚠️  No outputs captured (local-action may not surface them)."
fi

# Clean up
rm -f "$ENV_FILE" "$OUTPUT_FILE"

echo "✅ Local testing complete!"
