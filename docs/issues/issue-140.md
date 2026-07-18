---
type: issue
state: closed
created: 2026-07-17T07:55:33Z
updated: 2026-07-17T08:04:45Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/140
comments: 1
labels: none
assignees: none
milestone: none
projects: none
parent: none
children: none
synced: 2026-07-18T04:49:57.444Z
---

# [Issue 140]: [Refresh include-closed integration fixture (all filtered issues now closed)](https://github.com/vig-os/sync-issues-action/issues/140)

The \`Integration Test / Include closed\` scenario in \`integration-pr.yml\` hardcodes \`issues-filter: '2,17,4,8'\` and asserts at least one of them is open. All four issues are now CLOSED (#2 and #17 were closed by the v0.4.0 release), so the scenario fails on every PR — including ones that touch no action source (observed identically on \`dev\` and on PR #139, where \`integration-test.yml\` is byte-identical to \`dev\`).

This is test-fixture drift, not an action regression. Fix: refresh the fixture to reference issues in the states the scenario expects (or make the scenario self-provisioning so it stops depending on live issue states).

Noted during the devkit 1.3.1 adoption (#138 / PR #139); kept out of that PR for traceability.
---

# [Comment #1]() by [c-vigo]()

_Posted on July 17, 2026 at 08:04 AM_

Resolved by #141 (merged to `dev`).

Fixed via approach (a): rather than refresh the fixture to a fresh open/closed mix (which would drift again as issues close), the `Include closed` scenario's assertion was made **independent of live issue open-state**. It now relies only on the durable invariant that issues 4 and 8 are stably CLOSED, and asserts `include-closed=true` returns strictly more issues than `include-closed=false`. The brittle `open-only count > 0` pre-check (which assumed some filtered issue stays open) is gone.

This fully resolves the drift for this scenario. The self-provisioning idea (a test that creates its own issues in known states) remains a possible future enhancement but is not required to close this — open a fresh issue if desired.

