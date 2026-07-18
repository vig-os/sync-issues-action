---
type: issue
state: open
created: 2026-07-17T14:42:48Z
updated: 2026-07-17T14:42:48Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/142
comments: 0
labels: chore, area:ci, priority:medium
assignees: none
milestone: none
projects: none
parent: none
children: none
synced: 2026-07-18T04:49:57.076Z
---

# [Issue 142]: [[CHORE] Adopt vigOS devkit 1.4.0](https://github.com/vig-os/sync-issues-action/issues/142)

### Description

Re-scaffold this repo onto vigOS devkit **1.4.0** (from 1.3.1, direnv mode).

> **Validation note:** this adoption pins **1.4.0-rc2** to validate the release
> ahead of the final `1.4.0` tag. The pin is bumped to the final `1.4.0` before
> this PR merges; the rc2 run is the live consumer proof for the release train.

Devkit 1.4.0 is a feature release; for a direnv-mode Node action consumer the
relevant deltas are:

1. **zizmor baseline for managed workflows (vig-os/devkit#1182)** — devkit now
   audits its own 14 managed workflows: 8 findings fixed upstream (read-only
   checkouts gain `persist-credentials: false`, one `template-injection` moved to
   `env:`) and a devkit-owned `zizmor.yml` baseline ships for the intentional
   remainder, so the consumer baseline shrinks to zero.
2. **`DEVKIT_CI_RUNNER` runner knob (vig-os/devkit#1173)** — new optional `.vig-os`
   key routes the managed `ci.yml` toolchain jobs onto self-hosted runners.
   Absent here, so `ci.yml` keeps `ubuntu-24.04` (the jobs now resolve
   `runs-on` from a `resolve-toolchain` `runner-json` output that defaults to
   `["ubuntu-24.04"]`).
3. **pymarkdown promoted to a `language: system` flake hook (vig-os/devkit#1170)**
   and **direnv default to flake-generated hooks (vig-os/devkit#1167)** — this
   repo already runs the flake-generated hook set (`.pre-commit-config.yaml` is a
   `/nix/store` symlink), so the hook surface only re-resolves.
4. **Opt-in `gitleaks` hook (#1172), `docs` typst module (#1178), Nix consumer
   support (#1171)** — all opt-in / language-gated; no effect on this Node repo.
5. **direnv CI env + native-lib fixes (#1180, #1181)** — managed CI preamble
   improvements; no consumer wiring change.

Also bump the `vigos` flake input pin `?ref=1.3.1` -> `?ref=1.4.0` and re-lock
`flake.lock`.

### Landmines to preserve

- Consumer-owned `release-extension.yml` (the build-provenance **attestation
  seam** migrated in #138 + the `verify-dist` backstop) — must survive untouched.
- Consumer-owned integration-test matrix workflows (`integration-*.yml`,
  `js-quality.yml`, `published-tag-smoke.yml`, `prepare-release-extension.yml`)
  and `justfile.project` — must survive untouched.
- `flake.nix` `hooksExcludes = [ "^dist/" ]` and `extraPackages` customizations.

### Scope

- `init-workspace.sh --force --version 1.4.0` (direnv mode preserved; values
  resolve from `.vig-os`)
- Bump flake input to `?ref=1.4.0` + re-lock `flake.lock`
- CHANGELOG `Unreleased` entry

### Verification

`direnv exec . just precommit` green + `direnv exec . npm test`. zizmor is not in
this repo's flake hook set or CI, so the managed baseline is inert here (ships as
a config file only).

### Refs

- vig-os/devkit#1170, vig-os/devkit#1173, vig-os/devkit#1182
- Follows the 1.3.1 adoption (#138)

