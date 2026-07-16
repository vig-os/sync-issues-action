import * as core from '@actions/core';
import * as github from '@actions/github';
import { createAppAuth } from '@octokit/auth-app';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface Comment {
  id: number;
  body: string;
  body_html?: string | null;
  user: { login: string; html_url: string };
  created_at: string;
  updated_at: string;
  html_url: string;
}

interface Issue {
  number: number;
  title: string;
  body: string;
  body_html?: string | null;
  state: string;
  labels: Array<{ name: string }>;
  created_at: string;
  updated_at: string;
  user: { login: string };
  html_url: string;
  assignees?: Array<{ login: string }>;
  milestone?: { title: string; number: number } | null;
}

interface PullRequest {
  number: number;
  title: string;
  body: string;
  body_html?: string | null;
  state: string;
  labels: Array<{ name: string }>;
  created_at: string;
  updated_at: string;
  user: { login: string };
  html_url: string;
  merged_at: string | null;
  head: { ref: string };
  base: { ref: string };
  assignees?: Array<{ login: string }>;
  milestone?: { title: string; number: number } | null;
}

interface ReviewComment {
  id: number;
  body: string;
  body_html?: string | null;
  user: { login: string; html_url: string };
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

interface ReviewThread {
  root: ReviewComment;
  replies: ReviewComment[];
}

interface IssueRelationship {
  parent: number | null;
  children: number[];
}

const MAX_RETRY_ATTEMPTS = 4;
const INITIAL_RETRY_DELAY_MS = 1000;

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: unknown }).status;
    if (typeof status === 'number') {
      return status;
    }
  }
  return undefined;
}

export function formatGitHubError(error: unknown): string {
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

export function isRetryableError(error: unknown): boolean {
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
    if (
      message.includes('econnreset') ||
      message.includes('etimedout') ||
      message.includes('socket hang up') ||
      message.includes('network')
    ) {
      return true;
    }
  }

  return false;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRY_ATTEMPTS && isRetryableError(error)) {
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        core.warning(
          `${label} failed (attempt ${attempt}/${MAX_RETRY_ATTEMPTS}): ${formatGitHubError(error)}. Retrying in ${delay}ms...`
        );
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

export function runFormatCommand(command: string, files: string[]): void {
  const trimmed = command.trim();
  if (!trimmed) {
    return;
  }
  if (files.length === 0) {
    core.info('No modified files; skipping format-command');
    return;
  }

  // Single-quote each path so spaces and shell metacharacters survive.
  const quoted = files.map((f) => `'${f.replace(/'/g, `'\\''`)}'`).join(' ');
  const resolved = trimmed.split('{files}').join(quoted);

  core.info(`Running format-command on ${files.length} file(s)`);
  try {
    execSync(resolved, { stdio: 'inherit' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`format-command failed: ${message}`);
  }
}

export function parseNumberFilter(input: string): number[] | undefined {
  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }

  const numbers = new Set<number>();

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
      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        start <= 0 ||
        end <= 0
      ) {
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

export interface AttachmentAsset {
  uuid: string;
  ext: string;
  signedUrl: string;
}

export interface AttachmentContext {
  dir: string;
  relativePrefix: string;
  forceUpdate: boolean;
  handled: Set<string>;
  files: string[];
}

// Signed attachment URLs GitHub emits in body_html; valid ~5 minutes, so they
// must be downloaded right after the item is fetched and never written to disk.
const SIGNED_ATTACHMENT_PATTERN =
  /https:\/\/private-user-images\.githubusercontent\.com\/\d+\/\d+-([0-9a-fA-F-]{36})\.(\w+)\?jwt=[\w.~+/=-]+/g;
// Raw-body URL shapes: modern asset uploads, legacy image uploads, file uploads.
const RAW_ASSET_PATTERN = /https:\/\/github\.com\/user-attachments\/assets\/([0-9a-fA-F-]{36})/g;
const RAW_LEGACY_PATTERN =
  /https:\/\/user-images\.githubusercontent\.com\/\d+\/\d+-([0-9a-fA-F-]{36})\.(\w+)/g;
const RAW_FILE_PATTERN = /https:\/\/github\.com\/user-attachments\/files\/(\d+)\/([\w.%-]+)/g;

export function extractAttachmentAssets(bodyHtml: string): Map<string, AttachmentAsset> {
  const assets = new Map<string, AttachmentAsset>();
  for (const match of bodyHtml.matchAll(SIGNED_ATTACHMENT_PATTERN)) {
    const [signedUrl, uuid, ext] = match;
    if (!assets.has(uuid)) {
      assets.set(uuid, { uuid, ext, signedUrl });
    }
  }
  return assets;
}

function sanitizeAttachmentName(name: string): string {
  let decoded = name;
  try {
    decoded = decodeURIComponent(name);
  } catch {
    // Keep the raw name if it is not valid percent-encoding
  }
  return decoded.replace(/[^A-Za-z0-9._-]/g, '_').replace(/^\.+/, '_');
}

async function downloadAttachment(url: string, filepath: string, dir: string): Promise<void> {
  await withRetry(`Download attachment ${path.basename(filepath)}`, async () => {
    const response = await fetch(url);
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status} while downloading attachment`);
      (error as Error & { status: number }).status = response.status;
      throw error;
    }
    const data = Buffer.from(await response.arrayBuffer());
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filepath, data);
  });
}

