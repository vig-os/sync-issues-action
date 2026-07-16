---
type: issue
state: open
created: 2026-07-16T08:44:33Z
updated: 2026-07-16T08:44:34Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/111
comments: 0
labels: area:ci, dependencies, security, priority:blocking, effort:small, semver:patch
assignees: none
milestone: 0.3
projects: none
parent: none
children: none
synced: 2026-07-16T12:36:44.383Z
---

# [Issue 111]: [[SECURITY] Dependency review blocks release 0.3.0: undici@6.26.0 high-severity advisories](https://github.com/vig-os/sync-issues-action/issues/111)

## Description

The first devkit release train run (release/0.3.0, PR #110) is blocked by the Dependency Review gate: the lockfile resolves `undici@6.26.0` (transitive via `@actions/http-client` under `@actions/core@3` and `@actions/github@9`), which carries a high-severity advisory (GHSA-vxpw-j846-p89q, WebSocket DoS via fragment count bypass) plus three lower-severity ones. `npm audit` also flags dev-only `@babel/core` and `js-yaml` advisories.

## Fix

`npm audit fix` resolves everything within existing semver ranges (undici → 6.27.0, 0 vulnerabilities). `dist/index.js` must be rebuilt since undici is bundled. Forward-fix directly on `release/0.3.0`; flows back to `dev` via the post-promote main→dev sync.

Refs: #106 (release train), #110 (release PR)
