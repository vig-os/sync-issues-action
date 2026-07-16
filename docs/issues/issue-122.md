---
type: issue
state: open
created: 2026-07-16T16:20:53Z
updated: 2026-07-16T16:20:53Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/122
comments: 0
labels: chore, security, priority:high, area:testing, effort:small, semver:patch
assignees: none
milestone: 0.4
projects: none
parent: none
children: none
synced: 2026-07-16T18:08:24.910Z
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