/**
 * Downloads the attachments referenced in a raw markdown body and rewrites
 * their URLs to relative paths under the attachments directory. Assets whose
 * signed URL is unavailable or whose download fails keep their original URL.
 */
export async function processBodyAttachments(
  body: string,
  bodyHtml: string | null | undefined,
  ctx: AttachmentContext
): Promise<string> {
  if (!body) {
    return body;
  }

  const assets = bodyHtml ? extractAttachmentAssets(bodyHtml) : new Map<string, AttachmentAsset>();
  const targets = new Map<string, { sourceUrl: string; filename: string } | null>();

  for (const match of body.matchAll(RAW_ASSET_PATTERN)) {
    const [rawUrl, uuid] = match;
    if (targets.has(rawUrl)) {
      continue;
    }
    const asset = assets.get(uuid);
    if (!asset) {
      core.warning(`No signed URL found for attachment ${uuid}; keeping original URL`);
      targets.set(rawUrl, null);
      continue;
    }
    targets.set(rawUrl, { sourceUrl: asset.signedUrl, filename: `${uuid}.${asset.ext}` });
  }

  for (const match of body.matchAll(RAW_LEGACY_PATTERN)) {
    const [rawUrl, uuid, ext] = match;
    if (targets.has(rawUrl)) {
      continue;
    }
    // Legacy CDN URLs are directly downloadable; prefer the signed URL when present
    const asset = assets.get(uuid);
    targets.set(rawUrl, {
      sourceUrl: asset ? asset.signedUrl : rawUrl,
      filename: `${uuid}.${asset ? asset.ext : ext}`,
    });
  }

  for (const match of body.matchAll(RAW_FILE_PATTERN)) {
    const [rawUrl, id, name] = match;
    if (targets.has(rawUrl)) {
      continue;
    }
    targets.set(rawUrl, { sourceUrl: rawUrl, filename: `${id}-${sanitizeAttachmentName(name)}` });
  }

  let result = body;
  for (const [rawUrl, target] of targets) {
    if (!target) {
      continue;
    }
    const filepath = path.join(ctx.dir, target.filename);
    if (!ctx.handled.has(target.filename)) {
      if (fs.existsSync(filepath) && !ctx.forceUpdate) {
        ctx.handled.add(target.filename);
      } else {
        try {
          await downloadAttachment(target.sourceUrl, filepath, ctx.dir);
          ctx.handled.add(target.filename);
          ctx.files.push(filepath);
        } catch (error) {
          core.warning(
            `Failed to download attachment ${target.filename}: ${formatGitHubError(error)}`
          );
          continue;
        }
      }
    }
    result = result.split(rawUrl).join(`${ctx.relativePrefix}/${target.filename}`);
  }

  return result;
}

