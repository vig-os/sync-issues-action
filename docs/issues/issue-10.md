---
type: issue
state: closed
created: 2026-02-20T10:58:09Z
updated: 2026-02-20T14:13:37Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/10
comments: 1
labels: none
assignees: none
milestone: none
projects: none
relationship: none
synced: 2026-02-20T14:13:51.874Z
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
---

# [Comment #1]() by [c-vigo]()

_Posted on February 20, 2026 at 12:43 PM_

## Implementation Plan

Issue: #10
Branch: bugfix/10-force-update-issues

### Root Cause

Both `syncIssuesToMarkdown` (line 250) and `syncPRsToMarkdown` (line 331) in `src/index.ts` call `hasContentChanged` before writing. This function strips frontmatter (including the `synced:` timestamp) via `normalizeContent` and compares the body only. When nothing has changed on GitHub, the body is identical and the write is skipped -- even during a force-update.

The user observes PRs being re-written because closed PRs gain a new commits section (or other metadata shifts), while issues with no GitHub-side changes remain byte-identical and are skipped.

The action currently has no way to know the caller intends a force-update; `updated-since` set to epoch controls *which items are fetched* from the API, but not whether `hasContentChanged` is bypassed.

### Fix

Add a `force-update` boolean input to the action. When active, skip the `hasContentChanged` gate and always write (which updates the `synced:` frontmatter timestamp, producing a real git diff).

### Tasks

- [x] Task 1: Write failing test -- when `force-update` is `'true'` and an issue file already exists with identical body content, the action should still re-write the file — `src/__tests__/unit/index.test.ts` — verify: `npx jest -t "should re-write issue files"`
- [x] Task 2: Write failing test -- same scenario for PRs — `src/__tests__/unit/index.test.ts` — verify: `npx jest -t "should re-write PR files"`
- [x] Task 3: Add `force-update` input (boolean string, default `'false'`) — `action.yml` — verify: input present in file
- [x] Task 4: Read `force-update` input, thread `forceUpdate` flag into `syncIssuesToMarkdown` and `syncPRsToMarkdown`, bypass `hasContentChanged` when true — `src/index.ts` — verify: `npx jest`
- [x] Task 5: Pass `force-update` workflow dispatch input to the action — `.github/workflows/sync-issues.yml` — verify: input present in `with:` block
- [x] Task 6: Run full test suite — verify: `npx jest` (89 passed, 0 failed)
