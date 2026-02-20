---
type: issue
state: open
created: 2026-02-18T19:00:06Z
updated: 2026-02-20T11:10:45Z
author: gerchowl
author_url: https://github.com/gerchowl
url: https://github.com/vig-os/sync-issues-action/issues/8
comments: 1
labels: enhancement
assignees: c-vigo
milestone: none
projects: none
relationship: none
synced: 2026-02-20T12:25:11.984Z
---

# [Issue 8]: [[FEATURE] Sync sub-issue (tracked issues) relationships into markdown frontmatter](https://github.com/vig-os/sync-issues-action/issues/8)

### Description

Add support for syncing GitHub's sub-issue relationships (`trackedIssues` / `trackedInIssues`) into the markdown frontmatter of synced issue files. The action currently writes a hardcoded `relationship: none` field — this should be populated with actual parent/child data from the GitHub GraphQL API.

### Problem Statement

GitHub supports native sub-issue tracking (via tasklists), exposing `trackedIssues` and `trackedInIssues` fields in the GraphQL API. The sync-issues-action currently ignores these relationships, writing `relationship: none` for every issue. Consumers of the synced markdown files (triage skills, dashboards, agents) have no way to know which issues are grouped without querying GitHub separately, defeating the purpose of the local sync.

### Proposed Solution

1. After fetching issues via REST, make a single bulk GraphQL query to retrieve `trackedIssues` and `trackedInIssues` for all fetched issues in one call (avoids N+1 API calls).
2. Populate the YAML frontmatter with the relationship data:
   - Parent issues: `relationship: parent` + `children: 61, 63, 80`
   - Child issues: `relationship: child` + `parent: 67`
   - Issues with no relationships: `relationship: none` (current behavior, unchanged)

### Alternatives Considered

- **Per-issue GraphQL call**: Simpler code but N+1 API calls per sync run. The bulk approach is preferred for efficiency.
- **Label-based conventions** (e.g. `parent:#67`): Doesn't leverage GitHub's native tracking, creates label proliferation, and is a second source of truth.
- **Keep `relationship: none`**: Status quo — forces downstream consumers to query GitHub directly, which is what the sync action is meant to avoid.

### Additional Context

- The GraphQL fields `trackedIssues` and `trackedInIssues` are part of GitHub's sub-issues feature.
- Downstream consumer: `vig-os/devcontainer` uses the synced files in `.github_data/issues/` for agent-driven triage and dashboards.
- Related discussion: vig-os/devcontainer#82.

### Impact

- Benefits any repo using this action that leverages GitHub's sub-issue tracking.
- Backward compatible — issues without sub-issue relationships continue to get `relationship: none`.
- Adds one extra GraphQL API call per sync run (bulk query for all issues).
---

# [Comment #1]() by [c-vigo]()

_Posted on February 20, 2026 at 11:10 AM_

## Design

### API Change

The issue references `trackedIssues`/`trackedInIssues` GraphQL fields, but GitHub retired tasklists (April 2025). The replacement is `subIssues`/`parentIssue` via GraphQL (requires `GraphQL-Features: sub_issues` header).

### Frontmatter Format

Two fields replace the old `relationship: none` line. Both are always present:

```yaml
parent: none          # single issue number (e.g. 67) or none
children: none        # comma-separated issue numbers (e.g. 61, 63, 80) or none
```

The `relationship` field is removed — it was fully derivable from `parent`/`children`.

### Approach: Supplemental GraphQL Batch Query

Keep existing REST flow unchanged. After collecting all issue numbers from the paginated REST call, make a single GraphQL query (batched with aliases, 50 per batch) to fetch `parentIssue` and `subIssues` for every issue.

**GraphQL query shape (per batch):**
```graphql
query($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    issue_1: issue(number: 1) {
      parentIssue { number }
      subIssues(first: 100) { nodes { number } }
    }
    issue_2: issue(number: 2) { ... }
  }
}
```

### Error Handling

- If the GraphQL call fails (permissions, feature not available, rate limit), catch the error, log a warning, and fall back to `parent: none`, `children: none` for all issues. The action never fails due to relationship fetching.

### Scope

- **In scope:** Issue relationship fetching and frontmatter population
- **Out of scope:** PR relationships (kept as `none`), `projects` field, `subIssuesSummary` data
- **No new action inputs:** Always-on with graceful degradation