async function run(): Promise<void> {
  try {
    // Get token from input (defaults to github.token via action.yml)
    const tokenInput = core.getInput('token');
    const githubToken = tokenInput || process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error(
        'GitHub token is required. Provide it via the action input "token" or ensure GITHUB_TOKEN is available.'
      );
    }

    // Check if GitHub App credentials are provided
    const appId = core.getInput('app-id') || '';
    const appPrivateKey = core.getInput('app-private-key') || '';
    let appToken: string | undefined;
    let tokenToUse: string = githubToken;

    // Validate app credentials: both must be provided together, or neither
    if ((appId && !appPrivateKey) || (!appId && appPrivateKey)) {
      throw new Error(
        'GitHub App authentication requires both app-id and app-private-key. Provide both or neither.'
      );
    }

    if (appId && appPrivateKey) {
      core.info('GitHub App credentials provided. Generating installation token...');
      try {
        appToken = await generateAppInstallationToken(appId, appPrivateKey);
        tokenToUse = appToken;
        core.info('Using GitHub App installation token for API calls');
      } catch (error) {
        core.warning(
          `Failed to generate GitHub App token: ${error instanceof Error ? error.message : 'Unknown error'}. Falling back to provided token.`
        );
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
    const syncAttachmentsInput = core.getInput('sync-attachments') || 'false';

    // Convert to boolean (getBooleanInput is strict and throws if input is missing)
    const syncIssues = syncIssuesInput.toLowerCase() === 'true';
    const syncPRs = syncPRsInput.toLowerCase() === 'true';
    const includeClosed = includeClosedInput.toLowerCase() === 'true';
    const forceUpdate = forceUpdateInput.toLowerCase() === 'true';
    const syncSubIssues = syncSubIssuesInput.toLowerCase() === 'true';
    const syncAttachments = syncAttachmentsInput.toLowerCase() === 'true';
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
    const modifiedFiles: string[] = [];

    // Attachments live next to issues/ and pull-requests/, so MD files
    // reference them with the same relative prefix from either directory.
    const attachmentCtx: AttachmentContext | undefined = syncAttachments
      ? {
          dir: path.join(outputDir, 'attachments'),
          relativePrefix: '../attachments',
          forceUpdate,
          handled: new Set<string>(),
          files: [],
        }
      : undefined;

    if (syncIssues) {
      core.info('Syncing issues...');
      if (!fs.existsSync(issuesDir)) {
        fs.mkdirSync(issuesDir, { recursive: true });
      }
      const issuesResult = await syncIssuesToMarkdown(
        octokit,
        owner,
        repo,
        issuesDir,
        includeClosed,
        updatedSince,
        forceUpdate,
        syncSubIssues,
        issuesFilter,
        attachmentCtx
      );
      issuesCount = issuesResult.count;
      modifiedFiles.push(...issuesResult.files);
    }

    if (syncPRs) {
      core.info('Syncing pull requests...');
      if (!fs.existsSync(prsDir)) {
        fs.mkdirSync(prsDir, { recursive: true });
      }
      const prsResult = await syncPRsToMarkdown(
        octokit,
        owner,
        repo,
        prsDir,
        includeClosed,
        updatedSince,
        forceUpdate,
        prsFilter,
        attachmentCtx
      );
      prsCount = prsResult.count;
      modifiedFiles.push(...prsResult.files);
    }

    if (attachmentCtx) {
      modifiedFiles.push(...attachmentCtx.files);
    }

    // User formatting hook (#17): runs after files are written and before
    // outputs are set, so the downstream commit step picks up formatted files.
    // Binary attachments are excluded — formatters only get markdown.
    runFormatCommand(
      core.getInput('format-command') || '',
      modifiedFiles.filter((file) => file.endsWith('.md'))
    );

    const lastSyncedAt = new Date().toISOString();
    core.setOutput('issues-count', issuesCount);
    core.setOutput('prs-count', prsCount);
    core.setOutput('last-synced-at', lastSyncedAt);
    core.setOutput('modified-files', modifiedFiles.join(','));
    if (stateFilePath) {
      persistLastSync(stateFilePath, lastSyncedAt);
    }

    core.info('Sync completed successfully!');
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('Unknown error occurred');
    }
  }
}

