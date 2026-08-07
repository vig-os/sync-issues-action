# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- **`client-id` input as the preferred GitHub App credential** ([#168](https://github.com/vig-os/sync-issues-action/issues/168))
  - Forwarded to `createAppAuth` exactly as `app-id` is; setting both inputs fails with an explicit error

### Changed

### Deprecated

- **`app-id` input** ([#168](https://github.com/vig-os/sync-issues-action/issues/168))
  - Still works unchanged, but emits a runtime deprecation warning; use `client-id` instead

### Removed

### Fixed

### Security

## [v0.4.1](https://github.com/vig-os/sync-issues-action/releases/tag/v0.4.1) - 2026-08-05

### Changed

- **Renovate dependency update** ([#162](https://github.com/vig-os/sync-issues-action/pull/162))
  - Update `@typescript-eslint/eslint-plugin` from `8.65.0` to `8.66.0`
  - Update `@typescript-eslint/parser` from `8.65.0` to `8.66.0`
  - Update `globals` from `17.8.0` to `17.9.0`
  - Update `tsx` from `4.23.1` to `4.23.7`
  - Update `typescript-eslint` from `8.65.0` to `8.66.0`
- **Renovate: update `@octokit/auth-app` from `8.2.0` to `8.3.0`** ([#159](https://github.com/vig-os/sync-issues-action/pull/159))
- **Renovate: update `actions/attest` from `v4.2.0` to `v4.2.2`** ([#158](https://github.com/vig-os/sync-issues-action/pull/158))
- **Renovate: update `globals` from `17.7.0` to `17.8.0`** ([#155](https://github.com/vig-os/sync-issues-action/pull/155))
- **Renovate: update `typescript` from `^5.3.2` to `^6.0.0`** ([#150](https://github.com/vig-os/sync-issues-action/pull/150))
- **Renovate dependency update** ([#148](https://github.com/vig-os/sync-issues-action/pull/148))
  - Update `@typescript-eslint/eslint-plugin` from `8.64.0` to `8.65.0`
  - Update `@typescript-eslint/parser` from `8.64.0` to `8.65.0`
  - Update `eslint` from `10.7.0` to `10.8.0`
  - Update `prettier` from `3.9.5` to `3.9.6`
  - Update `ts-jest` from `29.4.11` to `29.4.12`
  - Update `typescript-eslint` from `8.64.0` to `8.65.0`
- **Renovate: update `astral-sh/setup-uv` from `v8.3.2` to `v9.0.0`** ([#151](https://github.com/vig-os/sync-issues-action/pull/151))
- **Renovate dependency update** ([#149](https://github.com/vig-os/sync-issues-action/pull/149))
  - Update `actions/attest` from `v4.1.1` to `v4.2.0`
  - Update `actions/checkout` from `v7.0.0` to `v7.0.1`
  - Update `ossf/scorecard-action` from `v2.4.3` to `v2.4.4`
- **Renovate: update `github/codeql-action` from `7188fc3` to `e4fba86`** ([#147](https://github.com/vig-os/sync-issues-action/pull/147))
- **Adopt vigOS devkit 1.4.0** ([#142](https://github.com/vig-os/sync-issues-action/issues/142))
  - Re-scaffold from devkit 1.3.1 to 1.4.0 (direnv mode); pin the `vigos` flake input to `?ref=1.4.0` and re-lock `flake.lock`
  - Managed workflows adopt the devkit-owned `zizmor` security baseline (new `zizmor.yml`) and its upstream fixes: `persist-credentials: false` on the read-only checkouts (`ci.yml` resolve/lint/test/dependency-review, `codeql.yml`, `renovate-changelog-build.yml`, `sync-issues.yml`) and the `sync-main-to-dev.yml` template-injection fix (release-app token moved to step `env:`) ([vig-os/devkit#1182](https://github.com/vig-os/devkit/issues/1182))
  - Managed `ci.yml` toolchain jobs (`lint`, `test`, `commit-checks`, `summary`) route `runs-on` through the new `resolve-toolchain` `runner-json` output driven by the optional `.vig-os` `DEVKIT_CI_RUNNER` key; absent here, so the jobs keep `ubuntu-24.04` ([vig-os/devkit#1173](https://github.com/vig-os/devkit/issues/1173))
  - direnv CI toolchain now forwards the flake `shellHook` environment to `GITHUB_ENV` ([vig-os/devkit#1180](https://github.com/vig-os/devkit/issues/1180)) and the base `justfile` ships a `with-native-libs` recipe for uvx native wheels ([vig-os/devkit#1181](https://github.com/vig-os/devkit/issues/1181))
- **Adopt vigOS devkit 1.3.1** ([#138](https://github.com/vig-os/sync-issues-action/issues/138))
  - Re-scaffold from devkit 1.3.0 to 1.3.1 (direnv mode); pin the `vigos` flake input to `?ref=1.3.1` and re-lock `flake.lock` (previously floated on the devkit default branch)
  - CodeQL push-to-main `paths:` filter now renders the Node globs natively (`**.ts`, `**.js`, `**.mjs`, `**.cjs`, `.github/workflows/**`), retiring the hand patch ([vig-os/devkit#1142](https://github.com/vig-os/devkit/issues/1142))
- **Move build-provenance attestation into the release-extension seam** ([#138](https://github.com/vig-os/sync-issues-action/issues/138))
  - The SLSA build-provenance attestation of `dist/index.js` now runs as a final-release job in the consumer-owned `release-extension.yml`, using the token ceiling devkit 1.3.1 grants the seam ([vig-os/devkit#1144](https://github.com/vig-os/devkit/issues/1144)); the standalone `attest-release.yml` tag-push workflow is removed (resolves the deviation tracked in [#106](https://github.com/vig-os/sync-issues-action/issues/106))

### Fixed

- **Refresh the committed `dist/` bundle and untrack stray tsc emit** ([#164](https://github.com/vig-os/sync-issues-action/issues/164))
  - Rebuild `dist/index.js` so the shipped bundle picks up the runtime/toolchain bumps that landed on `dev` without a rebundle (`@octokit/auth-app` 8.3.0, TypeScript 6)
  - `git rm --cached` the gitignored-but-tracked `dist/src/**` and `dist/tsconfig.tsbuildinfo` re-added by the v0.4.0 finalize; the devkit 1.6.0 finalize ([vig-os/devkit#1159](https://github.com/vig-os/devkit/issues/1159)) no longer force-adds them, so the untrack now persists
  - Align the stale `package.json` version (`0.2.2`) with the release train

## [v0.4.0](https://github.com/vig-os/sync-issues-action/releases/tag/v0.4.0) - 2026-07-16

### Added

- **User-configurable formatting hook for generated markdown** ([#17](https://github.com/vig-os/sync-issues-action/issues/17))
  - New optional `format-command` input runs a shell command on the synced files after they are written and before outputs are set, so the downstream commit step picks up formatted files
  - Every `{files}` placeholder is replaced with the shell-quoted modified paths (e.g. `npx prettier --write {files}`); a failing command fails the action
- **Fetch images and other attachments from issues and PRs** ([#2](https://github.com/vig-os/sync-issues-action/issues/2))
  - New optional `sync-attachments` input (default `false`) downloads attachments referenced in issue/PR bodies and comments to `<output-dir>/attachments/<uuid>.<ext>` and rewrites body URLs to relative paths, making the synced tree self-contained offline
  - Works for public and private repositories via the signed URLs GitHub embeds in the API's HTML body rendering; failed downloads keep the original URL and log a warning
  - Downloaded attachments are included in the `modified-files` output; `format-command` now only receives markdown files

### Changed

- **Renovate: update `ubuntu` from `22.04` to `24.04`** ([#130](https://github.com/vig-os/sync-issues-action/pull/130))
- **Renovate dependency update** ([#126](https://github.com/vig-os/sync-issues-action/pull/126))
  - Update `@types/node` from `25.5.0` to `25.9.5`
  - Update `@typescript-eslint/eslint-plugin` from `8.57.2` to `8.64.0`
  - Update `@typescript-eslint/parser` from `8.57.2` to `8.64.0`
  - Update `@vercel/ncc` from `^0.38.1` to `^0.44.0`
  - Update `eslint` from `10.1.0` to `10.7.0`
  - Update `globals` from `17.4.0` to `17.7.0`
  - Update `jest` from `30.3.0` to `30.4.2`
  - Update `prettier` from `3.8.1` to `3.9.5`
  - Update `ts-jest` from `29.4.6` to `29.4.11`
  - Update `tsx` from `4.21.0` to `4.23.1`
  - Update `typescript-eslint` from `8.57.2` to `8.64.0`

### Security

- **Pin `@github/local-action` in the local integration test script** ([#122](https://github.com/vig-os/sync-issues-action/issues/122))
  - `test-local.sh` now installs a fixed version instead of the floating latest, resolving the OpenSSF Scorecard `PinnedDependenciesID` alert

## [v0.3.0](https://github.com/vig-os/sync-issues-action/releases/tag/v0.3.0) - 2026-07-16

### Added

- **Sync specific issues/PRs by number or range** ([#55](https://github.com/vig-os/sync-issues-action/issues/55))
  - New optional `issues-filter` and `prs-filter` inputs accept comma-separated numbers and inclusive ranges (e.g. `1,5,10-20`)
  - When set, the action fetches only the requested items directly instead of paginating through all issues or pull requests

### Changed

- **Run the action on the Node.js 24 runtime** ([#77](https://github.com/vig-os/sync-issues-action/issues/77))
  - `action.yml` `runs.using` switched from `node20` to `node24` ahead of GitHub's June 2026 forced default
  - `.nvmrc` updated to 24, matching the flake dev-shell (node 24.16) the suite already runs on

- **Adopt vigOS devkit 1.3.0 (direnv mode)** ([#106](https://github.com/vig-os/sync-issues-action/issues/106))
  - Replace the bespoke CI/release stack with the devkit scaffold (managed ci/release/promote workflows; native dist prep, tag prefix `v`, and floating `v0`/`v0.X` tags)
  - Nix flake dev-shell (direnv) with flake-generated pre-commit hooks replaces the devcontainer image and `scripts/setup-node.sh` provisioning
  - Keep the 8-scenario integration-test matrix (new PR-gate and published-tag-smoke callers); re-home provenance attestation in `attest-release.yml`; add Dist Check and JS Quality gates ported from commit-action
  - Retire the placeholder `security-scan.yml`, `CODEOWNERS`, the bespoke changelog/release helper scripts, and Dependabot (Renovate takes over)

- **Adopt vigOS v0.3.5 devcontainer and realign project tooling to Node** ([#6](https://github.com/vig-os/sync-issues-action/issues/6))
  - Provision Node via `scripts/setup-node.sh` and `just` recipes; run lint, build, and test inside the devcontainer
  - Adapt release workflows and label taxonomy to the standardized vigOS layout
  - Drop Python scaffolding and the legacy `setup-env`/`build-dist` composite actions
- **`just test` runs the full local suite; add `just test-unit` for unit-only runs**
  - `just test` runs unit tests plus integration when a GitHub token is available; integration is skipped with a warning otherwise
  - `just test-unit` replaces the previous unit-only `just test` behavior and accepts Jest filter args
- **Upgrade GitHub Actions toolkit to ESM-only releases** ([#6](https://github.com/vig-os/sync-issues-action/issues/6))
  - Adopt `@actions/github` v9 (Octokit v7) and `@actions/core` v3 for current toolkit HTTP client and type support
  - Update TypeScript module resolution and Jest module mocks for ESM toolkit packages
- **Stop committing tsc emit under dist/** ([#6](https://github.com/vig-os/sync-issues-action/issues/6))
  - Only `dist/index.js` and `dist/licenses.txt` are tracked; `verify-dist` checks those files only
- **Post-release replaced by PR-based main-to-dev sync** ([#52](https://github.com/vig-os/sync-issues-action/issues/52))
  - Remove `post-release.yml` workflow; add `sync-main-to-dev.yml` that opens a PR to sync `main` into `dev`, satisfying branch protection on both branches
  - Harden sync checks by failing clearly when `origin/main` or `origin/dev` is missing instead of silently treating branches as up to date
  - Fix `workflow_dispatch` hyphenated input access and conflict path robustness (`issues: write`, safer conflict label handling, clearer manual resolution commands)
  - Reduce duplicate/no-op sync PR risk by re-checking ahead/behind state inside the `sync` job and tightening existing-sync-PR detection (search + explicit list limit)
  - Split auth into explicit app tokens by responsibility: `COMMIT_APP_*` for checkout/ref operations and `RELEASE_APP_*` for PR/label operations requiring broader scopes
  - Generate `RELEASE_APP_*` only after re-check confirms sync work remains, reducing unnecessary broader-scope token issuance
- **Sync workflow uses commit-scoped app secrets and manual output target**
  - Update `sync-issues.yml` to use `COMMIT_APP_ID`/`COMMIT_APP_PRIVATE_KEY` for both checkout token generation and action app auth inputs
  - Respect `workflow_dispatch` `output-dir` input in the action call, with `'docs'` as the default fallback
- **Bound integration test runtime to a fixed subset** ([#56](https://github.com/vig-os/sync-issues-action/issues/56))
  - Integration test workflow and local test scripts now pass `issues-filter`/`prs-filter` so only a small, stable set of issues and PRs is synced
  - Keeps test duration bounded as the repository's issue/PR count grows

### Fixed

- **Retry transient GitHub 5xx errors and skip failing items during sync** ([#96](https://github.com/vig-os/sync-issues-action/issues/96))
  - Add `withRetry` helper with exponential backoff for 5xx, rate-limit, and network errors
  - Sanitize GitHub "Unicorn!" HTML error pages into concise messages
  - Skip individual issues/PRs that fail persistently instead of aborting the entire sync run

### Security

- **Bump bundled `undici` to 6.27.0** ([#111](https://github.com/vig-os/sync-issues-action/issues/111))
  - Clears the high-severity WebSocket DoS advisory (GHSA-vxpw-j846-p89q) and three related `undici` advisories flagged by dependency review, plus dev-only `@babel/core` and `js-yaml` audit findings

- **Resolve npm audit vulnerabilities** ([#6](https://github.com/vig-os/sync-issues-action/issues/6))
  - Upgrade `@actions/github` to v9 and `@actions/core` to v3, resolving high-severity `undici` advisories in the bundled action
  - Apply non-breaking audit fixes for dev/build-only dependencies (`handlebars`, `flatted`, `picomatch`, `brace-expansion`)

## [0.2.2] - 2026-02-26

### Added

- **Sync workflow: configurable output-dir and commit-msg** ([#52](https://github.com/vig-os/sync-issues-action/issues/52))
  - New workflow inputs `output-dir` (default `docs`) and `commit-msg` (default `chore: sync issues and PRs`) for dispatch runs

### Changed

- **Sync workflow: safe defaults and pinned action ref** ([#52](https://github.com/vig-os/sync-issues-action/issues/52))
  - Checkout and commit step use `target-branch || 'dev'` and `commit-msg` input so defaults apply when inputs are omitted
  - Workflow uses pinned action ref (v0.2.2) instead of local checkout
  - Cache delete step uses `github.token`; `force-update` no longer passed to action (only `updated-since` used)
- **ESLint toolchain upgrade** ([#72](https://github.com/vig-os/sync-issues-action/issues/72))
  - Upgrade `eslint` to v10 and `@typescript-eslint/*` packages to v8
  - Migrate from legacy `.eslintrc.json` to flat config via `eslint.config.mjs`
- **Dependabot dependency updates**
  - GitHub Actions: bump `actions/checkout` from v4 to v6 ([#51](https://github.com/vig-os/sync-issues-action/pull/51))
  - GitHub Actions: bump grouped minor/patch updates ([#64](https://github.com/vig-os/sync-issues-action/pull/64))
  - GitHub Actions: bump `actions/attest-build-provenance` from v3.2.0 to v4.1.0 ([#65](https://github.com/vig-os/sync-issues-action/pull/65))
  - GitHub Actions: bump `actions/upload-artifact` from v4.6.2 to v7.0.0 ([#66](https://github.com/vig-os/sync-issues-action/pull/66))
  - GitHub Actions: bump pinned `vig-os/sync-issues-action` SHA ([#68](https://github.com/vig-os/sync-issues-action/pull/68))
  - npm dev dependencies: bump grouped minor/patch updates ([#61](https://github.com/vig-os/sync-issues-action/pull/61))
  - npm dev dependencies: bump `@types/node` from v20.19.25 to v25.3.3 ([#69](https://github.com/vig-os/sync-issues-action/pull/69))

### Deprecated

### Removed

### Fixed

### Security

## [0.2.2](https://github.com/vig-os/sync-issues-action/releases/tag/v0.2.2) - 2026-02-26

### Added

- Exported `shiftHeadersToMinLevel` utility function for independent unit testing
- **Sync sub-issue relationships into frontmatter** ([#8](https://github.com/vig-os/sync-issues-action/issues/8), [#15](https://github.com/vig-os/sync-issues-action/issues/15))
  - Fetch `parent` and `subIssues` via GraphQL batch query for all synced issues
  - New `sync-sub-issues` action input to control sub-issue syncing (default: `true`)
  - Replace hardcoded `relationship: none` with dynamic `parent` and `children` fields
  - Graceful degradation: emits info message and falls back to `none` if the sub-issues API is unavailable
- **CI/CD pipeline** ([#13](https://github.com/vig-os/sync-issues-action/issues/13))
  - CI workflow with lint, build-dist verification, and test jobs
  - Integration test suite as a reusable workflow with parallel jobs covering issues-only, PRs-only, force-update, include-closed, sub-issues, updated-since, state-file, and default-mode scenarios
  - Three-phase release pipeline: prepare-release (branch + draft PR), release (tag + GitHub Release with provenance attestation), and post-release (dev sync + CHANGELOG reset)
  - `setup-env` and `build-dist` composite actions for consistent environment setup
  - CHANGELOG management CLI (`prepare_changelog.py`) for automated release note preparation
  - Dependabot configuration for automated dependency updates
  - CODEOWNERS file for automated review assignment
  - CodeQL analysis workflow for automated security vulnerability scanning
  - Scorecard workflow for ongoing supply-chain security assessments
  - Security scan workflow for continuous security monitoring

### Changed

- **Sync-issues workflow uses local action checkout** ([#13](https://github.com/vig-os/sync-issues-action/issues/13))
  - Replaced pinned remote ref with `uses: ./` so the workflow always tests the current branch's code
- **Node.js version pinned via `.nvmrc`** ([#13](https://github.com/vig-os/sync-issues-action/issues/13))
  - `.nvmrc` is the single source of truth; `setup-env` and devcontainer read from it

### Fixed

- Corrected heading hierarchy in `formatPRAsMarkdown`: promoted the Comments section header from `##` to `#` and individual comment entry headers from `###` to `##`
- **Release workflow avoids immutable-release upload failures**
  - Generates `checksums-sha256.txt` before creating the GitHub release and attaches it during `gh release create` instead of uploading afterward
- **Release workflow: floating-tag updates and rollback** ([#38](https://github.com/vig-os/sync-issues-action/issues/38))
  - Floating-tag updates (vX, vX.Y) run in a separate job after the release job succeeds; main rollback no longer restores floating tags
  - Resolve floating tags via exact "Get a reference" API (`git/ref/tags/$TAG`) instead of `git/matching-refs` to avoid wrong-SHA from prefix matches
  - New job captures current SHAs, updates tags, and on failure restores from captured SHAs (self-contained)
- **`--force-update` does not re-sync issues (only PRs)** ([#10](https://github.com/vig-os/sync-issues-action/issues/10))
  - Added `force-update` action input that bypasses the `hasContentChanged` content-comparison gate
  - When active, all fetched items are re-written (with updated `synced:` frontmatter) even if body content is unchanged
  - Updated `sync-issues.yml` workflow to pass the `force-update` dispatch input to the action
- Added `shiftHeadersToMinLevel` helper to re-level headers inside comment bodies so the shallowest header maps to `###`, preventing collisions with outer document structure
- Fixed default `GITHUB_REPOSITORY` in `test-local.sh` from non-existent `vig-os/actions` to `vig-os/sync-issues-action`
- Removed broken fallback command in `test-local.sh` that passed a file path where a directory is required

### Security

- **CodeQL and OpenSSF Scorecard analysis workflows** ([#13](https://github.com/vig-os/sync-issues-action/issues/13))
  - CodeQL scans JavaScript/TypeScript on push and PR
  - Scorecard publishes results to the Security tab via SARIF

## [0.1.1](https://github.com/vig-os/sync-issues-action/releases/tag/v0.1.1) - 2025-12-19

### Fixed

- Fixed missing `dist/index.js` file in published releases by updating `.gitignore` to allow dist files to be committed
- GitHub Actions now correctly finds and executes the compiled action code

## [0.1.0](https://github.com/vig-os/sync-issues-action/releases/tag/v0.1.0) - 2025-12-18

### Added

- Initial release of `Sync Issues and PRs` GitHub Action
- Core functionality to sync GitHub issues and pull requests to markdown files
- Flexible authentication system supporting both GitHub tokens and GitHub App credentials
- Comprehensive input options:
  - `token`: GitHub token with repo access (defaults to `github.token`)
  - `app-id` and `app-private-key`: GitHub App authentication for bypassing rulesets
  - `output-dir`: Configurable directory for synced markdown files
  - `sync-issues` and `sync-prs`: Toggle syncing of issues/PRs independently
  - `include-closed`: Option to include closed issues/PRs
  - `updated-since`: Incremental sync support with ISO8601 timestamp filtering
  - `state-file`: State persistence for caching between runs
- Action outputs for workflow integration:
  - `issues-count` and `prs-count`: Count of synced items
  - `last-synced-at`: Timestamp of sync completion
  - `modified-files`: List of created/modified file paths
  - `app-token`: GitHub App installation token for checkout/push operations
  - `github-token`: Original GitHub token for commit signing
- Markdown format with comprehensive metadata:
  - Issue/PR state, dates, author, labels, and comment count
  - Full description/body as written in GitHub
  - All comments and conversations with author, timestamp, and links
  - PR review threads grouped with replies and diff hunks
  - Links to GitHub and last synced timestamp
- Organized output structure with separate `issues/` and `pull-requests/` directories
- Complete testing suite:
  - Unit tests with mocks for GitHub APIs and filesystem
  - Integration tests against real GitHub API
  - Local action tests with `@github/local-action`
  - Watch mode and coverage reporting
- Development environment setup:
  - DevContainer configuration with Docker Compose
  - Pre-commit hooks and formatting tools (ESLint, Prettier)
  - TypeScript configuration with strict type checking
  - Build and packaging scripts with `@vercel/ncc`
- Documentation:
  - Comprehensive README with usage examples
  - Example workflow demonstrating manual, issue, and PR triggers
  - Pull request template with testing checklist
  - Issue templates for bug reports, feature requests, and tasks
- CI/CD workflow for automated issue syncing
