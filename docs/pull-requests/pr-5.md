---
type: pull_request
state: closed (merged)
branch: bugfix/4-header-levels-comments → dev
created: 2026-02-18T16:39:11Z
updated: 2026-02-18T16:42:11Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/pull/5
comments: 0
labels: none
assignees: none
milestone: none
projects: none
relationship: none
merged: 2026-02-18T16:42:05Z
synced: 2026-02-20T12:03:18.602Z
---

# [PR 5](https://github.com/vig-os/sync-issues-action/pull/5) fix: shift PR comment headers to respect document hierarchy

## Description

Fixes a header hierarchy bug in `formatPRAsMarkdown` where comment bodies were inserted verbatim, causing headers like `## Idea` inside a `### [Comment #N]` block to break the heading hierarchy.

The fix promotes the section/comment chrome by one level (`##` → `#`, `###` → `##`) and pipes each comment body through a new `shiftHeadersToMinLevel` helper that ensures the shallowest header in a comment body starts at level 3.

## Related Issue(s)

Closes #4

## Type of Change

- [x] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [x] Test updates

## Changes Made

- Promoted `## Comments (N)` section header to `# Comments (N)` to sit at level 1
- Promoted individual `### [Comment #N]` entry headers to `## [Comment #N]` (level 2)
- Added `shiftHeadersToMinLevel` helper that re-levels headers within each comment body so the shallowest header becomes `###` (level 3), preventing any collision with the outer document structure
- Added unit tests covering the new header-level assertions and the `shiftHeadersToMinLevel` function
- Fixed `test-local.sh`: corrected default `GITHUB_REPOSITORY` from non-existent `vig-os/actions` to `vig-os/sync-issues-action` and removed a broken fallback command
- Rebuilt and packaged the compiled JS artifacts

## Testing

- [x] Tests pass locally (`make test`)
- [ ] Image tests pass (`make test-image`)
- [ ] Integration tests pass (`make test-integration`)
- [ ] Registry tests pass (`make test-registry`) (if applicable)
- [x] Manual testing performed (describe below)

### Manual Testing Details

Ran `test-local.sh` against the live `vig-os/sync-issues-action` repository after fixing the default repo name. Verified PR comment output rendered with a correct heading hierarchy (level 1 → level 2 → level 3+).

## Checklist

- [x] My code follows the project's style guidelines
- [x] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [x] I have updated the documentation accordingly (README.md, CONTRIBUTE.md, etc.)
- [ ] I have updated the CHANGELOG.md in the `[Unreleased]` section
- [x] My changes generate no new warnings or errors
- [x] I have added tests that prove my fix is effective or that my feature works
- [x] New and existing unit tests pass locally with my changes
- [x] Any dependent changes have been merged and published

## Additional Notes

The `shiftHeadersToMinLevel` function is exported so it can be unit-tested independently. It uses a two-pass approach: first scan to find the minimum heading level present in the text, then shift all headings so that minimum maps to the desired target level.


---
---

## Commits

### Commit 1: [13eb3d9](https://github.com/vig-os/sync-issues-action/commit/13eb3d909b3af3e9f55f57a9a08d0807cff77587) by [c-vigo](https://github.com/c-vigo) on February 18, 2026 at 04:26 PM
fix: shift PR comment headers to respect document hierarchy, 278 files modified (src/__tests__/unit/index.test.ts, src/index.ts)

### Commit 2: [21607f8](https://github.com/vig-os/sync-issues-action/commit/21607f83f1f6f5e262922aeba059796bf92e43e1) by [c-vigo](https://github.com/c-vigo) on February 18, 2026 at 04:35 PM
fix: correct repo name and broken fallback in test-local.sh, 12 files modified (src/__tests__/integration/test-local.sh)

### Commit 3: [06672f3](https://github.com/vig-os/sync-issues-action/commit/06672f388a2b7a6a58a952295572cdc6f7cc58f4) by [c-vigo](https://github.com/c-vigo) on February 18, 2026 at 04:36 PM
chore: package JS, 278 files modified

### Commit 4: [57e5d84](https://github.com/vig-os/sync-issues-action/commit/57e5d84f76a48b89080cc8a700e72a16d4f3608d) by [c-vigo](https://github.com/c-vigo) on February 18, 2026 at 04:41 PM
docs: update CHANGELOG, 16 files modified (CHANGELOG.md)
