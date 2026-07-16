---
type: issue
state: closed
created: 2026-02-27T09:21:05Z
updated: 2026-06-10T11:16:53Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/56
comments: 1
labels: chore
assignees: c-vigo
milestone: none
projects: none
parent: none
children: none
synced: 2026-07-16T12:36:48.696Z
---

# [Issue 56]: [[CHORE] Improve tests by syncing only a subset of PRs and issues](https://github.com/vig-os/sync-issues-action/issues/56)

**Chore Type:** CI / Build change

**Description:**
Tests (especially the integration workflow in `.github/workflows/integration-test.yml`) run the action against the full set of issues and PRs in the repo. As the number of issues and PRs grows, test duration increases and will only get worse. After #55 (option to sync only specific issues/PRs by number or ranges) is implemented, we should use that feature in tests so that only a small, fixed subset of PRs and issues are synced, keeping test runtime bounded and fast.

**Acceptance Criteria:**
- [ ] After #55 is merged, integration test (and any other workflows that run the action for testing) are updated to use the new filter input(s) so only a defined subset of issues and PRs are synced.
- [ ] The chosen subset is stable (e.g. low issue/PR numbers that exist in the repo) and still exercises sync logic meaningfully.
- [ ] Test duration is reduced or at least no longer grows with total repo issue/PR count.
- [ ] TDD compliance (see .cursor/rules/tdd.mdc)

**Implementation Notes:**
- Depends on #55. Once `issues-filter` / `prs-filter` (or equivalent) inputs exist, configure each integration-test job that runs the action to pass a small set of issue and PR numbers (e.g. 1–2 issues, 1–2 PRs) so the sync step is fast.
- The subset should be documented (e.g. in the workflow or a comment) so it can be updated if those issues/PRs are ever removed.
- Refs: `.github/workflows/integration-test.yml`, `.github/workflows/ci.yml` (calls integration-test).

**Related Issues:**
Depends on #55. Use the feature from #55 to limit synced items in tests.

**Priority:** Medium

**Changelog Category:** No changelog needed
---

# [Comment #1]() by [c-vigo]()

_Posted on June 10, 2026 at 11:16 AM_

Closed via #99 — integration tests now use issues-filter/prs-filter to sync a fixed subset.

