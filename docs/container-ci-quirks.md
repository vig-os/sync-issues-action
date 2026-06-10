# Container CI Notes

Behavioral notes for CI workflows when jobs run inside
`ghcr.io/vig-os/devcontainer:*` via GitHub Actions `container:`.

## Tool bootstrap model

Lint, build, and test jobs run inside the vigOS devcontainer image and use the
same provisioning as local development:

```yaml
- run: ./scripts/setup-node.sh   # lint job: Node for ESLint/Prettier hooks
- run: just sync                 # build/test: Node + npm ci
- run: just verify-dist          # build: ncc bundle + dist drift check
- run: just test-cov              # test: Jest with coverage
```

[`scripts/setup-node.sh`](../scripts/setup-node.sh) reads [`.nvmrc`](../.nvmrc),
installs Node into gitignored `.node/`, and appends to `$GITHUB_PATH` so later
steps in the same job see `npm`.

## Exceptions (ubuntu runners)

These jobs intentionally stay on `ubuntu-*` runners:

- **integration-test** — runs the action via `uses: ./` as a real `node20`
  consumer; the runner provides Node for action execution.
- **dependency-review** — GitHub-hosted action, not project toolchain.

## git safe.directory

`actions/checkout` runs on the host and bind-mounts the workspace into the
container. The resulting directory is owned by a different UID than the
container's root user, which triggers git's `safe.directory` rejection.
Container jobs add:

```yaml
- run: git config --global --add safe.directory "$GITHUB_WORKSPACE"
```

## Root user

The container runs as `root` by default. No `sudo` is required and file
permission issues are unlikely, but any git operations need the
`safe.directory` fix above.

## No Docker-in-Docker

The container job does not have access to a Docker or Podman daemon.
Jobs that require building or running containers are not supported in
in-container CI jobs.

## Pre-commit cache miss

The image ships a pre-commit hook cache at `/opt/pre-commit-cache`, built
from the template workspace's `.pre-commit-config.yaml` (which uses version
tags as revs). This repository pins hooks by commit hash, so the cached
environments do not match and pre-commit downloads fresh environments at
runtime.

## Coverage artifacts

The in-container test job runs `just test-cov` and uploads the `coverage/`
directory as a workflow artifact.
