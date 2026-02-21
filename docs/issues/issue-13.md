---
type: issue
state: open
created: 2026-02-20T13:57:05Z
updated: 2026-02-20T14:31:51Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/13
comments: 1
labels: area:ci, feature
assignees: none
milestone: none
projects: none
relationship: none
synced: 2026-02-21T01:29:10.591Z
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
---

# [Comment #1]() by [c-vigo]()

_Posted on February 20, 2026 at 02:31 PM_

## Implementation Plan

**TDD**: Skipped — non-testable changes (config/infrastructure YAML).

### Current State

Five workflow/action files exist as templates from the vigOS devcontainer. All action references are already SHA-pinned. The repo is public at `vig-os/sync-issues-action`. External dependencies (`vig-os/commit-action`, `vig-os/sync-issues-action`) are verified accessible. `sync-issues.yml` workflow exists and is referenced by `release.yml`.

### Branch

`feature/13-ci-cd-workflows` from `dev`

---

### Changes Required

#### 1. `scorecard.yml` — Align codeql-action version (v3 → v4)

`.github/workflows/scorecard.yml` uses `codeql-action/upload-sarif@b5ebac6...` (v3), while `.github/workflows/codeql.yml` uses `codeql-action@45cbd0c...` (v4). Align the scorecard upload-sarif step to v4:

```yaml
# Before
uses: github/codeql-action/upload-sarif@b5ebac6f4c00c8ccddb7cdcd45fdb248329f808a  # v3
# After
uses: github/codeql-action/upload-sarif@45cbd0c69e560cd9e7cd7f8c32362050c9b7ded2  # v4
```

#### 2. `ci.yml` — Update safety version and add API key

The security job pins `safety==3.2.11`. Update to latest (`3.7.0`) and wire up the `SAFETY_API_KEY` secret for full vulnerability database access:

- Change `uv pip install safety==3.2.11` to `uv pip install safety==3.7.0`
- Add `SAFETY_API_KEY: ${{ secrets.SAFETY_API_KEY }}` as env to the safety check step

#### 3. `codeql.yml` — Customize and verify

**Current state (verified correct):**
- Language matrix: `['python']`
- Triggers: PRs to `dev`/`release/**`/`main` (path `**.py`), push to `main` (path `**.py`), weekly cron `15 2 * * 1`
- Actions SHA-pinned: `codeql-action/init` and `codeql-action/analyze` both at `@45cbd0c...` (v4)
- Permissions scoped: `security-events: write`, `contents: read`, `actions: read`

**Change needed — update header comment:**

The header says "Runs GitHub CodeQL analysis on Python scripts used in the build toolchain" — vigOS template comment. This project has actual Python product code in `src/sync_issues_action/`. Update to reflect this project:

```yaml
# Before
# Runs GitHub CodeQL analysis on Python scripts used in the build toolchain.
# While these are build tools (not product code), static analysis provides
# defense-in-depth for scripts that handle git operations, file I/O, and
# subprocess execution.

# After
# Runs GitHub CodeQL analysis on the Python codebase.
```

**Validation:** CodeQL triggers on PRs only when `**.py` files change. The YAML-only change will not trigger it — accept structural review as sufficient; the workflow will fire on the next PR that touches Python code.

**Follow-up (out of scope):** Adding `javascript-typescript` to the CodeQL language matrix for the TypeScript source code.

#### 4. `release.yml` — Customize and review integration points

**Current state — 5 jobs:** `validate` → `finalize` → `test` → `release` → `rollback` (on failure)

**External dependencies (all verified accessible):**
- `vig-os/commit-action@b70c2d87...` (v0.1.3) — used in `finalize` job to commit CHANGELOG date via GitHub API. Passes config through `env:` vars (`GH_TOKEN`, `GITHUB_REPOSITORY`, `TARGET_BRANCH`, `COMMIT_MESSAGE`, `FILE_PATHS`), which is the correct interface for this action.
- `sync-issues.yml` workflow — triggered mid-release via `gh workflow run sync-issues.yml -f "target-branch=release/$VERSION"`. The workflow exists and its `workflow_dispatch` accepts a `target-branch` input. The wait loop (120s timeout, 10s interval) is reasonable.

**Project-specific prerequisites (verified):**
- `CHANGELOG.md` exists and uses the `## [X.Y.Z] - TBD` format
- `setup-env` composite action is used in the `test` job with `sync-dependencies: 'true'`
- Branch pattern `release/X.Y.Z` and base `main` match the project's git workflow

**Change needed — update header comment:**

