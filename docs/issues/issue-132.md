---
type: issue
state: open
created: 2026-07-16T16:49:29Z
updated: 2026-07-16T16:49:29Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/132
comments: 0
labels: none
assignees: none
milestone: none
projects: none
parent: none
children: none
synced: 2026-07-16T18:08:24.612Z
---

# [Issue 132]: [Hold TypeScript below v7 until ncc/ts-jest/typescript-eslint support it](https://github.com/vig-os/sync-issues-action/issues/132)

## Problem

Renovate keeps proposing `typescript` `^5.3.2` → `^7.0.0` (#128). TypeScript 7.0 is the native Go rewrite (`tsgo`), which drops the JS compiler-internal APIs that the rest of the toolchain reaches into. Verified locally by rebasing #128 onto `dev` and running the full suite:

| Step | Result |
|------|--------|
| `npm install` | ❌ ERESOLVE — `typescript-eslint@8.64.0` peer-deps `typescript ">=4.8.4 <6.1.0"` |
| `tsc` | ✅ compiles clean |
| `npm run package` (ncc → `dist/`) | ❌ crash — `Cannot read properties of undefined (reading 'fileExists')` |
| `npm run lint` (typescript-eslint) | ❌ crash — `… (reading 'Cjs')` |
| `npm test` (ts-jest) | ❌ crash — `… (reading 'readFile')` |

Only bare `tsc` works; `@vercel/ncc`, `ts-jest`, and `typescript-eslint` all break. This is also why Renovate's own `artifacts` step failed on #128.

## Fix

Add a repo-local `renovate.json` package rule pinning `typescript` to `<7` so Renovate stops proposing the major until the toolchain catches up. Close #128 with a pointer here.

## Revisit when

`@vercel/ncc`, `ts-jest`, and `typescript-eslint` ship TypeScript 7-compatible releases.
