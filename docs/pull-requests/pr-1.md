---
type: pull_request
state: closed (merged)
branch: dev → main
created: 2025-12-17T18:33:32Z
updated: 2025-12-18T15:20:36Z
author: c-vigo
author_url: https://github.com/c-vigo
url: https://github.com/vig-os/sync-issues-action/pull/1
comments: 2
labels: none
assignees: c-vigo
milestone: none
projects: none
relationship: none
merged: 2025-12-18T15:20:36Z
synced: 2025-12-20T01:16:31.488Z
---

# [PR 1](https://github.com/vig-os/sync-issues-action/pull/1) Initial release: Sync Issues and PRs GitHub Action v0.1.0

## Description

This PR introduces the initial release of the **Sync Issues and PRs GitHub Action** - a comprehensive solution for syncing GitHub issues and pull requests to markdown files with full metadata, comments, and review threads.

This action enables teams to:
- Create offline documentation of issues and PRs
- Archive project history in markdown format
- Enable full-text search across issues and PRs in their codebase
- Maintain a synchronized copy of all discussions and decisions

## Related Issue(s)

Initial release - no related issues

## Type of Change

- [x] New feature (non-breaking change which adds functionality)

## Changes Made

### Core Action Implementation
- Implemented main syncing engine in TypeScript with `@actions/core` and `@actions/github`
- Added flexible authentication supporting both GitHub tokens and GitHub App credentials with `@octokit/auth-app`
- Created comprehensive input system with 9 configurable parameters:
  - Token-based and GitHub App authentication options
  - Configurable output directory, sync toggles, and closed item inclusion
  - Incremental sync support with `updated-since` and `state-file` parameters
- Implemented 6 action outputs for workflow integration (counts, timestamps, file lists, tokens)
- Built organized output structure with separate `issues/` and `pull-requests/` directories
- Generated rich markdown format including metadata, full bodies, comments, and PR review threads with diff hunks

### Development Environment
- Set up DevContainer configuration with Docker Compose for consistent development
- Configured pre-commit hooks with ESLint, Prettier, and yamllint
- Added TypeScript configuration with strict type checking
- Integrated `@vercel/ncc` for bundling action into single `dist/index.js`

### Testing Infrastructure
- Created comprehensive unit test suite with Jest and mocked GitHub APIs
- Implemented integration tests against real GitHub API (`test-action.sh`)
- Added local action testing with `@github/local-action` (`test-local.sh`)
- Configured test commands: `test`, `test:watch`, `test:coverage`, `test:integration`, `test:integration:local`, `test:all`

### Documentation
- Written comprehensive README with features, usage examples, and testing instructions
- Created `example-workflow.yml` demonstrating manual, issue, and PR triggers with:
  - Force-update workflow input for full re-sync
  - Concurrency controls to prevent race conditions
  - State caching with `actions/cache` for incremental syncs
  - GitHub App authentication example (commented out)
  - Integration with `vig-os/commit-action` for automated commits
- Added pull request template with testing checklist and review guidelines
- Created issue templates for bug reports, feature requests, and tasks (`.github/ISSUE_TEMPLATE/`)
- Updated CHANGELOG.md with comprehensive release notes in Keep a Changelog format

### CI/CD
- Implemented `.github/workflows/sync-issues.yml` for automated issue syncing:
  - Scheduled daily runs and event-driven triggers (issues/PRs opened/edited/closed)
  - Advanced cache management with automatic cleanup to prevent collisions
  - GitHub App authentication for bypassing branch protection rules
  - Force-update capability via workflow dispatch input

### Project Configuration
- Defined `action.yml` metadata with inputs, outputs, and Node 20 runtime
- Set up package.json with build, test, and packaging scripts
- Added `.gitignore`, `.npmignore`, `.prettierrc`, `.eslintrc.json`, `.yamllint`
- Configured `.pymarkdown` and `.pymarkdown.config.md` for markdown linting
- Added MIT LICENSE

## Testing

- [x] Tests pass locally (`npm test`)
- [x] Integration tests pass (`npm run test:integration`)
- [x] Local action tests pass (`npm run test:integration:local`)
- [x] Manual testing performed (describe below)

### Manual Testing Details

1. **Unit Tests**: All 15+ unit tests pass with full coverage of:
   - Authentication (token and GitHub App)
   - Issue/PR fetching and filtering
   - Markdown generation with metadata and comments
   - State file persistence
   - Error handling

2. **Integration Testing**: Successfully tested against real GitHub repository:
   - Synced open and closed issues/PRs
   - Verified markdown format with all metadata
   - Confirmed incremental sync with `updated-since` parameter
   - Validated GitHub App authentication flow

3. **Local Action Testing**: Ran complete end-to-end workflow with `@github/local-action`:
   - Verified all inputs and outputs work correctly
   - Confirmed file structure creation (`synced-issues/issues/`, `synced-issues/pull-requests/`)
   - Tested state file creation and persistence

