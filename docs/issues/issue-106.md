---
type: issue
state: open
created: 2026-07-15T20:12:01Z
updated: 2026-07-16T08:31:37Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/106
comments: 0
labels: chore, area:ci, priority:high, effort:small
assignees: none
milestone: none
projects: none
parent: none
children: 77, 96, 95
synced: 2026-07-16T12:36:44.939Z
---

# [Issue 106]: [[CHORE] Adopt vigOS devkit 1.3.0 (direnv) — replace bespoke CI/release stack](https://github.com/vig-os/sync-issues-action/issues/106)

### Description

Adopt the vigOS devkit **1.3.0** in **direnv** mode, following the commit-action pilot (vig-os/commit-action#32 → #76 → #80). Replaces the bespoke CI/release stack with the devkit scaffold while preserving this repo's two crown jewels: the 8-scenario `integration-test.yml` matrix and release provenance attestation.

**Base: `dev`** (already on image-devcontainer 0.3.5 via #100; the direnv scaffold supersedes it, pruned via `--prune-devcontainer`).

### Plan

**Pre-flight** (this issue, before the scaffold PR):
- [x] Verify `.conf/.gh_token` never tracked in git history (verified 2026-07-15 — clean)
- [x] Remove `.github/dependabot.yml` + close its open PRs — Renovate takes over (PR #107 merged; Dependabot PRs #88 #90 #104 #105 closed)
- [x] Import Release protection + Tag protection rulesets from commit-action (rulesets 19011481 + 19011483, 2026-07-15)

**Scaffold PR** (off `dev`, once devkit 1.3.0 promotes):
- [x] `install.sh --version 1.3.0 --mode direnv --prune-devcontainer` (PR #108)
- [x] Declare `DEVKIT_TAG_PREFIX=v` + `DEVKIT_FLOATING_TAGS=major,minor` day one (PR #108)
- [x] Node wiring per pilot: flake nodejs, flake-generated hooks, `justfile.project` npm recipes, `bundle` npm alias (PR #108)
- [x] Delete bespoke workflows + helpers (PR #108; setup-env/build-dist composites were already gone on dev — resolve-image retired instead)
- [x] **Keep** `integration-test.yml` — wired to PRs via `integration-pr.yml` and to tags via `published-tag-smoke.yml` (PR #108)
- [x] **Port attestation** — DEVIATION: seam token ceiling blocks `id-token: write` (vig-os/devkit#1144); re-homed in consumer-owned `attest-release.yml` on tag push (PR #108)
- [x] Port consumer-owned workflows: `dist-check.yml`, `release-extension.yml` (dist backstop), `published-tag-smoke.yml`, `js-quality.yml` (PR #108)
- [x] Re-patch `codeql.yml` push paths to TS (PR #108; upstream vig-os/devkit#1142)
- [x] Remove CODEOWNERS (PR #108)

**Settings + validation:**
- [x] Required status checks applied 2026-07-15: Dev += "CI Summary"; Main += "CI Summary","Dist Check" (Release ruleset already had both)
- [x] Local + CI validation green (115 jest, full prek suite incl. flake-sourced typos, actionlint clean; PR #108 CI 22/22 green, MERGED)
- [ ] First release via devkit train — **assert floating v-tags actually move** (never yet proven live)

### Follow-ups (separate PRs, not this migration)
- node24 runtime (#77) — immediately after migration
- #95 (app-id→client-id), #96 (5xx retry), #71 (ESM core v3) — unaffected

### Related Issues
#77, #70, #71, #95, #96 · vig-os/devkit#1142 · pilot: vig-os/commit-action#32



