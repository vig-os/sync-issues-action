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
declare function run(): Promise<void>;
export declare function formatIssueAsMarkdown(issue: Issue, comments?: Comment[]): string;
export declare function formatPRAsMarkdown(pr: PullRequest, comments?: Comment[], reviewComments?: ReviewComment[]): string;
export declare function formatDate(dateString: string): string;
export { run };
