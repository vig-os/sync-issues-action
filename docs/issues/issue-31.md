---
type: issue
state: open
created: 2026-02-25T11:47:08Z
updated: 2026-02-25T11:47:08Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/31
comments: 0
labels: bug
assignees: c-vigo
milestone: none
projects: none
relationship: none
synced: 2026-02-25T11:47:23.212Z
---

# [Issue 31]: [[BUG] Release workflow validate-only fails on reusable workflow permissions](https://github.com/vig-os/sync-issues-action/issues/31)

### Description
Running the release workflow in validate-only (`dry-run`) mode fails workflow validation when `release.yml` calls the reusable `integration-test.yml` workflow.

The nested jobs in the called workflow request permissions that are not allowed by the caller:
- `sync-issues-only` requests `issues: read`
- `sync-prs-only` requests `pull-requests: read`

Because `release.yml` sets only `contents: read` at workflow level, those scopes default to `none` for the called workflow.

### Steps to Reproduce
1. Open GitHub Actions and run `Release` workflow manually.
2. Set:
   - `version`: `0.2.0` (or a valid release version branch)
   - `dry-run`: `true`
3. Start the workflow.
4. Observe validation failure before execution.

### Expected Behavior
The release workflow validates successfully in dry-run mode and proceeds to run jobs without permission-schema errors.

### Actual Behavior
Workflow is rejected as invalid with errors similar to:
- `The nested job 'sync-issues-only' is requesting 'issues: read', but is only allowed 'issues: none'.`
- `The nested job 'sync-prs-only' is requesting 'pull-requests: read', but is only allowed 'pull-requests: none'.`

### Environment
- **OS**: Ubuntu (GitHub-hosted runner context)
- **Container Runtime**: N/A
- **Image Version/Tag**: `ubuntu-22.04`
- **Architecture**: AMD64

### Additional Context
Proposed fix is to set job-level permissions on `integration-test` call in `.github/workflows/release.yml`:
- `contents: read`
- `issues: read`
- `pull-requests: read`

### Possible Solution
Add explicit `permissions` to the `integration-test` caller job in `release.yml` so the reusable workflow can inherit only the required read scopes.

### Changelog Category
Fixed
