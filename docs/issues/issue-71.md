---
type: issue
state: open
created: 2026-03-02T20:16:04Z
updated: 2026-07-16T08:31:42Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/71
comments: 0
labels: chore, area:ci, dependencies, priority:high, effort:medium, semver:patch
assignees: none
milestone: 0.4
projects: none
parent: none
children: none
synced: 2026-07-16T12:36:47.564Z
---

# [Issue 71]: [[CHORE] Plan migration to @actions/core v3 (ESM-only)](https://github.com/vig-os/sync-issues-action/issues/71)

## Chore Type
CI / Build change

## Description
Create and approve a migration plan to safely adopt `@actions/core@3` (ESM-only) in this action repository.  
PR #62 shows the direct bump currently breaks packaging (`ncc`/CJS flow), so we need a deliberate migration path before enabling Dependabot major updates.

## Acceptance Criteria
- [ ] Document current blocker from PR #62 (`@actions/core@3` fails in current CommonJS packaging flow)
- [ ] Decide target runtime/module strategy (ESM build pipeline vs alternative packaging approach)
- [ ] Define required code/build/test changes and rollout sequence
- [ ] Define rollback/safety strategy if migration causes runtime regressions
- [ ] Update dependency policy to prevent accidental major bump merges before migration completion

## Implementation Notes
- Current action runs on `node20` with `dist/index.js`.
- Current source and bundled output are CommonJS-oriented.
- PR #62 should remain blocked until this migration plan (and then implementation) is complete.
- Include explicit validation steps for:
  - `npm run build`
  - `npm run package`
  - unit tests/integration tests
  - smoke test in a real workflow run

## Related Issues
- Related to #62

## Priority
High

## Changelog Category
No changelog needed

## Additional Context
Dependabot PR #62 (`build(deps): bump @actions/core from 1.11.1 to 3.0.0`) is currently incompatible with the repo’s packaging setup and should not be merged without this plan.
