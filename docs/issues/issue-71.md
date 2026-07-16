---
type: issue
state: closed
created: 2026-03-02T20:16:04Z
updated: 2026-07-16T14:40:13Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/71
comments: 1
labels: chore, area:ci, dependencies, priority:high, effort:medium, semver:patch
assignees: none
milestone: 0.4
projects: none
parent: none
children: none
synced: 2026-07-16T18:08:28.225Z
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
---

# [Comment #1]() by [c-vigo]()

_Posted on July 16, 2026 at 02:40 PM_

Overtaken by events — the migration this issue planned for was implemented in PR #100 (2026-06-11, under #6) and shipped in [v0.3.0](https://github.com/vig-os/sync-issues-action/releases/tag/v0.3.0).

Walking the acceptance criteria against the current state of `dev`:

- **PR #62 blocker documented/resolved**: #62 is closed; the direct bump no longer breaks packaging.
- **Module strategy decided**: keep CJS action entry (`dist/index.js`, `node24` runtime) with `tsconfig` at `module: ES2022` / `moduleResolution: bundler`; `ncc` bundles the ESM-only `@actions/core@3` / `@actions/github@9` into the committed CJS bundle. No source-tree ESM flip was needed.
- **Code/build/test changes**: landed in #100 (`@actions/core@^3.0.1`, `@actions/github@^9.1.1`).
- **Validation**: 115 jest tests, Dist Check, the 8-scenario integration matrix, the v0.3.0-rc1 published-tag smoke test, and live scheduled/dispatched sync runs on node24 — all green.
- **Dependency policy**: moot — the major is adopted; Dependabot was retired for Renovate (#107), and future majors gate through CI like any other PR.

Refs: #71

