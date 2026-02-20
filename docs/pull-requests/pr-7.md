---
type: pull_request
state: closed (merged)
branch: chore/6-create-ci-placeholders → main
created: 2026-02-18T17:05:50Z
updated: 2026-02-18T20:42:20Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/pull/7
comments: 0
labels: none
assignees: c-vigo
milestone: none
projects: none
relationship: none
merged: 2026-02-18T20:42:09Z
synced: 2026-02-20T12:03:17.145Z
---

# [PR 7](https://github.com/vig-os/sync-issues-action/pull/7) feat: add CI/release workflow placeholders and setup-env composite action

## Description

Registers GitHub Actions workflow placeholders and introduces a reusable `setup-env` composite action to establish the CI/CD skeleton for the project. The placeholder workflows are minimal but valid, allowing GitHub to recognise and enforce them as branch protection checks immediately, while full implementations follow in separate PRs.

## Related Issue(s)

Related to #6

## Type of Change

- [x] New feature (non-breaking change which adds functionality)

## Changes Made

- Added `ci.yml` placeholder workflow registered as a pre-merge gate for PRs targeting `dev`, `main`, and `release/**`
- Added `codeql.yml` placeholder for automated CodeQL security scanning
- Added `scorecard.yml` placeholder for supply-chain security assessments (OpenSSF Scorecard)
- Added `security-scan.yml` placeholder for continuous security monitoring
- Added `prepare-release.yml` workflow for validating and preparing release branches
- Added `release.yml` workflow for finalising, building, testing, and publishing releases
- Added `post-release.yml` workflow to sync `dev` with `main` after release merges and reset the CHANGELOG `Unreleased` section
- Added `.github/actions/setup-env` composite action to install Python, `uv`, and optional tooling (Podman, Node.js, devcontainer CLI, BATS, `just`)
- Updated `CHANGELOG.md` `[Unreleased]` section

## Testing

- [ ] Tests pass locally (`make test`)
- [ ] Image tests pass (`make test-image`)
- [ ] Integration tests pass (`make test-integration`)
- [ ] Registry tests pass (`make test-registry`) (if applicable)
- [x] Manual testing performed (describe below)

### Manual Testing Details

Workflows are placeholder stubs and do not execute substantive steps beyond `actions/checkout`. Verified YAML syntax is valid and each workflow triggers on the correct events/branches.

## Checklist

- [x] My code follows the project's style guidelines
- [x] I have performed a self-review of my code
- [x] I have commented my code, particularly in hard-to-understand areas
- [x] I have updated the documentation accordingly (README.md, CONTRIBUTE.md, etc.)
- [x] I have updated the CHANGELOG.md in the `[Unreleased]` section
- [x] My changes generate no new warnings or errors
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [x] Any dependent changes have been merged and published

## Additional Notes

The `setup-env` action is designed to be imported by the CI workflows once they are fully implemented. It is intentionally opt-in for each optional tool (Podman, Node, devcontainer CLI, BATS) to keep individual jobs lean. The `just` command runner is installed by default since it backs most `Makefile`/`Justfile` targets used across the project.


---
---

## Commits

### Commit 1: [617db2d](https://github.com/vig-os/sync-issues-action/commit/617db2d8dc5e8b87c048888e090eb28b8ff48323) by [c-vigo](https://github.com/c-vigo) on February 18, 2026 at 05:03 PM
feat: add placeholders for CI and release workflows, 1230 files modified

### Commit 2: [3398e56](https://github.com/vig-os/sync-issues-action/commit/3398e56a9e6841aa54702e9a6a989c2040a74bf7) by [c-vigo](https://github.com/c-vigo) on February 18, 2026 at 05:04 PM
docs: update CHANGELOG, 9 files modified (CHANGELOG.md)
