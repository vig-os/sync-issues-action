---
type: issue
state: closed
created: 2026-03-02T20:24:08Z
updated: 2026-03-02T21:07:20Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/72
comments: 0
labels: chore, dependencies
assignees: c-vigo
milestone: none
projects: none
parent: none
children: none
synced: 2026-07-16T12:36:47.065Z
---

# [Issue 72]: [[CHORE] Upgrade ESLint toolchain to v10 and migrate to flat config](https://github.com/vig-os/sync-issues-action/issues/72)

## Chore Type
Dependency update

## Description
Upgrade `eslint` (8 -> 10), `@typescript-eslint/eslint-plugin` (6 -> 8), and `@typescript-eslint/parser` (6 -> 8) together. Migrate `.eslintrc.json` to `eslint.config.mjs` (required by ESLint 10). This supersedes the closed Dependabot PRs #63 and #67.

## Acceptance Criteria
- [ ] `npm ci` resolves without errors
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `npm test` passes
- [ ] `.eslintrc.json` is deleted and `eslint.config.mjs` exists
- [ ] PRs #63 and #67 remain closed as superseded

## Implementation Notes
- Update the lint stack as a coordinated set to avoid peer dependency conflicts.
- Keep behavior equivalent to current lint setup while migrating to flat config.

## Related Issues
Supersedes: #63, #67

## Priority
Medium

## Changelog Category
Changed

## Additional Context
ESLint 10 + typescript-eslint v8 compatibility requires synchronized dependency upgrades and config migration.
