---
type: issue
state: closed
created: 2026-02-26T09:37:27Z
updated: 2026-03-12T14:07:44Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/52
comments: 0
labels: none
assignees: c-vigo
milestone: none
projects: none
parent: none
children: none
synced: 2026-07-16T12:36:49.748Z
---

# [Issue 52]: [[BUG] Post-Release sync push to dev rejected by branch protection](https://github.com/vig-os/sync-issues-action/issues/52)

## Description

The **Post-Release** workflow job "Sync dev with main" fails when pushing the merge commit to `dev` because repository rules on `refs/heads/dev` require:

1. **Changes must be made through a pull request** — direct pushes to `dev` are not allowed.
2. **Commits must have verified signatures** — the sync commit (`9f95859...`) is not signed, so it is rejected.

The workflow successfully merges `main` into `dev`, resets the CHANGELOG Unreleased section when appropriate, and creates a commit, but `git push origin dev` is declined:

```
remote: error: GH013: Repository rule violations found for refs/heads/dev.
remote: - Changes must be made through a pull request.
remote: - Commits must have verified signatures.
remote:   Found 1 violation:
remote:   9f9585954329ccc29cbf79212afa77de25160cd5
! [remote rejected] dev -> dev (push declined due to repository rule violations)
```

## Steps to Reproduce

1. Configure branch protection on `dev`: require pull requests and verified commit signatures.
2. Merge a PR into `main` (e.g. a release PR or any PR that triggers post-release).
3. Post-Release workflow runs, merges `main` into `dev`, commits (e.g. CHANGELOG reset), then runs `git push origin dev`.
4. Push fails with GH013 repository rule violations.

## Expected Behavior

After a merge to `main`, the `dev` branch is updated (merge + optional CHANGELOG reset) and the result is reflected on the remote, either by:

- Successfully pushing to `dev` (if rules allow), or
- Creating a pull request (e.g. `main` → `dev` or a sync branch → `dev`) so the change satisfies "changes via PR" and can be merged with the repo’s normal rules.

## Actual Behavior

The workflow pushes directly to `dev`. The push is rejected because:

1. Direct pushes to `dev` are disallowed (branch protection: "Changes must be made through a pull request").
2. The sync commit is not signed, so it fails "Commits must have verified signatures."

## Environment

- **Workflow**: `.github/workflows/post-release.yml`
- **Job**: `sync-dev` ("Sync dev with main")
- **Runner**: GitHub-hosted `ubuntu-22.04`
- **Token**: GitHub App token from `actions/create-github-app-token` (RELEASE_APP_ID / RELEASE_APP_PRIVATE_KEY)

## Possible Solutions

**Option A — Sync via pull request (recommended for strict branch protection)**  
Change the workflow so it does not push directly to `dev`. Instead:

1. Push the merge result to a short-lived branch (e.g. `sync/dev-from-main-<timestamp>` or `sync/dev-<run_id>`).
2. Open a pull request from that branch into `dev` using the same token (ensure the App has `pull_requests: write`).
3. Either merge the PR via API (if acceptable) or leave it for manual merge. If merging via API, the merge commit may still need to satisfy signature requirements depending on repo settings.

This satisfies "changes must be made through a pull request." Verified signatures may still be required on the PR’s commits; that depends on whether the repo allows bypass or requires signing for all commits (see Option B).

**Option B — Allow the sync workflow to bypass or satisfy rules**  
- **Bypass (if acceptable):** Add a branch protection rule exception for the GitHub App (or a dedicated "sync" actor) so pushes from the Post-Release workflow are allowed on `dev`. This may not be possible if the org enforces "no bypass" for PR and signature requirements.
- **Sign commits:** Configure the workflow to sign commits (e.g. GPG or Sigstore) using a key stored in secrets, so the sync commit has a verified signature. This keeps "verified signatures" enforced while allowing an automated push if direct push is otherwise permitted.

**Option C — Relax or adjust branch protection for `dev`**  
If policy allows, relax the `dev` branch rules (e.g. allow direct pushes from the GitHub App, or do not require verified signatures for `dev`). This is a policy/security trade-off and may not be desirable.

## Cleanup Required

None for this issue. The failed run did not leave a stray branch; only the push was rejected.

## Changelog Category

Fixed

