#!/usr/bin/env bash
# Ensure Node.js is installed (from .nvmrc) and on PATH, then optionally run a command.
#
# Install location: <project>/.node/ (gitignored, persists across devcontainer rebuilds)
# PATH exposure:
#   - CI: appends to $GITHUB_PATH when set
#   - dev: idempotently appends export to ~/.bashrc
#
# Usage:
#   ./scripts/setup-node.sh              # ensure Node is available
#   ./scripts/setup-node.sh npm ci       # ensure + run command
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

NODE_DIR="${ROOT}/.node"
PATH_MARKER="# sync-issues-action: node from .node/"

resolve_node_version() {
    local version
    version="$(tr -d '[:space:]' < "${ROOT}/.nvmrc")"
    if echo "${version}" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
        echo "${version}"
        return
    fi
    curl -fsSL https://nodejs.org/dist/index.json \
        | grep -oE '"version":"v'"${version}"'\.[0-9]+\.[0-9]+"' \
        | head -1 \
        | cut -d'"' -f4 \
        | tr -d 'v'
}

install_node() {
    local version arch tarball
    version="$(resolve_node_version)"
    if [ -z "${version}" ]; then
        echo "ERROR: Could not resolve Node.js version from .nvmrc" >&2
        exit 1
    fi

    if [ -x "${NODE_DIR}/bin/npm" ]; then
        return 0
    fi

    echo "Installing Node.js ${version} to ${NODE_DIR}..."
    mkdir -p "${NODE_DIR}"
    arch="$(uname -m)"
    case "${arch}" in
        x86_64) arch="x64" ;;
        aarch64|arm64) arch="arm64" ;;
        *)
            echo "ERROR: Unsupported architecture: ${arch}" >&2
            exit 1
            ;;
    esac

    tarball="node-v${version}-linux-${arch}.tar.gz"
    curl -fsSL "https://nodejs.org/dist/v${version}/${tarball}" \
        | tar -xz -C "${NODE_DIR}" --strip-components=1
}

expose_path() {
    local bin_dir="${NODE_DIR}/bin"

    if [ -n "${GITHUB_PATH:-}" ]; then
        if ! grep -qxF "${bin_dir}" "${GITHUB_PATH}" 2>/dev/null; then
            echo "${bin_dir}" >> "${GITHUB_PATH}"
        fi
    fi

    if [ -f "${HOME}/.bashrc" ]; then
        if ! grep -qF "${PATH_MARKER}" "${HOME}/.bashrc" 2>/dev/null; then
            {
                echo ""
                echo "${PATH_MARKER}"
                echo "export PATH=\"${bin_dir}:\${PATH}\""
            } >> "${HOME}/.bashrc"
        fi
    fi

    export PATH="${bin_dir}:${PATH}"
}

if command -v npm >/dev/null 2>&1; then
    if [ "$#" -gt 0 ]; then
        exec "$@"
    fi
    exit 0
fi

install_node
expose_path

if [ "$#" -gt 0 ]; then
    exec "$@"
fi
