---
type: issue
state: open
created: 2026-02-22T11:01:08Z
updated: 2026-02-22T11:01:08Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/15
comments: 0
labels: none
assignees: none
milestone: none
projects: none
relationship: none
synced: 2026-02-22T11:01:26.230Z
---

# [Issue 15]: [Suppress noisy parentIssue GraphQL warnings when sub-issues API is unavailable](https://github.com/vig-os/sync-issues-action/issues/15)

## Problem

The integration test CI logs show repeated warnings:

```
##[warning]Failed to fetch sub-issue relationships: Request failed due to following response errors:
 - Field 'parentIssue' doesn't exist on type 'Issue'
```

This fires for every batch of issues fetched. The `parentIssue` and `subIssues` fields are part of GitHub's **Sub-issues** feature, which is only available on certain plans/repos. When the API doesn't support these fields, the GraphQL query fails and emits a noisy warning.

**Current behavior:** The error is caught and a warning is logged per batch — no functional impact, sync completes successfully.

**Desired behavior:** Detect that the sub-issues API is unavailable and skip relationship fetches for the rest of the run, rather than warning on every batch.

## Relevant code

`src/index.ts` around line 416 builds the GraphQL query:

```typescript
`issue_${num}: issue(number: ${num}) {
  parentIssue { number }
  subIssues(first: 100) { nodes { number } }
}`
```

## Suggested approaches

1. **Attempt once, then skip** — try the relationship query on the first batch; if it fails with a schema error, set a flag and skip all subsequent batches.
2. **Make it opt-in** — add an action input (e.g. `sync-sub-issues: true`) so the query is only made when explicitly requested.
3. **Combine both** — opt-in input + graceful fallback on schema error.

## Context

Observed in the `integration-test.yml` workflow on PR #14.
