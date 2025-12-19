# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

### Changed

### Removed

### Fixed

### Security

## [0.1.1] - 2025-12-19

### Fixed

- Fixed missing `dist/index.js` file in published releases by updating `.gitignore` to allow dist files to be committed
- GitHub Actions now correctly finds and executes the compiled action code

## [0.1.0] - 2025-12-18

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

[0.1.1]: https://github.com/vig-os/sync-issues-action/releases/tag/v0.1.1
[0.1.0]: https://github.com/vig-os/sync-issues-action/releases/tag/v0.1.0
