---
type: issue
state: closed
created: 2026-07-16T10:13:41Z
updated: 2026-07-16T12:53:00Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/113
comments: 1
labels: chore, area:ci, priority:blocking, effort:small
assignees: none
milestone: 0.3
projects: none
parent: none
children: none
synced: 2026-07-16T18:08:25.906Z
---

# [Issue 113]: [[CHORE] First release train blocked: commit-lint re-validates pre-devkit history](https://github.com/vig-os/sync-issues-action/issues/113)

## Description

The Commit Messages gate on release PR #110 validates `merge-base(main, release/0.3.0)..HEAD` — the entire span since v0.2.2 (Feb). One pre-devkit commit, `9574ee12` (PR #97 branch commit, merged 2026-06-10 before the devkit gate existed), lacks the mandatory `Refs:` line. History on `dev` is immutable, so the commit cannot be fixed.

## Fix (approved 2026-07-16)

Hand-patch the `Commit Messages` step in `ci.yml` (devkit-managed; codeql.yml hand-patch precedent) to advance the validation base past `9574ee12ed3c7b80f5e287bc1a274db2e97aa2d2` when the computed merge-base is an ancestor of it — tightens the release-PR range only, never widens dev-PR ranges. Verified locally: the validator passes on the release span with the advanced base, and dev-PR merge-bases (post-June) are unaffected.

Self-healing: once 0.3.0 reaches `main`, future merge-bases move past the commit; the patch disappears on the next devkit `ci.yml` regeneration.

## Upstream

Design gap filed against vig-os/devkit (link below): the first release train over pre-gate history re-lints commits the gate never covered; devkit could skip commits already reachable from the trunk branch (`dev`).

Refs: #106, #110
---

# [Comment #1]() by [c-vigo]()

_Posted on July 16, 2026 at 12:52 PM_

Waiver shipped with v0.3.0 (PR #114) and served its purpose — release PR #110 commit-lint went green with the base advanced past the grandfathered commit. Now that 0.3.0 is on main, merge-bases have moved past it: the patch is inert and can be dropped whenever the next devkit upgrade regenerates ci.yml.

