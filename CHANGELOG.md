# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- **Sync workflow: configurable output-dir and commit-msg** ([#52](https://github.com/vig-os/sync-issues-action/issues/52))
  - New workflow inputs `output-dir` (default `docs`) and `commit-msg` (default `chore: sync issues and PRs`) for dispatch runs

### Changed

- **Sync workflow: safe defaults and pinned action ref** ([#52](https://github.com/vig-os/sync-issues-action/issues/52))
  - Checkout and commit step use `target-branch || 'dev'` and `commit-msg` input so defaults apply when inputs are omitted
  - Workflow uses pinned action ref (v0.2.2) instead of local checkout
  - Cache delete step uses `github.token`; `force-update` no longer passed to action (only `updated-since` used)

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
