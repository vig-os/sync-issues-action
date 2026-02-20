import * as github from '@actions/github';
interface Comment {
    id: number;
    body: string;
    user: {
        login: string;
        html_url: string;
    };
    created_at: string;
    updated_at: string;
    html_url: string;
}
interface Issue {
    number: number;
    title: string;
    body: string;
    state: string;
    labels: Array<{
        name: string;
    }>;
    created_at: string;
    updated_at: string;
    user: {
        login: string;
    };
    html_url: string;
    assignees?: Array<{
        login: string;
    }>;
    milestone?: {
        title: string;
        number: number;
    } | null;
}
interface PullRequest {
    number: number;
    title: string;
    body: string;
    state: string;
    labels: Array<{
        name: string;
    }>;
    created_at: string;
    updated_at: string;
    user: {
        login: string;
    };
    html_url: string;
    merged_at: string | null;
    head: {
        ref: string;
    };
    base: {
        ref: string;
    };
    assignees?: Array<{
        login: string;
    }>;
    milestone?: {
        title: string;
        number: number;
    } | null;
}
interface ReviewComment {
    id: number;
    body: string;
    user: {
        login: string;
        html_url: string;
    };
    created_at: string;
    updated_at: string;
    html_url: string;
    path?: string;
    line?: number | null;
    side?: string | null;
    in_reply_to_id?: number | null;
    pull_request_review_id?: number | null;
    diff_hunk?: string | null;
    original_line?: number | null;
    original_commit_id?: string | null;
}
interface IssueRelationship {
    parent: number | null;
    children: number[];
}
declare function run(): Promise<void>;
export declare function fetchIssueRelationships(octokit: ReturnType<typeof github.getOctokit>, owner: string, repo: string, issueNumbers: number[]): Promise<Map<number, IssueRelationship>>;
export declare function formatIssueAsMarkdown(issue: Issue, comments?: Comment[], relationship?: IssueRelationship): string;
export declare function formatPRAsMarkdown(pr: PullRequest, comments?: Comment[], reviewComments?: ReviewComment[], commits?: Array<{
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            date: string;
        };
    };
    author: {
        login: string;
        html_url: string;
    } | null;
    html_url: string;
    stats?: {
        total?: number;
        additions?: number;
        deletions?: number;
    };
    files?: Array<{
        filename: string;
    }>;
}>): string;
export declare function formatDate(dateString: string): string;
/**
 * Shifts all markdown headers so the shallowest header in the content is at `minLevel`.
 * If the shallowest header already meets or exceeds `minLevel`, the content is returned unchanged.
 * Headers are capped at the maximum markdown level of 6.
 */
export declare function shiftHeadersToMinLevel(content: string, minLevel: number): string;
export { run };
//# sourceMappingURL=index.d.ts.map