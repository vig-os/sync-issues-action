---
type: issue
state: open
created: 2026-02-23T09:42:03Z
updated: 2026-02-23T09:42:03Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/17
comments: 0
labels: feature
assignees: none
milestone: none
projects: none
relationship: none
synced: 2026-02-23T09:42:18.470Z
---

# [Issue 17]: [[FEATURE] Support user-configurable formatting hook for generated markdown](https://github.com/vig-os/sync-issues-action/issues/17)

### Description

The action writes markdown files (issues and PRs) directly to disk and reports them via the `modified-files` output. These files are then committed by a downstream step. There is currently no mechanism for users to run formatting or linting tools (e.g. pymarkdown, prettier, end-of-file-fixer) on the generated files before they are committed.

This causes problems in repos that enforce formatting via pre-commit or CI lint checks — the auto-committed files regularly introduce trailing whitespace, missing trailing newlines, heading-level violations, and typos that then break unrelated PRs.

### Problem Statement

Consumers of the action have no clean integration point for formatting. The workaround is adding manual workflow steps between the sync and commit steps, but this is boilerplate-heavy and easy to get wrong. Repos with strict pre-commit configs (pymarkdown, trailing-whitespace, end-of-file-fixer, typos) see repeated CI failures on synced docs.

### Proposed Solution

Provide a way for users to run their own formatting/linting tools on the generated files, integrated into the action's lifecycle. Several approaches are worth considering:

1. **`format-command` input** — A new action input that accepts a shell command. The action executes it after writing files but before setting outputs. A placeholder like `{files}` is replaced with the modified file paths. Simple, composable, and tool-agnostic.

2. **Hook script convention** — The action checks for a script at a well-known path (e.g. `.github/sync-issues/format.sh`) in the consumer's repo and executes it with the modified file paths as arguments. Config lives in the repo, not the workflow.

3. **Pre-commit integration** — A boolean input (e.g. `run-pre-commit: true`) that runs `pre-commit run --files <modified-files>` after writing. Leverages existing pre-commit infrastructure but requires pre-commit to be installed and may run unwanted hooks.

4. **Workflow-level documentation** — Document the pattern of adding a formatting step between sync and commit in the example workflow. Zero code changes, but more boilerplate for consumers.

The key architectural constraint: formatting must run **after** files are written to disk but **before** the commit step picks them up.

### Alternatives Considered

- **Built-in formatter (bundle pymarkdown/prettier)**: Opinionated, bloats the action, hard to customize. pymarkdown is Python and can't be bundled into a Node action. Not recommended.
- **Exclude synced dirs from pre-commit**: Hides real formatting issues and doesn't fix them. Already used as a workaround in some repos.

### Additional Context

- Upstream issue: [vig-os/devcontainer#69](https://github.com/vig-os/devcontainer/issues/69) — documents the repeated CI failures caused by unformatted synced files.
- The action already outputs `modified-files` (comma-separated paths), which is the natural input for any formatting step.
- The action is Node.js-based (`node20`), so `child_process.execSync` is available for running external commands.
