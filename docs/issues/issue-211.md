---
type: issue
state: closed
created: 2026-09-28T11:50:44Z
updated: 2026-09-28T11:56:01Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/211
comments: 1
labels: bug, area:ci, dependencies, priority:high, effort:small, semver:patch
assignees: none
milestone: none
projects: none
parent: none
children: none
synced: 2026-09-28T12:24:54.823Z
---

# [Issue 211]: [[BUG] Committed dist/ bundle on dev is stale relative to package-lock.json (blocks the v0.5.1 train)](https://github.com/vig-os/sync-issues-action/issues/211)

## Description

The committed `dist/index.js` on `dev` is stale relative to `package-lock.json`.
It is byte-identical to the `v0.5.0` tag despite 76 commits of dependency
updates since, so the bundle still embeds the runtime dependencies as they were
at v0.5.0:

| Bundled dependency | In `dist/index.js` | In `package-lock.json` |
|---|---|---|
| `@octokit/auth-app` | 8.3.0 | 8.3.1 |
| `@octokit/core` | 10.0.13 | 10.0.16 |
| `@octokit/request` | 7.0.7 | 7.0.8 |

On top of that the bundle was produced by `@vercel/ncc` 0.44, while the repo now
pins `^0.45.0` (#181), which changes the emitted output independently of the
dependency versions.

`dist-check.yml` triggers only on PRs to `release/**` and `main`, so
Renovate's `dev`-targeted lockfile PRs never regenerate the bundle — the drift
is invisible until a release train opens the `release/X.Y.Z -> main` PR, where
`Dist Check` fails. See vig-os/devkit#1745 for why the train cannot clear that
failure by itself (the finalize rebuild is `final`-only and sits downstream of
the candidate's check gate).

Refreshing the bundle here, on `dev`, unblocks the v0.5.1 train and is also the
only consumer-visible content that release carries: no `src/`, `action.yml` or
`README.md` change has landed since v0.5.0, so consumers pinning `v0` / `v0.5`
are still running the v0.5.0 dependency set.

## Steps to Reproduce

```sh
git switch dev && git pull
npm ci && npm run bundle
git status --porcelain -- dist/    # expected empty; prints " M dist/index.js"
```

Reproduced on `dev` at `7fca3d7`: `dist/index.js` comes back +760/-377.
This is the same command sequence `dist-check.yml` runs (`just sync`,
`just bundle`, `git status --porcelain -- dist/`).

## Expected Behavior

`npm run bundle` on a clean `dev` leaves `dist/` unchanged, and a release train
started from `dev` passes `Dist Check` without intervention.

## Actual Behavior

`dist/index.js` is regenerated with 760 insertions / 377 deletions, so
`Dist Check` on the release PR fails and `release.yml candidate` aborts with
`ERROR: PR #N has failed CI checks`.

## Environment

- **Branch**: `dev` at `7fca3d7` (devkit 1.17.0, `direnv` mode)
- **Node**: as pinned by `.nvmrc` / the devkit dev shell
- **Observed**: 2026-09-28, preparing the v0.5.1 train

## Additional Context

Second occurrence: the v0.4.0 train hit the same stale-bundle wall (a Renovate
`@vercel/ncc` 0.38 -> 0.44 bump) and was recovered with a bugfix PR into the
release branch. Doing the refresh on `dev` before dispatching `prepare-release`
avoids that detour. The durable fix belongs upstream — vig-os/devkit#1745.

---

# [Comment #1]() by [c-vigo]()

_Posted on September 28, 2026 at 11:55 AM_

Fixed in #212 (merged to `dev` as 3a5ea2d). Verified on `dev`: `npm run bundle` leaves `dist/` clean.

