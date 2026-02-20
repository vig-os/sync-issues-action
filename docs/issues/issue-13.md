---
type: issue
state: open
created: 2026-02-20T13:57:05Z
updated: 2026-02-20T14:16:58Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/13
comments: 0
labels: area:ci, feature
assignees: none
milestone: none
projects: none
relationship: none
synced: 2026-02-20T14:17:13.467Z
---

# [Issue 13]: [[FEATURE] Develop and validate CI/CD workflows](https://github.com/vig-os/sync-issues-action/issues/13)

## Description

Add fully operational CI/CD workflows to the repository. Four GitHub Actions workflows and a composite setup action exist as templates carried over from the vigOS devcontainer but have not been validated or customized for this project.

**Workflows:**
| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Lint, test, security scan, dependency review, summary gate |
| `.github/workflows/codeql.yml` | CodeQL static analysis for Python |
| `.github/workflows/scorecard.yml` | OpenSSF Scorecard with SARIF upload |
| `.github/workflows/release.yml` | Release automation (validate → finalize → test → release → rollback) |
| `.github/actions/setup-env/action.yml` | Composite action: Python, uv, optional tooling |

## Problem Statement

The repository has no working CI pipeline. PRs can be merged without lint checks, tests, or security scans. The release workflow has never been exercised. Without validated CI, there is no automated quality gate and branch protection cannot be meaningfully configured.

## Proposed Solution

Review, customize, and validate each workflow end-to-end:

1. **`ci.yml`** — Confirm lint, test, security, dependency-review, and summary jobs run successfully on a PR to `dev`
2. **`codeql.yml`** — Verify CodeQL analysis runs on Python files (PRs, pushes to main, weekly schedule)
3. **`scorecard.yml`** — Verify Scorecard runs on push to main and weekly; SARIF uploads to Security tab
4. **`release.yml`** — Complete a dry-run validation successfully
5. **`setup-env`** — Verify composite action installs Python, uv, and syncs project dependencies
6. **All workflows** — Ensure action references are pinned to full SHA commits
7. **Branch protection** — Configure `dev` and `main` to require CI Summary to pass

**Implementation notes:**
- `ci.yml` depends on the `setup-env` composite action — verify inputs/outputs match this project's needs
- `release.yml` triggers a `sync-issues` workflow mid-run — verify it exists or stub/remove the step
- `release.yml` references `vig-os/commit-action` — confirm the repo has access to this action
- `security` job hard-codes `safety==3.2.11` — verify version compatibility with current deps
- `scorecard.yml` uses `codeql-action/upload-sarif@v3` (SHA `b5ebac6`) while `codeql.yml` uses `codeql-action@v4` (SHA `45cbd0c`) — verify this is intentional or align versions
- Runner is `ubuntu-22.04` across all workflows — decide whether to stay or move to `ubuntu-24.04`

## Alternatives Considered

- **Minimal CI (lint + test only):** Faster to set up but leaves security scanning and release automation for later. Rejected because the workflows already exist and just need validation.
- **Third-party CI (CircleCI, etc.):** Would require rewriting all workflows. Not justified since GitHub Actions is already in use.

## Additional Context

- Related to #6
- The `setup-env` action also supports optional tooling (podman, Node.js, devcontainer CLI, BATS, just) that isn't currently used by any workflow but may be needed later.

## Impact

- All contributors benefit from automated quality gates on PRs
- Backward compatible — adds CI infrastructure without changing existing code
- Enables branch protection rules that require CI to pass

## Changelog Category

Added
