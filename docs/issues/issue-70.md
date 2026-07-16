---
type: issue
state: open
created: 2026-03-02T20:07:08Z
updated: 2026-07-16T08:31:43Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/70
comments: 0
labels: chore, area:ci, priority:medium, effort:small
assignees: none
milestone: 0.4
projects: none
parent: none
children: none
synced: 2026-07-16T12:36:48.059Z
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