async function syncIssuesToMarkdown(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  outputDir: string,
  includeClosed: boolean,
  updatedSince?: string,
  forceUpdate = false,
  syncSubIssues = true,
  filterNumbers?: number[],
  attachments?: AttachmentContext
): Promise<{ count: number; files: string[] }> {
  const allIssues: Issue[] = [];

  if (filterNumbers) {
    for (const issueNumber of filterNumbers) {
      try {
        const { data: issue } = await withRetry(`Fetch issue #${issueNumber}`, () =>
          octokit.rest.issues.get({
            owner,
            repo,
            issue_number: issueNumber,
            ...(attachments ? { mediaType: { format: 'full' as const } } : {}),
          })
        );

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

        allIssues.push(issue as Issue);
      } catch (error) {
        core.warning(`Skipping issue #${issueNumber}: ${formatGitHubError(error)}`);
      }
    }
  } else {
    const state = includeClosed ? 'all' : 'open';
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
      let issues;
      try {
        ({ data: issues } = await withRetry(`List issues (page ${page})`, () =>
          octokit.rest.issues.listForRepo({
            owner,
            repo,
            state,
            per_page: perPage,
            page,
            ...(updatedSince ? { since: updatedSince } : {}),
          })
        ));
      } catch (error) {
        core.warning(
          `Failed to list issues (page ${page}): ${formatGitHubError(error)}. Stopping issue sync.`
        );
        break;
      }

      const actualIssues = issues.filter((issue) => !issue.pull_request);
      for (const issue of actualIssues) {
        allIssues.push(issue as Issue);
      }

      hasMore = issues.length === perPage;
      page++;
    }
  }

  const issueNumbers = allIssues.map((issue) => issue.number);
  const relationships = syncSubIssues
    ? await fetchIssueRelationships(octokit, owner, repo, issueNumbers)
    : new Map<number, IssueRelationship>();

  const files: string[] = [];
  let skippedIssues = 0;

  for (const issue of allIssues) {
    try {
      const filename = `issue-${issue.number}.md`;
      const filepath = path.join(outputDir, filename);

      let fullIssue = issue;
      if (!filterNumbers) {
        const { data } = await withRetry(`Fetch issue #${issue.number}`, () =>
          octokit.rest.issues.get({
            owner,
            repo,
            issue_number: issue.number,
            ...(attachments ? { mediaType: { format: 'full' as const } } : {}),
          })
        );
        fullIssue = data as Issue;
      }

      const comments = await fetchComments(octokit, owner, repo, issue.number, !!attachments);
      const relationship = relationships.get(issue.number);

      if (attachments) {
        fullIssue = {
          ...fullIssue,
          body: await processBodyAttachments(fullIssue.body, fullIssue.body_html, attachments),
        };
        for (const comment of comments) {
          comment.body = await processBodyAttachments(
            comment.body,
            comment.body_html,
            attachments
          );
        }
      }

      const content = formatIssueAsMarkdown(fullIssue, comments, relationship);

      if (forceUpdate || hasContentChanged(content, filepath)) {
        fs.writeFileSync(filepath, content, 'utf-8');
        files.push(filepath);
        core.info(
          `Synced issue #${issue.number} with ${comments.length} comment(s) to ${filepath}`
        );
      } else {
        core.info(`Issue #${issue.number} unchanged, skipping write to ${filepath}`);
      }
    } catch (error) {
      skippedIssues++;
      core.warning(`Skipping issue #${issue.number}: ${formatGitHubError(error)}`);
    }
  }

  if (skippedIssues > 0) {
    core.warning(`Skipped ${skippedIssues} issue(s) due to API errors.`);
  }

  return { count: allIssues.length - skippedIssues, files };
}

