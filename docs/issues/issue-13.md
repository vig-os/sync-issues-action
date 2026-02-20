---
type: issue
state: open
created: 2026-02-20T13:57:05Z
updated: 2026-02-20T13:57:05Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/13
comments: 0
labels: chore, area:ci
assignees: none
milestone: none
projects: none
relationship: none
synced: 2026-02-20T13:57:22.824Z
---

# [Issue 13]: [[CHORE] Develop and validate CI/CD workflows](https://github.com/vig-os/sync-issues-action/issues/13)

### Chore Type

CI / Build change

### Description

The repository has four GitHub Actions workflows and a composite action carried over from the vigOS devcontainer template. They need to be reviewed, customized for this project, and validated end-to-end before branch protection can gate on them.

**Workflows:**
| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | Lint, test, security scan, dependency review, summary gate |
| `.github/workflows/codeql.yml` | CodeQL static analysis for Python |
| `.github/workflows/scorecard.yml` | OpenSSF Scorecard with SARIF upload |
| `.github/workflows/release.yml` | Release automation (validate → finalize → test → release → rollback) |
| `.github/actions/setup-env/action.yml` | Composite action: Python, uv, optional tooling |

### Acceptance Criteria

- [ ] `ci.yml` runs successfully on a PR to `dev` (lint, test, security, dependency-review, summary)
- [ ] `codeql.yml` runs CodeQL analysis on Python files without errors
- [ ] `scorecard.yml` runs and uploads SARIF to the Security tab
- [ ] `release.yml` completes a dry-run validation successfully
- [ ] `setup-env` composite action installs Python, uv, and syncs project dependencies
- [ ] All action references are pinned to full SHA commits
- [ ] Branch protection on `dev` and `main` requires CI Summary to pass

### Implementation Notes

- `ci.yml` depends on the `setup-env` composite action — verify inputs/outputs match this project's needs
- `release.yml` triggers a `sync-issues` workflow mid-run — verify it exists or stub/remove the step
- `release.yml` references `vig-os/commit-action` — confirm the repo has access to this action
- `security` job hard-codes `safety==3.2.11` — verify version compatibility with current deps
- `scorecard.yml` uses `codeql-action/upload-sarif@v3` (SHA `b5ebac6`) while `codeql.yml` uses `codeql-action@v4` (SHA `45cbd0c`) — verify this is intentional or align versions
- Runner is `ubuntu-22.04` across all workflows — decide whether to stay or move to `ubuntu-24.04`

### Related Issues

Related to #6

### Priority

High

### Changelog Category

Added

### Additional Context

The `setup-env` action also supports optional tooling (podman, Node.js, devcontainer CLI, BATS, just) that isn't currently used by any workflow but may be needed later.
