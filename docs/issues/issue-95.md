---
type: issue
state: closed
created: 2026-06-09T21:39:30Z
updated: 2026-07-16T08:32:23Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/95
comments: 1
labels: chore, area:ci
assignees: none
milestone: none
projects: none
parent: 106
children: none
synced: 2026-07-16T12:36:46.059Z
---

# [Issue 95]: [[CHORE] Migrate actions/create-github-app-token from app-id to client-id](https://github.com/vig-os/sync-issues-action/issues/95)

## Context

This repo's workflows use `actions/create-github-app-token@29824e69f54612133e76f7eaac726eef6c875baf` (v2) with the `app-id` input. v3 of the action deprecates `app-id` in favor of `client-id`:

> Input 'app-id' has been deprecated with message: Use 'client-id' instead.

The deprecation warning surfaces when bumping to v3. The input still works today (deprecation, not removal), so this is low risk / cosmetic for now.

Related sibling change: vig-os/devcontainer#576.

## Goal

Bump `actions/create-github-app-token` from v2 to v3 and replace `app-id: ${{ secrets.*_APP_ID }}` with `client-id: ${{ secrets.*_CLIENT_ID }}` across all workflows so the deprecation warning is removed.

## Prerequisite

`client-id` expects the GitHub App's **Client ID** (e.g. `Iv23...`), not the numeric App ID. New secrets (`COMMIT_APP_CLIENT_ID`, `RELEASE_APP_CLIENT_ID`) must be provisioned at the repo/org level **before** switching.

## Scope

Update every `actions/create-github-app-token` usage in:
- `.github/workflows/prepare-release.yml`
- `.github/workflows/release.yml`
- `.github/workflows/sync-issues.yml`
- `.github/workflows/sync-main-to-dev.yml`

## Acceptance Criteria

- `*_CLIENT_ID` secrets provisioned.
- Workflows pinned to v3 of `actions/create-github-app-token`.
- No workflow emits the `app-id` deprecation warning.
---

# [Comment #1]() by [c-vigo]()

_Posted on July 16, 2026 at 08:32 AM_

Obsoleted by the devkit 1.3.0 migration (#106 / PR #108): all `actions/create-github-app-token` usages across the workflows are now pinned to v3 and use `client-id` with the `*_CLIENT_ID` secrets (verified 2026-07-16 across all 20 workflow files). The remaining `app-id:` in `sync-issues.yml` line 168 is this action's own input, not the token action — out of scope here. All acceptance criteria met.

