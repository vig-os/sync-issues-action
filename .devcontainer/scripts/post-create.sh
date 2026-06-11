#!/bin/bash

# Post-create script - runs once when container is created for the first time.
# This script is called from postCreateCommand in devcontainer.json.
#
# All one-time setup belongs here:
#   - Git repo init, config, hooks
#   - SSH key + allowed-signers placement
#   - GitHub CLI config + authentication
#   - Pre-commit hook installation
#   - Dependency sync (via just)

set -euo pipefail

echo "Running post-create setup..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="/workspace/sync_issues_action"

if [ ! -d "$PROJECT_ROOT" ]; then
    echo "Error: Project directory $PROJECT_ROOT does not exist"
    exit 1
fi

# Set venv prompt
sed -i 's/template-project/sync_issues_action/g' /root/assets/workspace/.venv/bin/activate

# One-time setup: git repo, config, hooks, gh auth
"$SCRIPT_DIR/init-git.sh"
"$SCRIPT_DIR/setup-git-conf.sh"
"$SCRIPT_DIR/setup-gh-repo.sh"
"$SCRIPT_DIR/init-precommit.sh"

# Sync dependencies (fast if nothing changed from pre-built venv)
echo "Syncing dependencies..."
just --justfile "$PROJECT_ROOT/justfile" --working-directory "$PROJECT_ROOT" sync

# User specific setup — TypeScript project: just sync provisions Node via scripts/setup-node.sh

echo "Post-create setup complete"
