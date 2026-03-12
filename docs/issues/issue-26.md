---
type: issue
state: closed
created: 2026-02-23T15:02:01Z
updated: 2026-02-23T16:10:37Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/26
comments: 0
labels: bug
assignees: none
milestone: none
projects: none
relationship: none
synced: 2026-02-23T16:10:59.146Z
---

# [Issue 26]: [[BUG] syncSubIssues default parameter does not match action.yml](https://github.com/vig-os/sync-issues-action/issues/26)

## Context

Copilot review on PR #22 ([comment](https://github.com/vig-os/sync-issues-action/pull/22#discussion_r2841261423)) identified a mismatch between the `syncSubIssues` default in the function signature and the action input default.

- `action.yml` sets `sync-sub-issues` default to `'true'` (line 47)
- The `run()` function correctly parses it as `true` (line 131)
- But `syncIssuesToMarkdown` signature defaults `syncSubIssues` to `false` (line 215)

The caller always passes the value explicitly, so there is no runtime impact today. However, the function signature should be consistent with the action definition for defensive correctness.

## Implementation Plan

- In `src/index.ts` line 215: change `syncSubIssues = false` to `syncSubIssues = true`
- Rebuild dist via `npm run package`
- No test changes needed (caller always passes explicitly; this is a consistency fix)
