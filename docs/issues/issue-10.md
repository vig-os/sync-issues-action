---
type: issue
state: open
created: 2026-02-20T10:58:09Z
updated: 2026-02-20T10:58:09Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/10
comments: 0
labels: none
assignees: none
milestone: none
projects: none
relationship: none
synced: 2026-02-20T12:25:11.501Z
---

# [Issue 10]: [[BUG] --force-update does not re-sync issues (only PRs)](https://github.com/vig-os/sync-issues-action/issues/10)

## Description

When triggering a workflow with `force-update: true`, only PRs are re-synced. Issues are skipped even though `updated-since` is set to `1970-01-01T00:00:00Z` (epoch), which should cause all items to be fetched.

The calling workflow correctly passes the epoch timestamp via:

```yaml
updated-since: ${{ (github.event.inputs.force-update == 'true' && '1970-01-01T00:00:00Z') || '' }}
```

## Steps to Reproduce

1. Go to Actions > "Sync Issues and PRs" in a repo using this action
2. Trigger a `workflow_dispatch` run with `force-update: true`
3. Observe the output: PR markdown files are updated, but issue markdown files are not

## Expected Behavior

All issues and PRs should be re-synced when `updated-since` is set to epoch, regardless of the last sync timestamp.

## Actual Behavior

Only PRs are re-synced. Issues that haven't been modified since the last sync are skipped.

## Environment

- GitHub Actions runner: `ubuntu-22.04`
- sync-issues-action: `v0.1.1` (`b4cdf37`)

## Additional Context

The `updated-since` input is shared for both issues and PRs in the action. The action may be applying additional filtering to issues that ignores this parameter.

## Possible Solution

Investigate why the `updated-since` parameter is not honored for issue fetching. The issue-fetching code path likely has a separate filter or early-exit condition that doesn't respect this override.

## Changelog Category

Fixed
