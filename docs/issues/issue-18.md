---
type: issue
state: open
created: 2026-02-23T10:22:12Z
updated: 2026-02-23T10:22:12Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/18
comments: 0
labels: bug, area:ci
assignees: none
milestone: none
projects: none
relationship: none
synced: 2026-02-23T10:22:29.769Z
---

# [Issue 18]: [[BUG] Prepare-release workflow fails: App token missing PR permissions + CHANGELOG regex truncation](https://github.com/vig-os/sync-issues-action/issues/18)

## Description

The prepare-release workflow (`prepare-release.yml`) fails at the "Create draft PR to main" step with:

```
pull request create failed: GraphQL: Resource not accessible by integration (createPullRequest)
```

**Failed run:** https://github.com/vig-os/sync-issues-action/actions/runs/22301550388/job/64510387061

Investigation also revealed a secondary data-loss bug in `prepare_changelog.py` that silently truncates changelog entries containing inline `##` or `###` characters.

## Steps to Reproduce

1. Trigger the **Prepare Release** workflow (`workflow_dispatch`) with version `0.2.0`
2. Validate job passes, Prepare job begins
3. Branch creation and commit steps succeed (these only need `contents:write`)
4. "Create draft PR to main" step fails because the App token lacks `pull_requests:write`

For the CHANGELOG bug:

1. Have a CHANGELOG entry containing inline heading markers, e.g.:
   ```
   - Corrected heading hierarchy: promoted from `##` to `#`
   ```
2. Run `prepare_changelog.py prepare <version>`
3. The Fixed section is truncated at the first inline `##`

## Expected Behavior

1. The workflow should successfully create a draft PR from the release branch to main
2. `prepare_changelog.py` should preserve all CHANGELOG content, treating inline `##`/`###` (within backticks or mid-line) as literal text

## Actual Behavior

**Bug 1 — PR creation fails:**
The GitHub App (`APP_SYNC_ISSUES`) token does not have `pull_requests:write` permission. The `gh pr create` GraphQL call returns `Resource not accessible by integration`.

**Bug 2 — CHANGELOG truncation:**
`extract_unreleased_content()` in `prepare_changelog.py` (line 38) uses regex:
```python
pattern = rf"### {section}\s*\n((?:(?!###|##).)*)"
```
The `(?!###|##)` lookahead matches `##` at **any character position** (including inline within text), not just at line starts. This truncates the Fixed section from 6 entries down to 1 incomplete entry:
```
- Corrected heading hierarchy in `formatPRAsMarkdown`: promoted the Comments section header from `
```
The remaining 5 Fixed entries and the trailing text are silently dropped.

## Environment

- **Runner**: `ubuntu-22.04` (GitHub-hosted)
- **Workflow**: `.github/workflows/prepare-release.yml`
- **Script**: `.github/prepare_changelog.py`
- **gh CLI**: default version on `ubuntu-22.04`

## Possible Solution

**Bug 1** — Use `github.token` (which inherits the job-level `pull-requests: write` permission) for the PR creation step instead of the App token:
```yaml
# In "Create draft PR to main" step env:
GH_TOKEN: ${{ github.token }}
```
Alternative: add `Pull requests: Read & write` to the GitHub App's installation permissions.

**Bug 2** — Anchor the regex to line starts using `re.MULTILINE | re.DOTALL`:
```python
pattern = rf"^### {section}\s*\n(.*?)(?=^### |^## |\Z)"
match = re.search(pattern, unreleased_text, re.MULTILINE | re.DOTALL)
```
This only matches `###` or `##` at the start of a line (actual headings), ignoring inline occurrences.

## Cleanup Required

The failed run left a `release/0.2.0` branch (with a truncated CHANGELOG commit). It must be deleted before re-running:
```bash
gh api repos/vig-os/sync-issues-action/git/refs/heads/release/0.2.0 --method DELETE
```

## Changelog Category

Fixed
