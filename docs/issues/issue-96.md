---
type: issue
state: closed
created: 2026-06-10T09:07:32Z
updated: 2026-07-16T08:32:32Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/96
comments: 1
labels: bug, area:ci, priority:high, semver:patch
assignees: none
milestone: 0.3
projects: none
parent: 106
children: none
synced: 2026-07-16T12:36:45.474Z
---

# [Issue 96]: [[BUG] Scheduled sync workflow crashes on transient GitHub 5xx (Unicorn) during PR sync](https://github.com/vig-os/sync-issues-action/issues/96)

## Description

The scheduled **Sync Issues and PRs** workflow fails daily when a single GitHub API call returns a transient 5xx server error (GitHub's "Unicorn!" HTML page). The raw HTML is printed as the step error and the entire sync aborts, even though most issues and PRs were already synced successfully.

## Steps to Reproduce

1. Run the scheduled `sync-issues.yml` workflow (or wait for the daily cron at 02:00 UTC).
2. Let the action sync issues and most PRs.
3. Observe failure when the next unguarded API call hits a transient GitHub 5xx.

## Expected Behavior

- Transient 5xx / rate-limit errors are retried with backoff.
- A persistently failing issue/PR is skipped with a warning; the run completes and commits successfully synced files.

## Actual Behavior

- The action crashes mid-PR-sync with `##[error]<!DOCTYPE html>... Unicorn!`.
- The commit step is skipped; sync state may be partially updated.
- Workflow has failed on every scheduled run since at least 2026-05-27.

## Environment

- **OS**: Ubuntu 22.04 (GitHub-hosted runner)
- **Workflow**: `.github/workflows/sync-issues.yml`
- **Action ref**: `vig-os/sync-issues-action@bad447d` (v0.2.2)
- **Example failing run**: https://github.com/vig-os/sync-issues-action/actions/runs/27257549903

### Relevant log excerpt

```
Synced PR #42 with 1 commit(s) with 1 comment(s) to docs/pull-requests/pr-42.md
##[error]<!DOCTYPE html>
...
<title>Unicorn! &middot; GitHub</title>
```

Fails ~10s after PR #42; ~40 PRs synced before the crash.

## Root cause

In `src/index.ts`:
- Octokit client is created without retry/throttling (`github.getOctokit(tokenToUse)`).
- Per-item calls `pulls.list`, `pulls.get`, `issues.listForRepo`, and `issues.get` are not wrapped in try/catch, so one transient failure aborts the whole run.

## Possible Solution

- Add `withRetry` helper (exponential backoff on 5xx / secondary rate limit).
- Wrap per-item sync calls to skip+warn on persistent failure.
- Route existing fetch helpers through retry as well.
- Ship via new release and bump pinned SHA in `sync-issues.yml`.

## Changelog Category

Fixed
---

# [Comment #1]() by [c-vigo]()

_Posted on July 16, 2026 at 08:32 AM_

Fixed by PR #97 (merged 2026-06-10): Octokit now retries transient 5xx / secondary-rate-limit errors with backoff, and persistently failing items are skipped with a warning so the run completes and commits. The remaining tail — shipping in a release and bumping the pinned SHA in `sync-issues.yml` — is exactly the release step tracked by #106 (first devkit release train, v0.3), so closing this as completed.

