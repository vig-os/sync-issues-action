---
type: issue
state: closed
created: 2026-03-02T20:07:08Z
updated: 2026-07-16T15:15:57Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/70
comments: 1
labels: chore, area:ci, priority:medium, effort:small
assignees: none
milestone: 0.4
projects: none
parent: none
children: none
synced: 2026-07-16T18:08:28.510Z
---

# [Issue 70]: [[CHORE] Switch workflow attestation action to actions/attest](https://github.com/vig-os/sync-issues-action/issues/70)

## Chore Type
CI / Build change

## Description
Migrate workflow attestation from `actions/attest-build-provenance` to `actions/attest`, per upstream guidance noted in PR #65.  
As of v4, `attest-build-provenance` is a wrapper around `actions/attest`, and new implementations should use `actions/attest` directly.

## Acceptance Criteria
- [ ] Replace `actions/attest-build-provenance` usage with `actions/attest` in relevant workflow file(s)
- [ ] Preserve existing attestation behavior (artifact subject, provenance generation, and permissions scope)
- [ ] Validate workflow syntax and successful execution in CI
- [ ] Document any required input/permission changes in workflow comments or docs (if applicable)

## Implementation Notes
- Scope is limited to GitHub Actions workflow attestation steps.
- Review differences in action inputs between wrapper action and `actions/attest`.
- Keep least-privilege permissions for workflow tokens.

## Related Issues
Related to PR #65

## Priority
Medium

## Changelog Category
No changelog needed

## Additional Context
PR #65 updates `actions/attest-build-provenance` and includes upstream release guidance:
“new implementations should use `actions/attest` instead.”
---

# [Comment #1]() by [c-vigo]()

_Posted on July 16, 2026 at 03:15 PM_

Done via PR #119: attest-release.yml now uses actions/attest@a1948c3 (v4.1.1) directly. Like-for-like verified — the migrated workflow was dispatched against the published v0.3.0 tag and `gh attestation verify` passes with the identical `https://slsa.dev/provenance/v1` predicate under the unchanged `id-token` + `attestations` grant. Takes effect for every future `v*.*.*` tag push.

