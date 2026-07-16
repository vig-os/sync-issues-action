---
type: issue
state: closed
created: 2026-03-12T08:07:16Z
updated: 2026-07-16T12:52:56Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/77
comments: 3
labels: chore, area:ci, priority:high, semver:minor
assignees: none
milestone: 0.3
projects: none
parent: 106
children: none
synced: 2026-07-16T18:08:27.855Z
---

# [Issue 77]: [[CHORE] Upgrade action to support Node.js 24 runtime](https://github.com/vig-os/sync-issues-action/issues/77)

### Chore Type

Dependency update

### Description

GitHub Actions is deprecating Node.js 20 runners. Starting June 2, 2026, actions will be forced to run with Node.js 24 by default.

This action is currently running on Node.js 20 and needs to be updated to support Node.js 24.

Reference: https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/

### Acceptance Criteria

- [ ] Update `action.yml` to use `node24` runtime
- [ ] Update dependencies for Node.js 24 compatibility
- [ ] Test action on Node.js 24
- [ ] Release new version with Node.js 24 support

### Implementation Notes

- Update `runs.using` in `action.yml` from `node20` to `node24`
- Run tests with Node.js 24 to identify breaking changes
- May be combined with or depend on #71 (@actions/core v3 ESM migration)

### Related Issues

Related to #71

### Priority

High

### Changelog Category

Changed
---

# [Comment #1]() by [c-vigo]()

_Posted on March 12, 2026 at 08:07 AM_

See also vig-os/commit-action#14 — same Node.js 24 upgrade needed there. Resolution should be similar.

---

# [Comment #2]() by [c-vigo]()

_Posted on March 16, 2026 at 08:38 AM_

Tracking downstream migration in devcontainer repo: https://github.com/vig-os/devcontainer/issues/321

---

# [Comment #3]() by [c-vigo]()

_Posted on July 16, 2026 at 12:52 PM_

Shipped in [v0.3.0](https://github.com/vig-os/sync-issues-action/releases/tag/v0.3.0) (published 2026-07-16): action runs on the node24 runtime (PR #109). All acceptance criteria met.

