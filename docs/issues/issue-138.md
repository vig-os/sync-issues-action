---
type: issue
state: closed
created: 2026-07-17T07:38:37Z
updated: 2026-07-17T08:34:38Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/138
comments: 1
labels: chore, area:ci, priority:medium
assignees: none
milestone: none
projects: none
parent: none
children: none
synced: 2026-07-18T04:49:57.767Z
---

# [Issue 138]: [[CHORE] Bump vigOS devkit 1.3.0 → 1.3.1 + migrate attestation into release-extension seam](https://github.com/vig-os/sync-issues-action/issues/138)

### Description

Re-scaffold this repo onto vigOS devkit **1.3.1** (from 1.3.0, direnv mode) and retire two 1.3.0-era consumer-side carve-outs that 1.3.1 addresses upstream:

1. **`codeql.yml` hand patch (vig-os/devkit#1142)** — 1.3.0 rendered only the CodeQL `language:` matrix, not the push-to-main `paths:` filter, so this repo carried a hand patch (`**.ts`, `**.js`, `.github/workflows/**`) with a "re-apply after every upgrade" note. Devkit 1.3.1 renders node push paths natively (`**.ts`, `**.js`, `**.mjs`, `**.cjs`, `.github/workflows/**`), so the patch and its note are dropped.
2. **Attestation deviation (vig-os/devkit#1144, this repo #106)** — SLSA build-provenance attestation of `dist/index.js` lived in a consumer-owned `attest-release.yml` (tag-push) because the 1.3.0 release-extension seam was called under a `contents: read, packages: read` ceiling and a called reusable workflow cannot elevate `GITHUB_TOKEN`. Devkit 1.3.1 grants the seam a token **ceiling** (`contents: read`, `packages: write`, `id-token: write`, `attestations: write`). The attestation moves into `release-extension.yml` and `attest-release.yml` is deleted.

Also fixes flake-input drift: `flake.nix` floats on the devkit default branch (no `?ref=`); this pins `?ref=1.3.1` and re-locks `flake.lock`.

### Scope

- `install.sh --force --version 1.3.1` (direnv mode preserved; values resolve from `.vig-os`)
- Migrate attestation into `release-extension.yml`; `git rm attest-release.yml`
- Pin flake input to `?ref=1.3.1` + re-lock
- CHANGELOG `Unreleased` entry

### Verification

Static only for the seam (actionlint/zizmor + wiring vs seam contract). **Live attestation proof can only come from the next sync-issues release** — asserted, not verified, in this PR.

### Refs

- vig-os/devkit#1142, vig-os/devkit#1144
- Supersedes attestation deviation from #106
---

# [Comment #1]() by [c-vigo]()

_Posted on July 17, 2026 at 08:34 AM_

Deployed via #139 (merged to dev). Devkit 1.3.1 adopted: flake pin fixed to ?ref=1.3.1, codeql hand patch superseded upstream (vig-os/devkit#1142), dist attestation migrated into the release-extension seam under the vig-os/devkit#1144 ceiling (attest-release.yml removed — live proof at the next release), CI fully green.

