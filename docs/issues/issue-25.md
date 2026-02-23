---
type: issue
state: closed
created: 2026-02-23T15:01:56Z
updated: 2026-02-23T16:12:33Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/25
comments: 0
labels: enhancement
assignees: none
milestone: none
projects: none
relationship: none
synced: 2026-02-23T16:13:02.624Z
---

# [Issue 25]: [[ENHANCEMENT] Return partial results from fetchIssueRelationships on mid-batch failure](https://github.com/vig-os/sync-issues-action/issues/25)

## Context

Copilot review on PR #22 ([comment](https://github.com/vig-os/sync-issues-action/pull/22#discussion_r2841261388)) identified that `fetchIssueRelationships` discards all successfully fetched relationships when a mid-batch error occurs.

The `try/catch` wraps the entire batch loop, so if batch N fails, results from batches 1..N-1 are thrown away and an empty `Map` is returned.

## Implementation Plan

- Move `try/catch` from around the entire `for` loop to **inside** the loop body in `src/index.ts` (`fetchIssueRelationships`, lines ~415-460)
- On `"doesn't exist on type"` error: `break` out of the loop (the sub-issues API is unavailable — no point continuing)
- On other errors (transient/network): `core.warning` per-batch, then `continue` to the next batch
- Return the accumulated `relationships` map (partial results) instead of `new Map()`
- Update tests in `src/__tests__/unit/index.test.ts`: add a multi-batch test where batch 1 succeeds and batch 2 fails, and assert that partial results from batch 1 are returned
- Rebuild dist via `npm run package`
