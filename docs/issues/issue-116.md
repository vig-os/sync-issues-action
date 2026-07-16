---
type: issue
state: closed
created: 2026-07-16T11:58:03Z
updated: 2026-07-16T12:53:02Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/116
comments: 1
labels: chore, area:ci, priority:blocking, effort:small
assignees: none
milestone: 0.3
projects: none
parent: none
children: none
synced: 2026-07-16T18:08:25.238Z
---

# [Issue 116]: [[CHORE] Release train finalize times out: sync-issues dispatch runs the old default-branch workflow](https://github.com/vig-os/sync-issues-action/issues/116)

## Description

The first final `release.yml` run for 0.3.0 failed at `Release Core / Finalize Release Core`: "Timed out waiting for sync-issues workflow completion" (run 29494385057), triggering the automatic rollback (#115).

Root cause chain (evidence in run/job logs):

1. `release-core.yml` dispatches `gh workflow run sync-issues.yml` **without `--ref`**, so GitHub runs the workflow definition from the **default branch (`main`)** — still the pre-devkit workflow until this very release merges. The devkit sync workflow on `release/0.3.0` (with the incremental-cutoff self-heal from devkit 1.3.0, #108) never ran.
2. The old workflow's state cache is permanently stale: created 2026-02-26, and its cache-delete step fails (`Resource not accessible by integration`) so every save collides (`Unable to reserve cache`). Every run re-syncs ~5 months (~2m18s).
3. `release-core.yml` waits a hardcoded **120 s** and polls `gh run list --limit 1` with no branch filter (races scheduled runs). 138 s > 120 s → deterministic timeout.

## Fix (approved 2026-07-16)

Hand-patch `release-core.yml` on `release/0.3.0` (managed file; precedent #113 / codeql.yml):

- dispatch: add `--ref "release/$VERSION"` so the devkit sync workflow runs on the release branch
- wait: filter polling with `--branch "release/$VERSION"`, raise `TIMEOUT` 120 → 600

Self-corrects for future releases once `main` carries the devkit scaffold; patch is dropped on the next devkit regeneration. Upstream report to vig-os/devkit to follow.

Refs: #106, #115
---

# [Comment #1]() by [c-vigo]()

_Posted on July 16, 2026 at 12:53 PM_

Fix shipped via PR #117 and validated live on the final-release retry (run 29498572451): the devkit sync workflow ran on release/0.3.0 (3m30s — the 600s timeout mattered; even the new workflow's first run exceeds the old 120s ceiling) and finalize completed. v0.3.0 published.