4. **Workflow Testing**: Deployed to test repository and verified:
   - Manual workflow dispatch with force-update toggle
   - Automatic triggering on issue/PR events
   - Cache restoration and saving
   - Automated commits via commit-action

## Checklist

- [x] My code follows the project's style guidelines
- [x] I have performed a self-review of my code
- [x] I have commented my code, particularly in hard-to-understand areas
- [x] I have updated the documentation accordingly (README.md, example-workflow.yml)
- [x] I have updated the CHANGELOG.md in the `[Unreleased]` section
- [x] My changes generate no new warnings or errors
- [x] I have added tests that prove my fix is effective or that my feature works
- [x] New and existing unit tests pass locally with my changes
- [x] Any dependent changes have been merged and published

## Additional Notes

### Architecture Decisions

1. **Node 20 Runtime**: Using the latest LTS Node.js version for better performance and security
2. **TypeScript**: Provides type safety and better developer experience
3. **Bundled Distribution**: Using `@vercel/ncc` to create single-file distribution for faster action execution
4. **State Management**: Optional state file support enables efficient incremental syncs when combined with Actions cache
5. **GitHub App Support**: Allows bypassing branch protection rules and rulesets for automated commits

### Future Enhancements

Potential areas for future development:
- Add support for filtering by labels
- Implement custom markdown templates
- Add support for syncing discussions
- Enable parallel fetching for large repositories
- Add progress indicators for long-running syncs

### Version

This is the initial `v0.1.0` release. Ready to be tagged and published to GitHub Marketplace.


---
---

## Comments (2)

### [Comment #1](https://github.com/vig-os/sync-issues-action/pull/1#issuecomment-3669181141) by [@gerchowl](https://github.com/gerchowl)

_Posted on December 18, 2025 at 08:57 AM_

the checks are ill posed to check on an unreleased version?! 
thats another infinite recursion? or should it pass once but linked to concrete commit hash and then changed with a commit to the current version, then PR merge?

---

### [Comment #2](https://github.com/vig-os/sync-issues-action/pull/1#issuecomment-3669248025) by [@c-vigo](https://github.com/c-vigo)

_Posted on December 18, 2025 at 09:12 AM_

> the checks are ill posed to check on an unreleased version?! thats another infinite recursion? or should it pass once but linked to concrete commit hash and then changed with a commit to the current version, then PR merge?

The tests pass, but the "future" action running on the repo will depend on v0.1.0 of both this repo and [commit-action](https://github.com/vig-os/commit-action/pull/1)

---
---

## Commits

### Commit 1: [1201ab0](https://github.com/vig-os/sync-issues-action/commit/1201ab0f9d9ffe1b9b64fd8d1f55860938ddf978) by [c-vigo](https://github.com/c-vigo) on December 17, 2025 at 04:01 PM
install vigOS devcontainer v0.1, 1298 files modified

### Commit 2: [6ebfba1](https://github.com/vig-os/sync-issues-action/commit/6ebfba1c4d1c23c2c701c06f1f04603ba1715f6d) by [c-vigo](https://github.com/c-vigo) on December 17, 2025 at 04:03 PM
feat: install dependencies in post-create script, 56 files modified (.devcontainer/scripts/post-create.sh)

### Commit 3: [b18d060](https://github.com/vig-os/sync-issues-action/commit/b18d060194c35e5bd5b0e7a27eb64fe44e2b102b) by [c-vigo](https://github.com/c-vigo) on December 17, 2025 at 04:43 PM
feat: create sync-issues GitHub Action, 10805 files modified

### Commit 4: [e1eae61](https://github.com/vig-os/sync-issues-action/commit/e1eae614a408298ae7be7f7edf4751e2289b33a6) by [c-vigo](https://github.com/c-vigo) on December 17, 2025 at 06:29 PM
feat: enhance sync-issues workflow and documentation, 73 files modified (.github/workflows/sync-issues.yml, README.md, example-workflow.yml)

### Commit 5: [b357f94](https://github.com/vig-os/sync-issues-action/commit/b357f940a2c71dde1c37ba17eeb6f75f84aa58f9) by [c-vigo](https://github.com/c-vigo) on December 17, 2025 at 06:30 PM
release candidate v0.1.0, 41 files modified (CHANGELOG.md)

### Commit 6: [e4df73c](https://github.com/vig-os/sync-issues-action/commit/e4df73c2de759e54505edfa62d62efb46dbd1b8b) by [c-vigo](https://github.com/c-vigo) on December 18, 2025 at 09:11 AM
fix: update project directory references in scripts and tests, 7 files modified (.devcontainer/scripts/post-attach.sh, src/__tests__/integration/test-action.sh)
