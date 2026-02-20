---
type: pull_request
state: closed (merged)
branch: dev → main
created: 2025-12-19T08:04:38Z
updated: 2025-12-19T08:05:06Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/pull/3
comments: 0
labels: none
assignees: c-vigo
milestone: none
projects: none
relationship: none
merged: 2025-12-19T08:05:05Z
synced: 2025-12-20T01:16:30.435Z
---

# [PR 3](https://github.com/vig-os/sync-issues-action/pull/3) Release v0.1.1: TypeScript Definitions and Build Artifacts

# Release v0.1.1: TypeScript Definitions and Build Artifacts

## Description

This PR prepares the release of version 0.1.1, which includes critical bug fixes for missing build artifacts and TypeScript definitions. The release ensures that the GitHub Action can be properly executed and provides better developer experience with TypeScript support.

## Related Issue(s)

This release addresses the issue where `dist/index.js` was missing from published releases, preventing GitHub Actions from correctly finding and executing the compiled action code.

## Type of Change

- [x] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Test updates

## Changes Made

### Bug Fix: TypeScript Definitions and Build Artifacts (9684282)
- **Fixed missing `dist/index.js` file**: Updated `.gitignore` to allow dist files to be committed, ensuring GitHub Actions can find and execute the compiled action code
- **Added TypeScript definitions**: Introduced comprehensive TypeScript definitions (`.d.ts` files) for:
  - Comments
  - Issues
  - Pull requests
  - Commit changes
- **Enhanced debugging support**: Added source maps (`.js.map` and `.d.ts.map`) for better debugging experience
- **License compliance**: Included `licenses.txt` file in the distribution folder with all dependency licenses

### Dependency Update (d3e3db3)
- **Updated commit-action**: Bumped `vig-os/commit-action` from `v0.1.0` to `v0.1.1` in the sync-issues workflow

### Release Preparation (ccd5dfd)
- **Version bump**: Updated version from `0.1.0` to `0.1.1` in `package.json`
- **Changelog update**: Added comprehensive release notes for both v0.1.1 and v0.1.0 in `CHANGELOG.md`
- **Version references**: Updated all version references to `v0.1.1` across:
  - `README.md`
  - `example-workflow.yml`
  - `.github/workflows/sync-issues.yml`

## Testing

- [x] Tests pass locally (`npm test`)
- [x] Build artifacts generated successfully (`npm run build && npm run package`)
- [x] TypeScript definitions verified
- [x] Source maps generated correctly
- [x] All version references updated consistently

### Manual Testing Details

- Verified that `dist/index.js` is present and executable
- Confirmed TypeScript definitions are properly generated
- Validated that source maps are correctly linked
- Checked that all version references point to `v0.1.1`

## Checklist

- [x] My code follows the project's style guidelines
- [x] I have performed a self-review of my code
- [x] I have commented my code, particularly in hard-to-understand areas
- [x] I have updated the documentation accordingly (README.md, CHANGELOG.md)
- [x] I have updated the CHANGELOG.md with release notes
- [x] My changes generate no new warnings or errors
- [x] Build artifacts are properly included in the repository
- [x] All version references are consistent

## Summary

This release fixes a critical issue where the GitHub Action could not execute due to missing build artifacts. The addition of TypeScript definitions improves the developer experience for consumers of this action, and the inclusion of source maps facilitates debugging. All changes are backward compatible and do not affect the action's functionality.

## Files Changed

- **33 files changed**: 42,580 insertions(+), 16 deletions(-)
- Key changes:
  - Build artifacts (`dist/` directory) - **NEW**
  - TypeScript definitions (`dist/*.d.ts` files) - **NEW**
  - Source maps (`dist/*.map` files) - **NEW**
  - Version updates across documentation and workflows
  - `.gitignore` updated to allow dist files

## Impact

- **Critical**: Fixes missing `dist/index.js` that prevented action execution
- **Enhancement**: Adds TypeScript support for better IDE integration
- **Enhancement**: Improves debugging with source maps
- **Maintenance**: Updates dependency to latest version

---

**Ready to merge into `main` branch.**



---
---

## Commits

### Commit 1: [9684282](https://github.com/vig-os/sync-issues-action/commit/9684282f6542c7617251b6b6d45dd1ce8b063302) by [c-vigo](https://github.com/c-vigo) on December 19, 2025 at 07:42 AM
bug: add TypeScript definitions and update build artifacts, 42552 files modified

### Commit 2: [d3e3db3](https://github.com/vig-os/sync-issues-action/commit/d3e3db3caa51a9cd354f388b938bf767191349e8) by [c-vigo](https://github.com/c-vigo) on December 19, 2025 at 07:59 AM
chore: bump version of vig-os/commit-action from v0.1.0 to v0.1.1, 2 files modified (.github/workflows/sync-issues.yml)

### Commit 3: [ccd5dfd](https://github.com/vig-os/sync-issues-action/commit/ccd5dfd0f1faa454f9a02582031ccc51a008d460) by [c-vigo](https://github.com/c-vigo) on December 19, 2025 at 08:02 AM
chore: prepare release v0.1.1, 42 files modified (.github/workflows/sync-issues.yml, CHANGELOG.md, README.md, example-workflow.yml, package-lock.json, package.json)
