---
type: issue
state: closed
created: 2026-02-27T09:17:21Z
updated: 2026-06-10T09:39:06Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/55
comments: 1
labels: feature
assignees: c-vigo
milestone: none
projects: none
parent: none
children: none
synced: 2026-07-16T12:36:49.183Z
---

# [Issue 55]: [[FEATURE] Add option to download specific issue or PR by number or ranges](https://github.com/vig-os/sync-issues-action/issues/55)

**Description**
Add an action input that lets users sync only selected issues and/or pull requests by specifying one or more numbers or numeric ranges (e.g. a single issue `42`, a range `10-20`, or a mix like `1,5,10-15`).

**Problem Statement**
Currently the action syncs all issues/PRs (subject to `include-closed`, `updated-since`, etc.). There is no way to sync only a subset by issue/PR number. Users who want a single issue, a few specific items, or a range must sync everything and then filter locally, which is slow and wasteful for large repos.

**Proposed Solution**
Introduce one or more optional inputs, e.g.:
- `issues-filter` (optional): Comma-separated list of issue numbers and/or ranges (e.g. `1,5,10-20,42`). If set, only issues matching these numbers are synced; if unset, behavior is unchanged (sync all issues per existing options).
- `prs-filter` (optional): Same idea for pull requests.

Parsing rules: allow single numbers and inclusive ranges (`min-max`). Invalid or empty values can be ignored or surface a clear error. When a filter is provided, it overrides “sync all” for that type (issues or PRs).

**Alternatives Considered**
- Relying only on `updated-since` and manual filtering: does not support “only these numbers.”
- Separate actions for “sync one” vs “sync all”: more to maintain; a single action with optional filters is simpler.

**Additional Context**
Fits with existing inputs (`sync-issues`, `sync-prs`, `include-closed`, `updated-since`). Implementation will touch the code that decides which issues/PRs to fetch (e.g. REST/GraphQL listing or filtering).

**Impact**
- Users who need a subset of issues/PRs (e.g. for docs, reports, or local tooling) get faster, smaller syncs.
- Backward compatible: when the new inputs are not set, behavior remains “sync all” as today.
- Changelog: **Added** — new optional `issues-filter` / `prs-filter` (or single combined) input(s) to sync by number or ranges.

**TDD**
- [ ] TDD compliance (see .cursor/rules/tdd.mdc)

---

# [Comment #1]() by [c-vigo]()

_Posted on June 10, 2026 at 09:39 AM_

Implemented in #98: optional `issues-filter` and `prs-filter` inputs for syncing specific issues/PRs by number or inclusive range.