async function syncPRsToMarkdown(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  outputDir: string,
  includeClosed: boolean,
  updatedSince?: string,
  forceUpdate = false,
  filterNumbers?: number[],
  attachments?: AttachmentContext
): Promise<{ count: number; files: string[] }> {
  let prsCount = 0;
  const files: string[] = [];
  let skippedPRs = 0;

  const processPR = async (fullPR: PullRequest): Promise<void> => {
    const filename = `pr-${fullPR.number}.md`;
    const filepath = path.join(outputDir, filename);

    const comments = await fetchComments(octokit, owner, repo, fullPR.number, !!attachments);
    const reviewComments = await fetchReviewComments(
      octokit,
      owner,
      repo,
      fullPR.number,
      !!attachments
    );

    if (attachments) {
      fullPR = {
        ...fullPR,
        body: await processBodyAttachments(fullPR.body, fullPR.body_html, attachments),
      };
      for (const comment of comments) {
        comment.body = await processBodyAttachments(comment.body, comment.body_html, attachments);
      }
      for (const reviewComment of reviewComments) {
        reviewComment.body = await processBodyAttachments(
          reviewComment.body,
          reviewComment.body_html,
          attachments
        );
      }
    }

    let commits: Array<{
      sha: string;
      commit: { message: string; author: { name: string; date: string } };
      author: { login: string; html_url: string } | null;
      html_url: string;
      stats?: { total?: number; additions?: number; deletions?: number };
      files?: Array<{ filename: string }>;
    }> = [];
    if (fullPR.state === 'closed') {
      commits = await fetchPRCommits(octokit, owner, repo, fullPR.number);
    }

    const content = formatPRAsMarkdown(fullPR, comments, reviewComments, commits);

    if (forceUpdate || hasContentChanged(content, filepath)) {
      fs.writeFileSync(filepath, content, 'utf-8');
      files.push(filepath);
      const commitInfo = commits.length > 0 ? ` with ${commits.length} commit(s)` : '';
      core.info(
        `Synced PR #${fullPR.number}${commitInfo} with ${comments.length + reviewComments.length} comment(s) to ${filepath}`
      );
    } else {
      core.info(`PR #${fullPR.number} unchanged, skipping write to ${filepath}`);
    }
  };

  if (filterNumbers) {
    for (const prNumber of filterNumbers) {
      try {
        const { data: fullPR } = await withRetry(`Fetch PR #${prNumber}`, () =>
          octokit.rest.pulls.get({
            owner,
            repo,
            pull_number: prNumber,
            ...(attachments ? { mediaType: { format: 'full' as const } } : {}),
          })
        );

        if (!includeClosed && fullPR.state === 'closed') {
          core.info(`Skipping PR #${prNumber}: closed and include-closed is false.`);
          continue;
        }

        if (updatedSince && !isUpdatedSince(fullPR.updated_at, updatedSince)) {
          core.info(`Skipping PR #${prNumber}: not updated since ${updatedSince}.`);
          continue;
        }

        await processPR(fullPR as PullRequest);
        prsCount++;
      } catch (error) {
        skippedPRs++;
        core.warning(`Skipping PR #${prNumber}: ${formatGitHubError(error)}`);
      }
    }
  } else {
    const state = includeClosed ? 'all' : 'open';
    let page = 1;
    const perPage = 100;
    let hasMore = true;

    while (hasMore) {
      let prs;
      try {
        ({ data: prs } = await withRetry(`List pull requests (page ${page})`, () =>
          octokit.rest.pulls.list({
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
          })
        ));
      } catch (error) {
        core.warning(
          `Failed to list pull requests (page ${page}): ${formatGitHubError(error)}. Stopping PR sync.`
        );
        break;
      }

      const filteredPRs = updatedSince
        ? prs.filter((pr) => isUpdatedSince(pr.updated_at, updatedSince))
        : prs;
      prsCount += filteredPRs.length;

      for (const pr of filteredPRs) {
        try {
          const { data: fullPR } = await withRetry(`Fetch PR #${pr.number}`, () =>
            octokit.rest.pulls.get({
              owner,
              repo,
              pull_number: pr.number,
              ...(attachments ? { mediaType: { format: 'full' as const } } : {}),
            })
          );

          await processPR(fullPR as PullRequest);
        } catch (error) {
          skippedPRs++;
          prsCount--;
          core.warning(`Skipping PR #${pr.number}: ${formatGitHubError(error)}`);
        }
      }

      if (updatedSince) {
        const lastPR = prs[prs.length - 1];
        const olderThanSince = !lastPR || !isUpdatedSince(lastPR.updated_at, updatedSince);
        hasMore = prs.length === perPage && !olderThanSince;
      } else {
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

async function fetchComments(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  issueNumber: number,
  includeHtml = false
): Promise<Comment[]> {
  const comments: Comment[] = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    try {
      const { data: pageComments } = await withRetry(
        `Fetch comments for #${issueNumber} (page ${page})`,
        () =>
          octokit.rest.issues.listComments({
            owner,
            repo,
            issue_number: issueNumber,
            per_page: perPage,
            page,
            ...(includeHtml ? { mediaType: { format: 'full' as const } } : {}),
          })
      );

      comments.push(...(pageComments as Comment[]));
      hasMore = pageComments.length === perPage;
      page++;
    } catch (error) {
      core.warning(
        `Failed to fetch comments for #${issueNumber}: ${formatGitHubError(error)}`
      );
      break;
    }
  }

  return comments;
}

export const GRAPHQL_BATCH_SIZE = 50;

export async function fetchIssueRelationships(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  issueNumbers: number[]
): Promise<Map<number, IssueRelationship>> {
  const relationships = new Map<number, IssueRelationship>();

  if (issueNumbers.length === 0) {
    return relationships;
  }

  for (let i = 0; i < issueNumbers.length; i += GRAPHQL_BATCH_SIZE) {
    const batch = issueNumbers.slice(i, i + GRAPHQL_BATCH_SIZE);

    const issueFields = batch
      .map(
        (num) =>
          `issue_${num}: issue(number: ${num}) {
            parent { number }
            subIssues(first: 100) { nodes { number } }
          }`
      )
      .join('\n');

    const query = `query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        ${issueFields}
      }
    }`;

    try {
      const response: any = await withRetry(
        `Fetch sub-issue relationships (batch ${Math.floor(i / GRAPHQL_BATCH_SIZE) + 1})`,
        () =>
          octokit.graphql(query, {
            owner,
            repo,
          })
      );

      for (const num of batch) {
        const data = response.repository[`issue_${num}`];
        if (data) {
          relationships.set(num, {
            parent: data.parent?.number ?? null,
            children: (data.subIssues?.nodes ?? []).map((n: any) => n.number),
          });
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      if (message.includes("doesn't exist on type")) {
        core.info(
          'Sub-issues API is not available for this repository. Skipping relationship sync.'
        );
        break;
      }
      core.warning(
        `Failed to fetch sub-issue relationships (batch ${Math.floor(i / GRAPHQL_BATCH_SIZE) + 1}): ${message}`
      );
    }
  }

  return relationships;
}

async function fetchPRCommits(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<
  Array<{
    sha: string;
    commit: { message: string; author: { name: string; date: string } };
    author: { login: string; html_url: string } | null;
    html_url: string;
    stats?: { total?: number; additions?: number; deletions?: number };
    files?: Array<{ filename: string }>;
  }>
> {
  const commits: Array<{
    sha: string;
    commit: { message: string; author: { name: string; date: string } };
    author: { login: string; html_url: string } | null;
    html_url: string;
    stats?: { total?: number; additions?: number; deletions?: number };
    files?: Array<{ filename: string }>;
  }> = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    try {
      const { data: pageCommits } = await withRetry(
        `Fetch commits for PR #${pullNumber} (page ${page})`,
        () =>
          octokit.rest.pulls.listCommits({
            owner,
            repo,
            pull_number: pullNumber,
            per_page: perPage,
            page,
          })
      );

      // Fetch detailed commit info including stats and files
      const commitsWithDetails = await Promise.all(
        pageCommits.map(async (commit) => {
          try {
            const { data: commitDetail } = await withRetry(
              `Fetch commit details ${commit.sha}`,
              () =>
                octokit.rest.repos.getCommit({
                  owner,
                  repo,
                  ref: commit.sha,
                })
            );
            return {
              sha: commit.sha,
              commit: {
                message: commit.commit.message || '',
                author: {
                  name: commit.commit.author?.name || 'Unknown',
                  date:
                    commit.commit.author?.date ||
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
          } catch (error) {
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
        })
      );

      commits.push(...commitsWithDetails);
      hasMore = pageCommits.length === perPage;
      page++;
    } catch (error) {
      core.warning(
        `Failed to fetch commits for PR #${pullNumber}: ${formatGitHubError(error)}`
      );
      break;
    }
  }

  return commits;
}

async function fetchReviewComments(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  pullNumber: number,
  includeHtml = false
): Promise<ReviewComment[]> {
  const reviewComments: ReviewComment[] = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    try {
      const { data: pageComments } = await withRetry(
        `Fetch review comments for PR #${pullNumber} (page ${page})`,
        () =>
          octokit.rest.pulls.listReviewComments({
            owner,
            repo,
            pull_number: pullNumber,
            per_page: perPage,
            page,
            ...(includeHtml ? { mediaType: { format: 'full' as const } } : {}),
          })
      );

      reviewComments.push(...(pageComments as ReviewComment[]));
      hasMore = pageComments.length === perPage;
      page++;
    } catch (error) {
      core.warning(
        `Failed to fetch review comments for PR #${pullNumber}: ${formatGitHubError(error)}`
      );
      break;
    }
  }

  return reviewComments;
}

function groupReviewComments(reviewComments: ReviewComment[]): ReviewThread[] {
  const threads: Map<number, ReviewThread> = new Map();
  const sorted = [...reviewComments].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  for (const comment of sorted) {
    if (!comment.in_reply_to_id) {
      threads.set(comment.id, { root: comment, replies: [] });
    } else {
      const rootThread = threads.get(comment.in_reply_to_id);
      if (rootThread) {
        rootThread.replies.push(comment);
      } else {
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
function normalizeContent(content: string): string {
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
      while (
        contentStart < content.length &&
        (content[contentStart] === '\n' || content[contentStart] === '\r')
      ) {
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
function hasContentChanged(newContent: string, existingFilePath: string): boolean {
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
  } catch (error) {
    // If we can't read the existing file, assume it needs to be written
    core.warning(`Could not read existing file ${existingFilePath}: ${error}`);
    return true;
  }
}

export function formatIssueAsMarkdown(
  issue: Issue,
  comments: Comment[] = [],
  relationship?: IssueRelationship
): string {
  const labels =
    issue.labels && issue.labels.length > 0
      ? issue.labels.map((label) => label.name).join(', ')
      : 'none';
  const assignees =
    issue.assignees && issue.assignees.length > 0
      ? issue.assignees.map((assignee) => assignee.login).join(', ')
      : 'none';
  const milestone = issue.milestone ? issue.milestone.title : 'none';
  const parentField = relationship?.parent != null ? String(relationship.parent) : 'none';
  const childrenField =
    relationship?.children?.length ? relationship.children.join(', ') : 'none';
  const syncedAt = new Date().toISOString();

  // Build YAML frontmatter
  const frontmatter: string[] = [
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

export function formatPRAsMarkdown(
  pr: PullRequest,
  comments: Comment[] = [],
  reviewComments: ReviewComment[] = [],
  commits: Array<{
    sha: string;
    commit: { message: string; author: { name: string; date: string } };
    author: { login: string; html_url: string } | null;
    html_url: string;
    stats?: { total?: number; additions?: number; deletions?: number };
    files?: Array<{ filename: string }>;
  }> = []
): string {
  const labels =
    pr.labels && pr.labels.length > 0 ? pr.labels.map((label) => label.name).join(', ') : 'none';
  const assignees =
    pr.assignees && pr.assignees.length > 0
      ? pr.assignees.map((assignee) => assignee.login).join(', ')
      : 'none';
  const milestone = pr.milestone ? pr.milestone.title : 'none';
  const syncedAt = new Date().toISOString();

  // Build YAML frontmatter
  const frontmatter: string[] = [
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
        commentsSection += `_File: [\`${root.path}${
          root.line ? ` (line ${root.line}${root.side ? ` ${root.side}` : ''})` : ''
        }\`](${root.html_url})_\n\n`;
      } else {
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
          commentsSection += `- **[@${reply.user.login}](${reply.user.html_url})** on ${formatDate(
            reply.created_at
          )} — [link](${reply.html_url})\n\n`;
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
      const filesList =
        commit.files && commit.files.length > 0
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

function renderReviewSnippet(comment: ReviewComment): string | undefined {
  if (comment.diff_hunk) {
    // Use the GitHub-provided diff hunk for accurate historical context
    return ['```diff', comment.diff_hunk.trimEnd(), '```'].join('\n');
  }

  // No diff available; skip snippet
  return undefined;
}

export function formatDate(dateString: string): string {
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
function incrementHeadersIfNeeded(content: string): string {
  if (!content) return content;

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
export function shiftHeadersToMinLevel(content: string, minLevel: number): string {
  if (!content) return content;

  const headerMatches = content.match(/^#{1,6} /gm);
  if (!headerMatches) return content;

  const minCurrentLevel = Math.min(...headerMatches.map((h) => h.length - 1));
  if (minCurrentLevel >= minLevel) return content;

  const shift = minLevel - minCurrentLevel;
  return content.replace(/^(#{1,6}) /gm, (_match, hashes: string) => {
    return '#'.repeat(Math.min(hashes.length + shift, 6)) + ' ';
  });
}

function resolveUpdatedSince(input: string, stateFilePath?: string): string | undefined {
  if (input) {
    return input;
  }

  if (stateFilePath && fs.existsSync(stateFilePath)) {
    try {
      const content = fs.readFileSync(stateFilePath, 'utf-8').trim();
      if (content) {
        core.info(`Restored state from cache: ${stateFilePath} = "${content}"`);
      } else {
        core.info(`State file exists but is empty: ${stateFilePath}`);
      }
      return content || undefined;
    } catch (error) {
      core.warning(
        `Could not read state file at ${stateFilePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return undefined;
    }
  } else if (stateFilePath) {
    core.info(`State file not found (will be created): ${stateFilePath}`);
  }

  return undefined;
}

function persistLastSync(stateFilePath: string, timestamp: string): void {
  try {
    const dir = path.dirname(stateFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(stateFilePath, timestamp, 'utf-8');
    core.info(`Stored last sync timestamp in ${stateFilePath}`);
  } catch (error) {
    core.warning(
      `Failed to persist last sync timestamp: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function isUpdatedSince(updatedAt: string, updatedSince: string): boolean {
  return new Date(updatedAt).getTime() >= new Date(updatedSince).getTime();
}

async function generateAppInstallationToken(appId: string, privateKey: string): Promise<string> {
  const auth = createAppAuth({
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
  let installationId: number | undefined;
  try {
    // Try to get installation for the repository
    const { data: installation } = await appOctokit.rest.apps.getRepoInstallation({
      owner,
      repo,
    });
    installationId = installation.id;
  } catch (error) {
    throw new Error(
      `Failed to get installation ID for ${owner}/${repo}. Make sure the GitHub App is installed on this repository.`
    );
  }

  // Generate installation access token
  const installationAuth = await auth({
    type: 'installation',
    installationId: installationId,
  });

  return installationAuth.token;
}

// Export run for testing
export { run };

// Run the action
run();
