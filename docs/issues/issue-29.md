---
type: issue
state: closed
created: 2026-02-25T11:29:32Z
updated: 2026-02-25T11:46:07Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/29
comments: 0
labels: chore
assignees: c-vigo
milestone: none
projects: none
relationship: none
synced: 2026-02-25T11:46:23.560Z
---

# [Issue 29]: [[CHORE] Clarify weekly CodeQL schedule rationale in workflow comments](https://github.com/vig-os/sync-issues-action/issues/29)

## Context

PR #22 review ([comment](https://github.com/vig-os/sync-issues-action/pull/22#discussion_r2848509350)) flagged ambiguity in the CodeQL workflow comment about the weekly scheduled run.

The wording can be interpreted as dependency-style monitoring, which is not the intent. The schedule exists to re-run static analysis with updated CodeQL queries/engines and newly disclosed patterns, even when repository code has not changed.

## Implementation Plan

- Update comment text in `.github/workflows/codeql.yml` to explicitly state why the weekly run exists
- Keep explanation concise and avoid vague terms like "drift"
- Ensure trigger comments align with actual workflow behavior (`pull_request`, `push`, `schedule`)
- No workflow runtime logic changes (comment/documentation-only change)
- No changelog entry needed
