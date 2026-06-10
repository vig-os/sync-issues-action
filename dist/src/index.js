"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRAPHQL_BATCH_SIZE = void 0;
exports.formatGitHubError = formatGitHubError;
exports.isRetryableError = isRetryableError;
exports.withRetry = withRetry;
exports.parseNumberFilter = parseNumberFilter;
exports.fetchIssueRelationships = fetchIssueRelationships;
exports.formatIssueAsMarkdown = formatIssueAsMarkdown;
exports.formatPRAsMarkdown = formatPRAsMarkdown;
exports.formatDate = formatDate;
exports.shiftHeadersToMinLevel = shiftHeadersToMinLevel;
exports.run = run;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const auth_app_1 = require("@octokit/auth-app");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const MAX_RETRY_ATTEMPTS = 4;
const INITIAL_RETRY_DELAY_MS = 1000;
function getErrorStatus(error) {
    if (typeof error === 'object' && error !== null && 'status' in error) {
        const status = error.status;
        if (typeof status === 'number') {
            return status;
        }
    }
    return undefined;
}
function formatGitHubError(error) {
    if (!(error instanceof Error)) {
        return 'Unknown error';
    }
    const message = error.message;
    if (message.includes('<!DOCTYPE html>') || message.includes('<title>Unicorn!')) {
        const status = getErrorStatus(error);
        return status
            ? `GitHub returned a ${status} server error`
            : 'GitHub returned a server error (5xx)';
    }
    if (message.length > 500) {
        return `${message.slice(0, 200)}...`;
    }
    return message;
}
function isRetryableError(error) {
    const status = getErrorStatus(error);
    if (status !== undefined) {
        if (status >= 500 && status < 600) {
            return true;
        }
        if (status === 429) {
            return true;
        }
        if (status === 403) {
            const message = error instanceof Error ? error.message : '';
            if (message.toLowerCase().includes('secondary rate limit')) {
                return true;
            }
        }
        return false;
    }
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('<!doctype html>') || message.includes('<title>unicorn!')) {
            return true;
        }
        if (message.includes('econnreset') ||
            message.includes('etimedout') ||
            message.includes('socket hang up') ||
            message.includes('network')) {
            return true;
        }
    }
    return false;
}
async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function withRetry(label, fn) {
    let lastError;
    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt < MAX_RETRY_ATTEMPTS && isRetryableError(error)) {
                const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
                core.warning(`${label} failed (attempt ${attempt}/${MAX_RETRY_ATTEMPTS}): ${formatGitHubError(error)}. Retrying in ${delay}ms...`);
                await sleep(delay);
                continue;
            }
            throw error;
        }
    }
    throw lastError;
}
function parseNumberFilter(input) {
    const trimmed = input.trim();
    if (!trimmed) {
        return undefined;
    }
    const numbers = new Set();
    for (const rawToken of trimmed.split(',')) {
        const token = rawToken.trim();
        if (!token) {
            continue;
        }
        if (token.includes('-')) {
            const parts = token.split('-').map((part) => part.trim());
            if (parts.length !== 2 || !parts[0] || !parts[1]) {
                throw new Error(`Invalid number filter token: "${rawToken.trim()}"`);
            }
            const start = Number(parts[0]);
            const end = Number(parts[1]);
            if (!Number.isInteger(start) ||
                !Number.isInteger(end) ||
                start <= 0 ||
                end <= 0) {
                throw new Error(`Invalid number filter token: "${rawToken.trim()}"`);
            }
            if (start > end) {
                throw new Error(`Invalid number filter range: "${rawToken.trim()}" (start must be <= end)`);
            }
            for (let num = start; num <= end; num++) {
                numbers.add(num);
            }
            continue;
        }
        const value = Number(token);
        if (!Number.isInteger(value) || value <= 0) {
            throw new Error(`Invalid number filter token: "${rawToken.trim()}"`);
        }
        numbers.add(value);
    }
    if (numbers.size === 0) {
        return undefined;
    }
    return Array.from(numbers).sort((a, b) => a - b);
}
async function run() {
    try {
        // Get token from input (defaults to github.token via action.yml)
        const tokenInput = core.getInput('token');
        const githubToken = tokenInput || process.env.GITHUB_TOKEN;
        if (!githubToken) {
            throw new Error('GitHub token is required. Provide it via the action input "token" or ensure GITHUB_TOKEN is available.');
        }
        // Check if GitHub App credentials are provided
        const appId = core.getInput('app-id') || '';
        const appPrivateKey = core.getInput('app-private-key') || '';
        let appToken;
        let tokenToUse = githubToken;
        // Validate app credentials: both must be provided together, or neither
        if ((appId && !appPrivateKey) || (!appId && appPrivateKey)) {
            throw new Error('GitHub App authentication requires both app-id and app-private-key. Provide both or neither.');
        }
        if (appId && appPrivateKey) {
            core.info('GitHub App credentials provided. Generating installation token...');
            try {
                appToken = await generateAppInstallationToken(appId, appPrivateKey);
                tokenToUse = appToken;
                core.info('Using GitHub App installation token for API calls');
            }
            catch (error) {
                core.warning(`Failed to generate GitHub App token: ${error instanceof Error ? error.message : 'Unknown error'}. Falling back to provided token.`);
            }
        }
        // Output tokens for use in workflow
        core.setOutput('app-token', appToken || '');
        core.setOutput('github-token', githubToken);
        const outputDir = core.getInput('output-dir') || 'synced-issues';
        const updatedSinceInput = (core.getInput('updated-since') || '').trim();
        const stateFilePath = (core.getInput('state-file') || '').trim();
        // Use getInput with defaults, then convert to boolean to handle missing inputs
        const syncIssuesInput = core.getInput('sync-issues') || 'true';
        const syncPRsInput = core.getInput('sync-prs') || 'true';
        const includeClosedInput = core.getInput('include-closed') || 'false';
        const forceUpdateInput = core.getInput('force-update') || 'false';
        const syncSubIssuesInput = core.getInput('sync-sub-issues') || 'true';
        // Convert to boolean (getBooleanInput is strict and throws if input is missing)
        const syncIssues = syncIssuesInput.toLowerCase() === 'true';
        const syncPRs = syncPRsInput.toLowerCase() === 'true';
        const includeClosed = includeClosedInput.toLowerCase() === 'true';
        const forceUpdate = forceUpdateInput.toLowerCase() === 'true';
        const syncSubIssues = syncSubIssuesInput.toLowerCase() === 'true';
        const updatedSince = resolveUpdatedSince(updatedSinceInput, stateFilePath);
        const issuesFilter = parseNumberFilter(core.getInput('issues-filter') || '');
        const prsFilter = parseNumberFilter(core.getInput('prs-filter') || '');
        const octokit = github.getOctokit(tokenToUse);
        const context = github.context;
        const owner = context.repo.owner;
        const repo = context.repo.repo;
        let issuesCount = 0;
        let prsCount = 0;
        // Create output directory
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        const issuesDir = path.join(outputDir, 'issues');
        const prsDir = path.join(outputDir, 'pull-requests');
        const modifiedFiles = [];
        if (syncIssues) {
            core.info('Syncing issues...');
            if (!fs.existsSync(issuesDir)) {
                fs.mkdirSync(issuesDir, { recursive: true });
            }
            const issuesResult = await syncIssuesToMarkdown(octokit, owner, repo, issuesDir, includeClosed, updatedSince, forceUpdate, syncSubIssues, issuesFilter);
            issuesCount = issuesResult.count;
            modifiedFiles.push(...issuesResult.files);
        }
        if (syncPRs) {
            core.info('Syncing pull requests...');
            if (!fs.existsSync(prsDir)) {
                fs.mkdirSync(prsDir, { recursive: true });
            }
            const prsResult = await syncPRsToMarkdown(octokit, owner, repo, prsDir, includeClosed, updatedSince, forceUpdate, prsFilter);
            prsCount = prsResult.count;
            modifiedFiles.push(...prsResult.files);
        }
        const lastSyncedAt = new Date().toISOString();
        core.setOutput('issues-count', issuesCount);
        core.setOutput('prs-count', prsCount);
        core.setOutput('last-synced-at', lastSyncedAt);
        core.setOutput('modified-files', modifiedFiles.join(','));
        if (stateFilePath) {
            persistLastSync(stateFilePath, lastSyncedAt);
        }
        core.info('Sync completed successfully!');
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed('Unknown error occurred');
        }
    }
}
async function syncIssuesToMarkdown(octokit, owner, repo, outputDir, includeClosed, updatedSince, forceUpdate = false, syncSubIssues = true, filterNumbers) {
    const allIssues = [];
    if (filterNumbers) {
        for (const issueNumber of filterNumbers) {
            try {
                const { data: issue } = await withRetry(`Fetch issue #${issueNumber}`, () => octokit.rest.issues.get({
                    owner,
                    repo,
                    issue_number: issueNumber,
                }));
                if (issue.pull_request) {
                    core.warning(`Skipping #${issueNumber}: not an issue (pull request).`);
                    continue;
                }
                if (!includeClosed && issue.state === 'closed') {
                    core.info(`Skipping issue #${issueNumber}: closed and include-closed is false.`);
                    continue;
                }
                if (updatedSince && !isUpdatedSince(issue.updated_at, updatedSince)) {
                    core.info(`Skipping issue #${issueNumber}: not updated since ${updatedSince}.`);
                    continue;
                }
                allIssues.push(issue);
            }
            catch (error) {
                core.warning(`Skipping issue #${issueNumber}: ${formatGitHubError(error)}`);
            }
        }
    }
    else {
        const state = includeClosed ? 'all' : 'open';
        let page = 1;
        const perPage = 100;
        let hasMore = true;
        while (hasMore) {
            let issues;
            try {
                ({ data: issues } = await withRetry(`List issues (page ${page})`, () => octokit.rest.issues.listForRepo({
                    owner,
                    repo,
                    state,
                    per_page: perPage,
                    page,
                    ...(updatedSince ? { since: updatedSince } : {}),
                })));
            }
            catch (error) {
                core.warning(`Failed to list issues (page ${page}): ${formatGitHubError(error)}. Stopping issue sync.`);
                break;
            }
            const actualIssues = issues.filter((issue) => !issue.pull_request);
            for (const issue of actualIssues) {
                allIssues.push(issue);
            }
            hasMore = issues.length === perPage;
            page++;
        }
    }
    const issueNumbers = allIssues.map((issue) => issue.number);
    const relationships = syncSubIssues
        ? await fetchIssueRelationships(octokit, owner, repo, issueNumbers)
        : new Map();
    const files = [];
    let skippedIssues = 0;
    for (const issue of allIssues) {
        try {
            const filename = `issue-${issue.number}.md`;
            const filepath = path.join(outputDir, filename);
            let fullIssue = issue;
            if (!filterNumbers) {
                const { data } = await withRetry(`Fetch issue #${issue.number}`, () => octokit.rest.issues.get({
                    owner,
                    repo,
                    issue_number: issue.number,
                }));
                fullIssue = data;
            }
            const comments = await fetchComments(octokit, owner, repo, issue.number);
            const relationship = relationships.get(issue.number);
            const content = formatIssueAsMarkdown(fullIssue, comments, relationship);
            if (forceUpdate || hasContentChanged(content, filepath)) {
                fs.writeFileSync(filepath, content, 'utf-8');
                files.push(filepath);
                core.info(`Synced issue #${issue.number} with ${comments.length} comment(s) to ${filepath}`);
            }
            else {
                core.info(`Issue #${issue.number} unchanged, skipping write to ${filepath}`);
            }
        }
        catch (error) {
            skippedIssues++;
            core.warning(`Skipping issue #${issue.number}: ${formatGitHubError(error)}`);
        }
    }
    if (skippedIssues > 0) {
        core.warning(`Skipped ${skippedIssues} issue(s) due to API errors.`);
    }
    return { count: allIssues.length - skippedIssues, files };
}
async function syncPRsToMarkdown(octokit, owner, repo, outputDir, includeClosed, updatedSince, forceUpdate = false, filterNumbers) {
    let prsCount = 0;
    const files = [];
    let skippedPRs = 0;
    const processPR = async (fullPR) => {
        const filename = `pr-${fullPR.number}.md`;
        const filepath = path.join(outputDir, filename);
        const comments = await fetchComments(octokit, owner, repo, fullPR.number);
        const reviewComments = await fetchReviewComments(octokit, owner, repo, fullPR.number);
        let commits = [];
        if (fullPR.state === 'closed') {
            commits = await fetchPRCommits(octokit, owner, repo, fullPR.number);
        }
        const content = formatPRAsMarkdown(fullPR, comments, reviewComments, commits);
        if (forceUpdate || hasContentChanged(content, filepath)) {
            fs.writeFileSync(filepath, content, 'utf-8');
            files.push(filepath);
            const commitInfo = commits.length > 0 ? ` with ${commits.length} commit(s)` : '';
            core.info(`Synced PR #${fullPR.number}${commitInfo} with ${comments.length + reviewComments.length} comment(s) to ${filepath}`);
        }
        else {
            core.info(`PR #${fullPR.number} unchanged, skipping write to ${filepath}`);
        }
    };
    if (filterNumbers) {
        for (const prNumber of filterNumbers) {
            try {
                const { data: fullPR } = await withRetry(`Fetch PR #${prNumber}`, () => octokit.rest.pulls.get({
                    owner,
                    repo,
                    pull_number: prNumber,
                }));
                if (!includeClosed && fullPR.state === 'closed') {
                    core.info(`Skipping PR #${prNumber}: closed and include-closed is false.`);
                    continue;
                }
                if (updatedSince && !isUpdatedSince(fullPR.updated_at, updatedSince)) {
                    core.info(`Skipping PR #${prNumber}: not updated since ${updatedSince}.`);
                    continue;
                }
                await processPR(fullPR);
                prsCount++;
            }
            catch (error) {
                skippedPRs++;
                core.warning(`Skipping PR #${prNumber}: ${formatGitHubError(error)}`);
            }
        }
    }
    else {
        const state = includeClosed ? 'all' : 'open';
        let page = 1;
        const perPage = 100;
        let hasMore = true;
        while (hasMore) {
            let prs;
            try {
                ({ data: prs } = await withRetry(`List pull requests (page ${page})`, () => octokit.rest.pulls.list({
                    owner,
                    repo,
                    state,
                    per_page: perPage,
                    page,
                    ...(updatedSince
                        ? {
                            sort: 'updated',
                            direction: 'desc',
                        }
                        : {}),
                })));
            }
            catch (error) {
                core.warning(`Failed to list pull requests (page ${page}): ${formatGitHubError(error)}. Stopping PR sync.`);
                break;
            }
            const filteredPRs = updatedSince
                ? prs.filter((pr) => isUpdatedSince(pr.updated_at, updatedSince))
                : prs;
            prsCount += filteredPRs.length;
            for (const pr of filteredPRs) {
                try {
                    const { data: fullPR } = await withRetry(`Fetch PR #${pr.number}`, () => octokit.rest.pulls.get({
                        owner,
                        repo,
                        pull_number: pr.number,
                    }));
                    await processPR(fullPR);
                }
                catch (error) {
                    skippedPRs++;
                    prsCount--;
                    core.warning(`Skipping PR #${pr.number}: ${formatGitHubError(error)}`);
                }
            }
            if (updatedSince) {
                const lastPR = prs[prs.length - 1];
                const olderThanSince = !lastPR || !isUpdatedSince(lastPR.updated_at, updatedSince);
                hasMore = prs.length === perPage && !olderThanSince;
            }
            else {
                hasMore = prs.length === perPage;
            }
            page++;
        }
    }
    if (skippedPRs > 0) {
        core.warning(`Skipped ${skippedPRs} pull request(s) due to API errors.`);
    }
    return { count: prsCount, files };
}
async function fetchComments(octokit, owner, repo, issueNumber) {
    const comments = [];
    let page = 1;
    const perPage = 100;
    let hasMore = true;
    while (hasMore) {
        try {
            const { data: pageComments } = await withRetry(`Fetch comments for #${issueNumber} (page ${page})`, () => octokit.rest.issues.listComments({
                owner,
                repo,
                issue_number: issueNumber,
                per_page: perPage,
                page,
            }));
            comments.push(...pageComments);
            hasMore = pageComments.length === perPage;
            page++;
        }
        catch (error) {
            core.warning(`Failed to fetch comments for #${issueNumber}: ${formatGitHubError(error)}`);
            break;
        }
    }
    return comments;
}
exports.GRAPHQL_BATCH_SIZE = 50;
async function fetchIssueRelationships(octokit, owner, repo, issueNumbers) {
    const relationships = new Map();
    if (issueNumbers.length === 0) {
        return relationships;
    }
    for (let i = 0; i < issueNumbers.length; i += exports.GRAPHQL_BATCH_SIZE) {
        const batch = issueNumbers.slice(i, i + exports.GRAPHQL_BATCH_SIZE);
        const issueFields = batch
            .map((num) => `issue_${num}: issue(number: ${num}) {
            parent { number }
            subIssues(first: 100) { nodes { number } }
          }`)
            .join('\n');
        const query = `query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        ${issueFields}
      }
    }`;
        try {
            const response = await withRetry(`Fetch sub-issue relationships (batch ${Math.floor(i / exports.GRAPHQL_BATCH_SIZE) + 1})`, () => octokit.graphql(query, {
                owner,
                repo,
            }));
            for (const num of batch) {
                const data = response.repository[`issue_${num}`];
                if (data) {
                    relationships.set(num, {
                        parent: data.parent?.number ?? null,
                        children: (data.subIssues?.nodes ?? []).map((n) => n.number),
                    });
                }
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            if (message.includes("doesn't exist on type")) {
                core.info('Sub-issues API is not available for this repository. Skipping relationship sync.');
                break;
            }
            core.warning(`Failed to fetch sub-issue relationships (batch ${Math.floor(i / exports.GRAPHQL_BATCH_SIZE) + 1}): ${message}`);
        }
    }
    return relationships;
}
async function fetchPRCommits(octokit, owner, repo, pullNumber) {
    const commits = [];
    let page = 1;
    const perPage = 100;
    let hasMore = true;
    while (hasMore) {
        try {
            const { data: pageCommits } = await withRetry(`Fetch commits for PR #${pullNumber} (page ${page})`, () => octokit.rest.pulls.listCommits({
                owner,
                repo,
                pull_number: pullNumber,
                per_page: perPage,
                page,
            }));
            // Fetch detailed commit info including stats and files
            const commitsWithDetails = await Promise.all(pageCommits.map(async (commit) => {
                try {
                    const { data: commitDetail } = await withRetry(`Fetch commit details ${commit.sha}`, () => octokit.rest.repos.getCommit({
                        owner,
                        repo,
                        ref: commit.sha,
                    }));
                    return {
                        sha: commit.sha,
                        commit: {
                            message: commit.commit.message || '',
                            author: {
                                name: commit.commit.author?.name || 'Unknown',
                                date: commit.commit.author?.date ||
                                    commit.commit.committer?.date ||
                                    new Date().toISOString(),
                            },
                        },
                        author: commit.author
                            ? {
                                login: commit.author.login || 'unknown',
                                html_url: commit.author.html_url || '',
                            }
                            : null,
                        html_url: commit.html_url,
                        stats: commitDetail.stats,
                        files: commitDetail.files?.map((f) => ({ filename: f.filename })),
                    };
                }
                catch (error) {
                    // Fallback to basic commit info if detail fetch fails
                    core.debug(`Failed to fetch details for commit ${commit.sha}: ${error}`);
                    const commitMessage = commit.commit?.message || '';
                    const commitAuthor = commit.commit?.author;
                    const commitCommitter = commit.commit?.committer;
                    return {
                        sha: commit.sha,
                        commit: {
                            message: commitMessage,
                            author: {
                                name: commitAuthor?.name || commitCommitter?.name || 'Unknown',
                                date: commitAuthor?.date || commitCommitter?.date || new Date().toISOString(),
                            },
                        },
                        author: commit.author
                            ? {
                                login: commit.author.login || 'unknown',
                                html_url: commit.author.html_url || '',
                            }
                            : null,
                        html_url: commit.html_url,
                    };
                }
            }));
            commits.push(...commitsWithDetails);
            hasMore = pageCommits.length === perPage;
            page++;
        }
        catch (error) {
            core.warning(`Failed to fetch commits for PR #${pullNumber}: ${formatGitHubError(error)}`);
            break;
        }
    }
    return commits;
}
async function fetchReviewComments(octokit, owner, repo, pullNumber) {
    const reviewComments = [];
    let page = 1;
    const perPage = 100;
    let hasMore = true;
    while (hasMore) {
        try {
            const { data: pageComments } = await withRetry(`Fetch review comments for PR #${pullNumber} (page ${page})`, () => octokit.rest.pulls.listReviewComments({
                owner,
                repo,
                pull_number: pullNumber,
                per_page: perPage,
                page,
            }));
            reviewComments.push(...pageComments);
            hasMore = pageComments.length === perPage;
            page++;
        }
        catch (error) {
            core.warning(`Failed to fetch review comments for PR #${pullNumber}: ${formatGitHubError(error)}`);
            break;
        }
    }
    return reviewComments;
}
function groupReviewComments(reviewComments) {
    const threads = new Map();
    const sorted = [...reviewComments].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    for (const comment of sorted) {
        if (!comment.in_reply_to_id) {
            threads.set(comment.id, { root: comment, replies: [] });
        }
        else {
            const rootThread = threads.get(comment.in_reply_to_id);
            if (rootThread) {
                rootThread.replies.push(comment);
            }
            else {
                // Fallback: treat orphan replies as their own root to avoid losing data
                threads.set(comment.id, { root: comment, replies: [] });
            }
        }
    }
    return Array.from(threads.values());
}
/**
 * Normalizes markdown content by extracting only the body and comments (excluding all frontmatter).
 * This allows comparing content without metadata that changes on every sync (synced, updated timestamps, etc.).
 */
function normalizeContent(content) {
    // Extract content after the frontmatter (after the closing ---)
    // Frontmatter ends with --- followed by newline(s), then the actual content starts
    const frontmatterEnd1 = content.indexOf('---\n\n');
    const frontmatterEnd2 = content.indexOf('---\r\n\r\n'); // Windows line endings
    const frontmatterEnd = frontmatterEnd1 !== -1 ? frontmatterEnd1 : frontmatterEnd2;
    if (frontmatterEnd === -1) {
        // Fallback: if no frontmatter separator found, try to find just --- followed by content
        const simpleEnd = content.indexOf('---\n');
        if (simpleEnd !== -1) {
            // Find the start of the next non-empty line after ---
            let contentStart = simpleEnd + 4;
            while (contentStart < content.length &&
                (content[contentStart] === '\n' || content[contentStart] === '\r')) {
                contentStart++;
            }
            return content.substring(contentStart).trim();
        }
        // Last resort: remove synced and updated lines only
        return content.replace(/^(synced|updated):\s*.+$/gm, '').trim();
    }
    // Return everything after the frontmatter separator (body + comments)
    const separatorLength = frontmatterEnd1 !== -1 ? 5 : 7; // ---\n\n or ---\r\n\r\n
    return content.substring(frontmatterEnd + separatorLength).trim();
}
/**
 * Compares two markdown files ignoring all frontmatter metadata.
 * Returns true if the actual content (body and comments) is different.
 */
function hasContentChanged(newContent, existingFilePath) {
    if (!fs.existsSync(existingFilePath)) {
        return true; // File doesn't exist, so it needs to be created
    }
    try {
        const existingContent = fs.readFileSync(existingFilePath, 'utf-8');
        const normalizedNew = normalizeContent(newContent).trim();
        const normalizedExisting = normalizeContent(existingContent).trim();
        const changed = normalizedNew !== normalizedExisting;
        if (!changed) {
            core.debug(`Content unchanged for ${existingFilePath} (excluding synced timestamp)`);
        }
        return changed;
    }
    catch (error) {
        // If we can't read the existing file, assume it needs to be written
        core.warning(`Could not read existing file ${existingFilePath}: ${error}`);
        return true;
    }
}
function formatIssueAsMarkdown(issue, comments = [], relationship) {
    const labels = issue.labels && issue.labels.length > 0
        ? issue.labels.map((label) => label.name).join(', ')
        : 'none';
    const assignees = issue.assignees && issue.assignees.length > 0
        ? issue.assignees.map((assignee) => assignee.login).join(', ')
        : 'none';
    const milestone = issue.milestone ? issue.milestone.title : 'none';
    const parentField = relationship?.parent != null ? String(relationship.parent) : 'none';
    const childrenField = relationship?.children?.length ? relationship.children.join(', ') : 'none';
    const syncedAt = new Date().toISOString();
    // Build YAML frontmatter
    const frontmatter = [
        '---',
        `type: issue`,
        `state: ${issue.state}`,
        `created: ${issue.created_at}`,
        `updated: ${issue.updated_at}`,
        `author: ${issue.user.login}`,
        `author_url: https://github.com/${issue.user.login}`,
        `url: ${issue.html_url}`,
        `comments: ${comments.length}`,
        `labels: ${labels}`,
        `assignees: ${assignees}`,
        `milestone: ${milestone}`,
        `projects: none`,
        `parent: ${parentField}`,
        `children: ${childrenField}`,
        `synced: ${syncedAt}`,
        '---',
    ];
    let commentsSection = '';
    if (comments.length > 0) {
        comments.forEach((comment, index) => {
            const commentBody = incrementHeadersIfNeeded(comment.body);
            commentsSection += `---\n\n`;
            commentsSection += `# [Comment #${index + 1}]() by [${comment.user.login}]()\n\n`;
            commentsSection += `_Posted on ${formatDate(comment.created_at)}_\n\n`;
            commentsSection += `${commentBody}\n\n`;
        });
    }
    const issueBody = incrementHeadersIfNeeded(issue.body || '_No description provided._');
    return `${frontmatter.join('\n')}

# [Issue ${issue.number}]: [${issue.title}](${issue.html_url})

${issueBody}
${commentsSection}`;
}
function formatPRAsMarkdown(pr, comments = [], reviewComments = [], commits = []) {
    const labels = pr.labels && pr.labels.length > 0 ? pr.labels.map((label) => label.name).join(', ') : 'none';
    const assignees = pr.assignees && pr.assignees.length > 0
        ? pr.assignees.map((assignee) => assignee.login).join(', ')
        : 'none';
    const milestone = pr.milestone ? pr.milestone.title : 'none';
    const syncedAt = new Date().toISOString();
    // Build YAML frontmatter
    const frontmatter = [
        '---',
        `type: pull_request`,
        `state: ${pr.state}${pr.merged_at ? ' (merged)' : ''}`,
        `branch: ${pr.head.ref} → ${pr.base.ref}`,
        `created: ${pr.created_at}`,
        `updated: ${pr.updated_at}`,
        `author: ${pr.user.login}`,
        `author_url: https://github.com/${pr.user.login}`,
        `url: ${pr.html_url}`,
        `comments: ${comments.length + reviewComments.length}`,
        `labels: ${labels}`,
        `assignees: ${assignees}`,
        `milestone: ${milestone}`,
        `projects: none`,
    ];
    if (pr.merged_at) {
        frontmatter.push(`merged: ${pr.merged_at}`);
    }
    frontmatter.push(`synced: ${syncedAt}`);
    frontmatter.push('---');
    let commentsSection = '';
    if (comments.length > 0) {
        commentsSection += `\n\n---\n---\n\n# Comments (${comments.length})\n\n`;
        comments.forEach((comment, index) => {
            commentsSection += `## [Comment #${index + 1}](${comment.html_url}) by [@${comment.user.login}](${comment.user.html_url})\n\n`;
            commentsSection += `_Posted on ${formatDate(comment.created_at)}_\n\n`;
            const commentBody = shiftHeadersToMinLevel(comment.body, 3);
            commentsSection += `${commentBody}\n\n---\n\n`;
        });
    }
    if (reviewComments.length > 0) {
        const threads = groupReviewComments(reviewComments);
        // Remove trailing separator from comments section if it exists
        if (commentsSection.endsWith('\n---\n\n')) {
            commentsSection = commentsSection.slice(0, -7);
        }
        commentsSection += `\n\n---\n---\n\n## Review Threads (${threads.length})\n\n`;
        threads.forEach((thread) => {
            const root = thread.root;
            commentsSection += `### Review by [@${root.user.login}](${root.user.html_url})\n\n`;
            commentsSection += `_Posted on ${formatDate(root.created_at)}_\n\n`;
            if (root.path) {
                commentsSection += `_File: [\`${root.path}${root.line ? ` (line ${root.line}${root.side ? ` ${root.side}` : ''})` : ''}\`](${root.html_url})_\n\n`;
            }
            else {
                commentsSection += `_Link: ${root.html_url}_\n\n`;
            }
            const snippet = renderReviewSnippet(root);
            if (snippet) {
                commentsSection += `${snippet}\n\n`;
            }
            commentsSection += `${root.body}\n\n`;
            if (thread.replies.length > 0) {
                commentsSection += `Conversation:\n\n`;
                thread.replies.forEach((reply) => {
                    commentsSection += `- **[@${reply.user.login}](${reply.user.html_url})** on ${formatDate(reply.created_at)} — [link](${reply.html_url})\n\n`;
                    commentsSection += `  ${reply.body}\n\n`;
                });
            }
            commentsSection += `---\n\n`;
        });
        // Remove trailing separator if Commits will follow
        if (commits.length > 0) {
            commentsSection = commentsSection.replace(/\n---\n\n$/, '');
        }
    }
    let commitsSection = '';
    if (commits.length > 0) {
        // Remove trailing separator from comments/review section if it exists
        if (commentsSection.endsWith('\n---\n\n')) {
            commentsSection = commentsSection.slice(0, -7);
        }
        commitsSection += '\n\n---\n---\n\n## Commits\n';
        commits.forEach((commit, index) => {
            const shortSha = commit.sha.substring(0, 7);
            const authorName = commit.author?.login || commit.commit.author.name;
            const authorUrl = commit.author?.html_url || `https://github.com/${authorName}`;
            const commitDate = formatDate(commit.commit.author.date);
            const commitMessage = commit.commit.message.split('\n')[0]; // First line only
            const filesCount = commit.stats?.total ?? commit.files?.length ?? 0;
            const filesList = commit.files && commit.files.length > 0
                ? commit.files.map((f) => f.filename).join(', ')
                : '';
            // Single line before each commit
            commitsSection += '\n';
            commitsSection += `### Commit ${index + 1}: [${shortSha}](${commit.html_url}) by [${authorName}](${authorUrl}) on ${commitDate}\n`;
            commitsSection += `${commitMessage}`;
            if (filesCount > 0) {
                commitsSection += `, ${filesCount} file${filesCount !== 1 ? 's' : ''} modified`;
                if (filesList && filesList.length < 200) {
                    commitsSection += ` (${filesList})`;
                }
            }
            commitsSection += '\n';
        });
    }
    return `${frontmatter.join('\n')}

# [PR ${pr.number}](${pr.html_url}) ${pr.title}

${pr.body || '_No description provided._'}
${commentsSection}${commitsSection}`;
}
function renderReviewSnippet(comment) {
    if (comment.diff_hunk) {
        // Use the GitHub-provided diff hunk for accurate historical context
        return ['```diff', comment.diff_hunk.trimEnd(), '```'].join('\n');
    }
    // No diff available; skip snippet
    return undefined;
}
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
/**
 * Checks if content starts with a top-level header (# ) and increments all headers by one level if so.
 * Headers at the maximum level (######) are left unchanged since markdown only supports up to 6 levels.
 */
function incrementHeadersIfNeeded(content) {
    if (!content)
        return content;
    // Check if content starts with a top-level header (# )
    const trimmed = content.trimStart();
    if (!trimmed.startsWith('# ')) {
        return content;
    }
    // Increment all headers by one level, but don't increment headers already at max level (######)
    return content.replace(/^(#{1,6})\s/gm, (match, hashes) => {
        // If header is already at max level (6 hashes), leave it unchanged
        if (hashes.length >= 6) {
            return match;
        }
        // Otherwise, increment by one level
        return hashes + '# ';
    });
}
/**
 * Shifts all markdown headers so the shallowest header in the content is at `minLevel`.
 * If the shallowest header already meets or exceeds `minLevel`, the content is returned unchanged.
 * Headers are capped at the maximum markdown level of 6.
 */
function shiftHeadersToMinLevel(content, minLevel) {
    if (!content)
        return content;
    const headerMatches = content.match(/^#{1,6} /gm);
    if (!headerMatches)
        return content;
    const minCurrentLevel = Math.min(...headerMatches.map((h) => h.length - 1));
    if (minCurrentLevel >= minLevel)
        return content;
    const shift = minLevel - minCurrentLevel;
    return content.replace(/^(#{1,6}) /gm, (_match, hashes) => {
        return '#'.repeat(Math.min(hashes.length + shift, 6)) + ' ';
    });
}
function resolveUpdatedSince(input, stateFilePath) {
    if (input) {
        return input;
    }
    if (stateFilePath && fs.existsSync(stateFilePath)) {
        try {
            const content = fs.readFileSync(stateFilePath, 'utf-8').trim();
            if (content) {
                core.info(`Restored state from cache: ${stateFilePath} = "${content}"`);
            }
            else {
                core.info(`State file exists but is empty: ${stateFilePath}`);
            }
            return content || undefined;
        }
        catch (error) {
            core.warning(`Could not read state file at ${stateFilePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return undefined;
        }
    }
    else if (stateFilePath) {
        core.info(`State file not found (will be created): ${stateFilePath}`);
    }
    return undefined;
}
function persistLastSync(stateFilePath, timestamp) {
    try {
        const dir = path.dirname(stateFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(stateFilePath, timestamp, 'utf-8');
        core.info(`Stored last sync timestamp in ${stateFilePath}`);
    }
    catch (error) {
        core.warning(`Failed to persist last sync timestamp: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
function isUpdatedSince(updatedAt, updatedSince) {
    return new Date(updatedAt).getTime() >= new Date(updatedSince).getTime();
}
async function generateAppInstallationToken(appId, privateKey) {
    const auth = (0, auth_app_1.createAppAuth)({
        appId: appId,
        privateKey: privateKey,
    });
    const context = github.context;
    const owner = context.repo.owner;
    const repo = context.repo.repo;
    // First, authenticate as the app to get installation ID
    const appAuth = await auth({ type: 'app' });
    const appOctokit = github.getOctokit(appAuth.token);
    // Get the installation ID for this repository
    let installationId;
    try {
        // Try to get installation for the repository
        const { data: installation } = await appOctokit.rest.apps.getRepoInstallation({
            owner,
            repo,
        });
        installationId = installation.id;
    }
    catch (error) {
        throw new Error(`Failed to get installation ID for ${owner}/${repo}. Make sure the GitHub App is installed on this repository.`);
    }
    // Generate installation access token
    const installationAuth = await auth({
        type: 'installation',
        installationId: installationId,
    });
    return installationAuth.token;
}
// Run the action
run();
