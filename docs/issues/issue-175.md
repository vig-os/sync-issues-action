---
type: issue
state: closed
created: 2026-08-07T13:56:28Z
updated: 2026-08-07T15:06:44Z
author: vig-os-release-app[bot]
author_url: https://github.com/vig-os-release-app[bot]
url: https://github.com/vig-os/sync-issues-action/issues/175
comments: 1
labels: bug
assignees: none
milestone: none
projects: none
parent: none
children: none
synced: 2026-08-08T03:26:33.648Z
---

# [Issue 175]: [Release 0.5.0 failed — automatic rollback](https://github.com/vig-os/sync-issues-action/issues/175)

Release 0.5.0 failed during the automated release workflow.

**Workflow Run:** [View logs](https://github.com/vig-os/sync-issues-action/actions/runs/31184888621)
**Release PR:** #172

**Automatic rollback attempted:**
- Release branch reset to pre-finalization state (best-effort)

**Tag status (forward-fix policy):**
- Release tags are not deleted by automation (workflow choice; GitHub immutable-release lock-in applies only after a release is **published** when that setting is enabled). If a tag was pushed before the failure, it remains on the remote.
- Use a new release candidate to validate fixes, then re-run the final release when ready.
- If a draft GitHub Release exists, manage it from the Releases UI; **publishing** locks the linked tag and assets when **immutable releases** are enabled.
---

# [Comment #1]() by [c-vigo]()

_Posted on August 7, 2026 at 03:06 PM_

Resolved — this was the first final-release attempt ([run 31184888621](https://github.com/vig-os/sync-issues-action/actions/runs/31184888621)) failing at validation only because release PR #172 was still a draft; the rollback was a no-op (nothing had been finalized or tagged).

After marking #172 ready and approving it, the final release [re-ran green](https://github.com/vig-os/sync-issues-action/actions/runs/31185572324) and promote published **v0.5.0** (`b62c8ec`), merged to `main`, and cleaned up rc1. The only residue was the promote run's floating-tag job failing to create `v0.5` — a separate, pre-existing devkit bug now root-caused and tracked in vig-os/devkit#1377; `v0.5` was created manually and verified.

