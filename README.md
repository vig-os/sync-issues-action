# Sync Issues and PRs Action

A GitHub Action that syncs all issues and pull requests from a repository to markdown files.

- **Repository:** [vig-os/sync-issues-action](https://github.com/vig-os/sync-issues-action)
- **Organization:** [vigOS](https://github.com/vig-os)

## Features

- Sync issues and pull requests to markdown files
- Includes all comments and conversations
- Groups PR review threads with diff snippets (when available)
- Preserves original bodies (no extra description header added)
- Includes metadata (labels, dates, authors, state, relationships, etc.)

## Usage

### Quick Start

**Recommended: Use a version tag (most stable)**

```yaml
- name: Sync Issues and PRs
  uses: vig-os/sync-issues-action@v0.1.1
```

**Alternative: Use a branch (for latest changes)**

```yaml
- name: Sync Issues and PRs
  uses: vig-os/sync-issues-action@main
```

**Most secure: Use a commit SHA (pinned version)**

```yaml
- name: Sync Issues and PRs
  uses: vig-os/sync-issues-action@abc123def456
```

**Note:** `${{ github.token }}` is provided automatically by GitHub Actions and is used by default. You can override it by passing your own `token` input if needed or using GitHub App authentication.

### Options

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `token` | GitHub token with repo access. | No | `${{ github.token }}` |
| `app-id` | GitHub App ID. If provided with `app-private-key`, will use app authentication. | No | - |
| `app-private-key` | GitHub App private key. If provided with `app-id`, will use app authentication. | No | - |
| `output-dir` | Directory to store markdown files | No | `synced-issues` |
| `sync-issues` | Whether to sync issues | No | `true` |
| `sync-prs` | Whether to sync pull requests | No | `true` |
| `include-closed` | Include closed issues/PRs | No | `false` |
| `updated-since` | Only sync items updated after this ISO8601 timestamp | No | - |
| `issues-filter` | Comma-separated issue numbers and/or inclusive ranges (e.g. `1,5,10-20`). When set, only these issues are synced | No | - |
| `prs-filter` | Comma-separated pull request numbers and/or inclusive ranges (e.g. `1,5,10-20`). When set, only these pull requests are synced | No | - |
| `format-command` | Shell command run on the synced files after writing, before outputs are set. Every `{files}` placeholder is replaced with the shell-quoted modified paths (e.g. `npx prettier --write {files}`); without a placeholder the command runs as-is. A failing command fails the action | No | - |
| `state-file` | Optional path to store last sync timestamp (use with cache) | No | - |
| `force-update` | Re-write all synced files even if content is unchanged | No | `false` |
| `sync-sub-issues` | Sync sub-issue relationships (`parent`/`children`) via GraphQL | No | `true` |
| `sync-attachments` | Download attachments (images, videos, files) referenced in issue/PR bodies and comments to `<output-dir>/attachments/`, rewriting body URLs to relative paths so the synced tree works offline. Failed downloads keep the original URL and log a warning. `format-command` only receives markdown files | No | `false` |

### Outputs

The action provides the following outputs:

| Output | Description |
|--------|-------------|
| `issues-count` | Number of issues synced in this run |
| `prs-count` | Number of pull requests synced in this run |
| `last-synced-at` | ISO8601 timestamp when the sync completed |
| `modified-files` | Comma-separated list of file paths that were created or modified |
| `app-token` | GitHub App installation token (if app credentials provided). Use for checkout/push operations to bypass rulesets. |
| `github-token` | Original GitHub token. Use for commit signing. |

### Example Usage

```yaml
- name: Sync Issues and PRs
  id: sync
  uses: vig-os/sync-issues-action@v0.1.1

- name: Display sync results
  run: |
    echo "Synced ${{ steps.sync.outputs.issues-count }} issues"
    echo "Synced ${{ steps.sync.outputs.prs-count }} pull requests"
    echo "Last synced at ${{ steps.sync.outputs.last-synced-at }}"
```

See [example-workflow.yml](./example-workflow.yml) for a complete workflow example using manual, issue (opened/edited/reopened/closed), and pull request (opened/closed) triggers (no scheduled run).

## Output Structure

```
synced-issues/
├── issues/
│   ├── issue-1.md
│   ├── issue-2.md
│   └── ...
├── pull-requests/
│   ├── pr-1.md
│   ├── pr-2.md
│   └── ...
└── attachments/            # only with sync-attachments: true
    ├── <uuid>.png
    └── ...
```

With `sync-attachments: true`, attachments are stored once per unique asset
(keyed by GitHub's asset UUID) and referenced from the markdown files as
`../attachments/<uuid>.<ext>`, so the same image linked from several
issues/comments is downloaded only once. Works for public and private
repositories: downloads use the short-lived signed URLs GitHub embeds in the
API's HTML rendering of each body. Non-image file attachments
(`user-attachments/files/...`) are downloaded directly, which may fail on
private repositories — in that case the original URL is kept and a warning is
logged.

## Markdown Format

Each file includes:
- Metadata (state, dates, author, labels, comment count, relationships)
- Title with state indicator
- Full description/body (as written in GitHub)
- All comments/conversation (with author, timestamp, and links)
- PR review threads grouped with replies and diff hunks when provided by GitHub
- Link to GitHub
- Last synced timestamp

## Testing

You can run tests on the action from its root directory:

```bash
npm run test:all
```

You can also run the following specific tests:

### Unit Tests
- Run fast, isolated tests with mocks for GitHub APIs and filesystem.
- Commands:
  - `npm test` or `npm run test:unit`
  - `npm run test:watch` for watch mode
  - `npm run test:coverage` for coverage

### Integration Tests
- Exercise the built action against a real GitHub token and repo context.
- Commands:
  - `npm run test:integration` (calls `src/__tests__/integration/test-action.sh`)
  - Requires `GITHUB_TOKEN` (or `gh auth token`) and repo context variables.

### Local Action Tests
- Run the action locally with `@github/local-action` for end-to-end behavior.
- Commands:
  - `npm run test:integration:local` (calls `src/__tests__/integration/test-local.sh`)
  - Uses `GITHUB_TOKEN` and a temp `.env` to pass inputs.

## Development

This project uses the [vigOS devkit](https://github.com/vig-os/devkit) in
**direnv** mode: a Nix flake dev-shell provides Node.js and the shared vigOS
toolchain (`just`, `prek`, linters). The build tools (tsc, jest, ncc, eslint,
prettier) come from npm devDependencies via `just sync`.

### Setup

```bash
direnv allow       # load the flake dev-shell (or `nix develop` without direnv)
just sync          # npm ci
```

### Common commands

| Command | Purpose |
|---------|---------|
| `just sync` | Install/sync Node + npm dependencies |
| `just lint` | ESLint |
| `just format` | Prettier |
| `just test` | Unit tests + integration (integration auto-skips without a GitHub token) |
| `just test-unit` | Jest unit tests (accepts a path/filter) |
| `just test-cov` | Jest with coverage |
| `just build` | `tsc` + `ncc` bundle |
| `just verify-dist` | Rebuild bundle and fail if `dist/index.js` / `dist/licenses.txt` are out of sync |
| `just precommit` | Run all pre-commit hooks |

### Workflow

1. Make changes to `src/index.ts`
2. Build: `just build` (or `npm run prepare`)
3. Verify: `just verify-dist` and `just test`
4. Commit (pre-commit hooks enforce formatting and dist drift)

## License

See [LICENSE](./LICENSE).
