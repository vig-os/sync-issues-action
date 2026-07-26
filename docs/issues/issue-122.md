---
type: issue
state: closed
created: 2026-07-16T16:20:53Z
updated: 2026-07-25T12:37:40Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/122
comments: 1
labels: chore, security, priority:high, area:testing, effort:small, semver:patch
assignees: none
milestone: 0.4
projects: none
parent: none
children: none
synced: 2026-07-26T05:33:33.111Z
---

# [Issue 122]: [[CHORE] Pin @github/local-action version in local integration test script](https://github.com/vig-os/sync-issues-action/issues/122)

### Chore Type

Dependency update

### Description

OpenSSF Scorecard (code-scanning alert #7, `PinnedDependenciesID`, medium) flags `src/__tests__/integration/test-local.sh` line 15: `npm install -g @github/local-action` installs an unpinned package. Although the script is dev-only and never runs in CI or release, it is the only Scorecard finding anchored to repo content.

### Proposed change

Pin the install to a fixed version (currently latest: `@github/local-action@7.0.1`) so the local integration helper is reproducible and the Scorecard alert clears.

### Acceptance criteria

- `test-local.sh` installs a pinned `@github/local-action` version.
- Scorecard `PinnedDependenciesID` alert #7 resolves on the next scan of the default branch.
---

# [Comment #1]() by [c-vigo]()

_Posted on July 25, 2026 at 12:37 PM_

Already resolved on `main`.

- `src/__tests__/integration/test-local.sh:15` pins the install: `npm install -g @github/local-action@7.0.1` (commit 872a5ad, "test: pin @github/local-action install to a fixed version").
- Scorecard code-scanning alert #7 (`PinnedDependenciesID`) is now `state: fixed` (fixed_at 2026-07-16T18:38:22Z).

Both acceptance criteria met; closing as completed.

