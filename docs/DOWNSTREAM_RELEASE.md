# Downstream Release Guide

This document describes the release process for **sync-issues-action**, a TypeScript GitHub Action distributed via git tags and `dist/index.js`.

## Overview

The release pipeline uses modular workflows:

| Phase | Workflow | Purpose |
|-------|----------|---------|
| 1 | `prepare-release.yml` | Freeze CHANGELOG, create `release/X.Y.Z` branch, open draft PR to `main` |
| 2 | `release.yml` | Validate, finalize, test, publish tag, create draft GitHub Release |
| 3 | `promote-release.yml` | Publish (undraft) GitHub Release, merge release PR to `main` |
| 4 | `sync-main-to-dev.yml` | PR-based sync of `main` back into `dev` |

## Tag convention

All release tags use a **`v` prefix**:

- Final release: `v1.2.3`
- Release candidate: `v1.2.3-rc1`, `v1.2.3-rc2`, …
- Floating tags (updated on final release): `v1`, `v1.2`

Consumers pin the action with:

```yaml
uses: vig-os/sync-issues-action@v0.2.2
```

## Release steps

### 1. Prepare release

```bash
just prepare-release 1.2.3
# or: gh workflow run prepare-release.yml --ref dev -f "version=1.2.3"
```

This freezes the CHANGELOG `## Unreleased` section into `## [1.2.3] - TBD`, creates `release/1.2.3`, and opens a draft PR to `main`.

### 2. Review and merge readiness

- Ensure the release PR CI passes
- Get PR approval
- Mark the PR as ready for review (not draft)

### 3. Release (candidate or final)

**Candidate** (optional, for pre-release validation):

```bash
just publish-candidate 1.2.3
```

**Final**:

```bash
just finalize-release 1.2.3
```

The final release:

1. Bumps `package.json` version
2. Sets the CHANGELOG release date
3. Triggers `sync-issues.yml` on the release branch
4. Runs build + dist verification + Jest tests
5. Updates floating tags (`v1`, `v1.2`)
6. Creates git tag `v1.2.3` and a **draft** GitHub Release

### 4. Promote release

After reviewing the draft GitHub Release:

```bash
just promote-release 1.2.3
```

This publishes the GitHub Release, merges the release PR to `main`, and cleans up orphaned RC tags.

## Prerequisites

The following repository secrets must be configured:

| Secret | Purpose |
|--------|---------|
| `RELEASE_APP_ID` | GitHub App ID for release operations |
| `RELEASE_APP_PRIVATE_KEY` | GitHub App private key |
| `COMMIT_APP_ID` | GitHub App ID for commit operations |
| `COMMIT_APP_PRIVATE_KEY` | GitHub App private key |

The workflows use `vig-os/commit-action` for API-based commits.

## Project-specific notes

Unlike the vigOS devcontainer repo, this project:

- Does **not** publish container images (no GHCR/cosign gate)
- Ships a pre-built `dist/index.js` bundle (verified in CI and release test job)
- Uses `v`-prefixed semver tags for GitHub Action consumers
