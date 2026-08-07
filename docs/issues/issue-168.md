---
type: issue
state: open
created: 2026-08-07T13:04:06Z
updated: 2026-08-07T13:08:40Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/168
comments: 1
labels: area:ci, feature, priority:blocking, effort:small, semver:minor
assignees: none
milestone: none
projects: none
parent: none
children: none
synced: 2026-08-07T14:06:07.478Z
---

# [Issue 168]: [Add client-id input as the preferred App credential](https://github.com/vig-os/sync-issues-action/issues/168)

## Context

A 2026-08-07 audit of GitHub-App credentials across the `vig-os` and `exo-pet`
orgs found that every App secret pair can be consolidated to **Client ID only**.
Nothing in the auth path is numerically load-bearing: `@octokit/auth-app`
accepts a client-ID string (`Iv23li…`) wherever it accepts a numeric App ID,
on every pinned action version currently in use.

This action is the last consumer in the fleet that *forces* a numeric App ID to
stay alive, purely because of how its input is named.

### What the code actually does

- `action.yml:28-33` exposes only `app-id` (described as `GitHub App ID (optional)`)
  and `app-private-key`.
- `src/index.ts:405` reads the raw input: `const appId = core.getInput('app-id') || '';`
- `src/index.ts:411-421` validates that both are provided together, then calls
  `generateAppInstallationToken(appId, appPrivateKey)`.
- `src/index.ts:1548-1551` forwards the string straight into
  `createAppAuth({ appId: appId, … })`.

The value is never parsed as a number, compared numerically, or otherwise
interpreted — it is passed through verbatim to `@octokit/auth-app`, which
already accepts client IDs. **So the only stale things are the input name and
the docs**, not the implementation.

### Upstream precedent

`actions/create-github-app-token` added a `client-id` input in **v3.1.0**,
keeping `app-id` working. Mirroring that naming keeps the two actions
consistent for anyone reading a workflow.

## Proposal

1. Add a `client-id` input to `action.yml` — the preferred name, described as
   "GitHub App Client ID". Either alias it onto the same code path as `app-id`
   or treat the two as mutually exclusive; if both are set, fail with a clear
   message rather than silently picking one.
2. Keep `app-id` working for back-compat, with a deprecation note in its
   `description` (and ideally a `core.warning` at runtime when it is used).
   **Do not remove it** — see the migration principle below.
3. Update the credential validation at `src/index.ts:411-413` so its error
   message names whichever input the caller used.
4. Update `README.md:48-49` (inputs table) and any App-auth prose so `client-id`
   is documented as the preferred credential and `app-id` is marked deprecated.
5. Add/extend tests covering: `client-id` alone, `app-id` alone (still works),
   and both set together.
6. Cut a **minor** release (current `package.json` version is `0.4.1`) and make
   sure the committed `dist/` bundle is rebuilt as part of it.

## Acceptance criteria

- [ ] `client-id` accepted as an input and forwarded to `createAppAuth` exactly
      as `app-id` is today.
- [ ] `app-id` still works unchanged; no existing consumer workflow breaks.
- [ ] Using both inputs at once produces an explicit, actionable error.
- [ ] `README.md` documents `client-id` as preferred and `app-id` as deprecated.
- [ ] Tests cover all three input combinations.
- [ ] A minor release is tagged with a rebuilt `dist/`, and the release SHA is
      recorded here so downstream repos can pin it.

## Migration principle (applies fleet-wide)

**No numeric `*_APP_ID` secret is deleted while any pinned workflow still
references it.** The cautionary precedent: `exo-pet/playground-carlos`'s
sync-issues job broke silently for a week when `COMMIT_APP_ID` was
unavailable — the workflow kept "succeeding" without syncing. Retirement of the
numeric secrets happens only after the last pinned consumer has moved.

## Dependents

This issue is the **prerequisite for the rest of the migration**. Once a release
ships, these consumers can move:

- `vig-os/devkit` — the stamped `sync-issues.yml` scaffold currently passes
  `app-id: ${{ secrets.COMMIT_APP_ID }}`; it switches to `client-id` once this
  ships. Tracked in `vig-os/devkit` (issue linked below once filed).
- `vig-os/tessera` — pins `vig-os/sync-issues-action@b4cdf37` (v0.1.1) with its
  own dedicated App; needs this input plus a version bump.
- `vig-os/h5v`, `vig-os/scitadel` — ride the devkit scaffold bump.

---

# [Comment #1]() by [c-vigo]()

_Posted on August 7, 2026 at 01:08 PM_

Dependents, now that the sibling issues are filed:

- vig-os/devkit#1365 — switches the stamped `sync-issues.yml` scaffold to `client-id`; blocked on the release from this issue.
- vig-os/tessera#364 — pins `sync-issues-action@b4cdf37` (v0.1.1) with its own dedicated App; needs this input plus a version bump.
- vig-os/h5v#6 and vig-os/scitadel#209 — old devkit scaffolds; they pick this up via the devkit bump.
- exo-pet/org-config#20 — org-secret creation and retirement on the exo-pet side, sequenced after vig-os/devkit#1365.

Please record the release tag and SHA here once cut, so the pinned consumers above can update.

