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
| `state-file` | Optional path to store last sync timestamp (use with cache) | No | - |
| `force-update` | Re-write all synced files even if content is unchanged | No | `false` |
| `sync-sub-issues` | Sync sub-issue relationships (`parent`/`children`) via GraphQL | No | `true` |

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
└── pull-requests/
    ├── pr-1.md
    ├── pr-2.md
    └── ...
```

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

1. Make changes to `src/index.ts`
2. Build: `npm run build && npm run package`
3. Run tests: `npm test`
4. Test locally with `local-action`

## License

See [LICENSE](./LICENSE).