```yaml
# Before
# Default template for Python projects using the vigOS devcontainer.
# After
# Customized for the sync-issues-action project.
```

**Key finding — GitHub App token TODO (line 22-24):**

The workflow has an existing TODO about replacing `GITHUB_TOKEN` with a GitHub App token for branch-protected repos. This becomes relevant when branch protection is configured (task 7). The `vig-os/commit-action` uses the GitHub API (not git push), so it MAY work with `GITHUB_TOKEN` even under branch protection — known risk to test during the dry-run.

**Dry-run validation:** Deferred — requires a `release/X.Y.Z` branch + approved PR to `main` + CI green. Since this is v0.1.0 with no release branch yet, defer to the first release cycle.

**No structural changes needed** to the workflow logic.

#### 5. `setup-env/action.yml` — Add npm dependency support (based on `post-create.sh`)

Comparing `.github/actions/setup-env/action.yml` against `.devcontainer/scripts/post-create.sh` reveals a gap: the devcontainer installs Node.js **and** npm dependencies, but setup-env only installs Node.js — it has no step to run `npm ci` to install dependencies from `package.json`.

This matters because the project is a TypeScript GitHub Action. `package.json` defines `npm test` (jest), `npm run build` (tsc), and `npm run package` (ncc). CI cannot run TypeScript tests or build the action without npm dependencies installed.

**Changes:**

1. Add `sync-npm-dependencies` input (default `'false'`):
```yaml
  sync-npm-dependencies:
    description: 'Run npm ci to install Node.js dependencies from package.json (requires Node.js)'
    required: false
    default: 'false'
```

2. Add `npm ci` step after the Node.js install step:
```yaml
    - name: Install npm dependencies
      if: inputs.sync-npm-dependencies == 'true'
      shell: bash
      run: npm ci
```

3. Auto-trigger Node.js install when `sync-npm-dependencies` is true (consistent with `install-devcontainer-cli` pattern):
```yaml
      if: inputs.install-node == 'true' || inputs.install-devcontainer-cli == 'true' || inputs.sync-npm-dependencies == 'true'
```

**Not carried over from `post-create.sh` (dev-only tools):**
- `act` (nektos) — local workflow runner, not needed inside GitHub Actions
- `@github/local-action` + `tsx` — action testing tool for local dev

**Follow-up suggestion:** Open a separate issue to change `--all-extras` to `--extra dev` in setup-env to avoid installing unnecessary science deps in CI.

#### 6. SHA pin audit

All actions are already SHA-pinned. Confirm no unpinned references exist by grep-searching all workflow files for `uses:` lines without `@` followed by a 40-char hex SHA.

#### 7. Branch protection

After CI is validated on the PR, configure branch protection rules via `gh api`:

- **`dev` branch**: Require `CI Summary` status check to pass before merge
- **`main` branch**: Require `CI Summary` status check to pass before merge

Requires repository admin permissions.

#### 8. Runner version

Staying on `ubuntu-22.04`. No changes to runner configuration.

---

### Validation Strategy

1. Push branch and open PR to `dev`
2. Verify CI jobs run: lint, test, security, dependency-review, summary
3. CodeQL: structural review sufficient (path filter `**.py` means YAML-only changes won't trigger it)
4. Scorecard: structural review sufficient (only runs on push to `main` / schedule)
5. Release dry-run: deferred to first release cycle (no release branch exists yet)
6. Branch protection: configure after CI Summary is confirmed green

### Files Modified

- `.github/workflows/scorecard.yml` — align codeql-action to v4
- `.github/workflows/ci.yml` — update safety version + API key
- `.github/workflows/codeql.yml` — update header comment to match project
- `.github/workflows/release.yml` — update header comment to match project
- `.github/actions/setup-env/action.yml` — add `sync-npm-dependencies` input + `npm ci` step

### Task List

- [ ] Create `feature/13-ci-cd-workflows` branch from `dev`
- [ ] Align `scorecard.yml` codeql-action/upload-sarif from v3 to v4 SHA
- [ ] Update `ci.yml` safety version to 3.7.0 and add SAFETY_API_KEY env
- [ ] Customize `codeql.yml` header comment for this project
- [ ] Customize `release.yml` header comment and review integration points
- [ ] Add `sync-npm-dependencies` input + `npm ci` step to setup-env action
- [ ] Audit all workflow files for unpinned action references
- [ ] Commit changes (Refs: #13) and push branch
- [ ] Open PR to `dev`, verify CI jobs run and pass
- [ ] Configure branch protection on `dev` and `main` to require CI Summary

