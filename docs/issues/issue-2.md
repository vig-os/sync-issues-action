---
type: issue
state: open
created: 2025-12-11T08:33:18Z
updated: 2026-07-16T15:56:10Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/issues/2
comments: 1
labels: enhancement, feature, priority:backlog, area:workflow, effort:large, semver:minor
assignees: none
milestone: none
projects: none
parent: none
children: none
synced: 2026-07-16T18:08:29.171Z
---

# [Issue 2]: [[FEATURE] Fetch images and other attachments from issues and PRs](https://github.com/vig-os/sync-issues-action/issues/2)

### Description

The action should fetch images and other attachments from issues and PRs, store them in some folder and include them in the MD files.

### Problem Statement

Conversations and descriptions might be incomplete without the context provided by attachments.

### Proposed Solution

Fetch attachments and save them locally, making them available for MD rendering.

### Alternatives Considered

HTML code pointing to the online attachment, but this introduces online requirement and dependency to GitHub

### Additional Context

_No response_

### Impact

_No response_
---

# [Comment #1]() by [c-vigo]()

_Posted on July 16, 2026 at 03:56 PM_

## Spike results (2026-07-16)

**Verdict: feasible, with a cleaner mechanism than direct download.** Empirical tests run against live GitHub (test asset: a `user-attachments` image in a public org issue).

### Key finding

Attachment URLs (`https://github.com/user-attachments/assets/<uuid>`) are not part of the REST API and do not accept `Authorization: token` for private repos. However, requesting bodies with the **`application/vnd.github.full+json`** media type returns `body` (raw markdown) **and** `body_html` in a single call — and in `body_html`, GitHub has already rewritten every attachment (including legacy `user-images.githubusercontent.com` URLs in old issues) to a pre-signed JWT URL on `private-user-images.githubusercontent.com`.

Verified behavior:

- The JWT URL downloads with **plain unauthenticated HTTP** (`200`, correct bytes). Same mechanism the github.com web UI uses → works uniformly for public **and** private repos.
- The JWT is valid for **300 s** → downloads must happen inside the per-item sync loop, re-fetching the item for a fresh JWT on expiry.
- The signed URL path embeds the **original asset UUID and file extension** (`/<userid>/<fileid>-<uuid>.<ext>?jwt=…`), so it maps back to the raw-markdown URL by UUID and supplies the extension the raw URL lacks.
- Raw bodies use two syntaxes: markdown `![alt](url)` and HTML `<img src="…">` — both must be rewritten. Videos use the same `assets/<uuid>` URLs.
- Direct fetch of `assets/<uuid>` on a public repo: `302` → S3 URL (300 s validity), anonymous; the auth header is ignored. Not a viable route for private repos.

### Proposed design

- Opt-in **`sync-attachments`** input (default `false`, no behavior change).
- Store as `<output-dir>/attachments/<uuid>.<ext>` — UUID-keyed: free dedup across issues/comments, no path-traversal risk from attacker-controlled filenames.
- Rewrite raw-body URLs to relative paths (`../attachments/<uuid>.<ext>`) before formatting → tree is offline-portable. **Never** write JWT/S3 URLs into the markdown (they expire and would churn `hasContentChanged` every sync).
- Downloaded files are added to `modified-files`; skip download when the file already exists (unless `force-update`).
- Failure policy: per-attachment warning, keep the original absolute URL, never fail the sync.

### Known gap

Non-image **file** attachments (`github.com/user-attachments/files/<id>/<name>` — zips, PDFs, logs) render in `body_html` as plain `href`s without a JWT. Public repos: direct GET works. Private repos: likely not fetchable with any token (no API exists). Untested — no private repo in our orgs currently has an attachment, and attachments cannot be uploaded via API. Plan: attempt direct download, warn and keep the original URL on failure.

### Effort

With the `body_html` route this is closer to **effort:medium** than large: one new extract/map/download/rewrite module, media-type change on the fetch call sites, fixture-based tests, README/action.yml docs. No new dependencies (Node's global `fetch` suffices).


