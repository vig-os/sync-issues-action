---
type: issue
state: open
created: 2026-02-25T11:53:01Z
updated: 2026-02-25T11:53:01Z
author: vig-os-release-app[bot]
author_url: https://github.com/vig-os-release-app[bot]
url: https://github.com/vig-os/sync-issues-action/issues/33
comments: 0
labels: bug
assignees: none
milestone: none
projects: none
relationship: none
synced: 2026-02-25T11:53:17.212Z
---

# [Issue 33]: [Release 0.2.0 failed — automatic rollback](https://github.com/vig-os/sync-issues-action/issues/33)

Release 0.2.0 encountered an error during the automated release workflow.

**Workflow Run:** [View logs](https://github.com/vig-os/sync-issues-action/actions/runs/22395653048)
**Release PR:** #22

**Automatic rollback attempted:**
- Release branch reset to pre-finalization state
- Release tag and GitHub Release deleted (if created)

**Next steps:**
1. Review the workflow logs to identify the root cause
2. Verify rollback completed cleanly
3. Fix the issue on the release branch
4. Re-run the release workflow
