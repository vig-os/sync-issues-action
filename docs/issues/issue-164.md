---
type: issue
state: open
created: 2026-08-05T10:07:43Z
updated: 2026-08-05T10:07:43Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/164
comments: 0
labels: none
assignees: none
milestone: none
projects: none
parent: none
children: none
synced: 2026-08-05T10:27:58.559Z
---

# [Issue 164]: [Stale committed dist bundle and stray tracked tsc emit block the v0.4.1 release train](https://github.com/vig-os/sync-issues-action/issues/164)

## Problem

The release PR's **Dist Check** (\`dist-check.yml\`) will fail on the next release train:

1. **Stale bundle** — \`dist/index.js\` was not rebuilt after runtime/toolchain bumps on the un-gated \`dev\` branch (\`@octokit/auth-app\` 8.2 → 8.3 in #159, TypeScript 5 → 6 in #150). A local \`just bundle\` in the devkit 1.6.0 dev-shell produces a different \`dist/index.js\`.
2. **Stray tracked tsc emit** — \`dist/src/**\` and \`dist/tsconfig.tsbuildinfo\` are gitignored but still tracked; they were force-re-added by the v0.4.0 finalize commit (the pre-fix behavior of [vig-os/devkit#1159](https://github.com/vig-os/devkit/issues/1159), fixed in devkit 1.6.0, adopted in #160). \`dist/tsconfig.tsbuildinfo\` drifts on every rebuild and fails \`git status --porcelain -- dist/\`.

## Fix

- \`git rm -r --cached dist/src dist/tsconfig.tsbuildinfo\` — one-time untrack; the devkit 1.6.0 finalize only commits non-ignored dist files, so this now persists across releases.
- Rebuild and commit a fresh \`dist/index.js\`.
- Align the stale \`package.json\` version (\`0.2.2\`) with the upcoming release.
