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
// Import the functions to test
// Mocks are set up in setup.ts which runs before this file
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const index_1 = require("../../index");
describe('Sync Issues Action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('formatDate', () => {
        it('should format date correctly', () => {
            const dateString = '2024-01-15T10:30:00Z';
            const formatted = (0, index_1.formatDate)(dateString);
            expect(formatted).toContain('2024');
            expect(formatted).toContain('January');
        });
    });
    describe('formatIssueAsMarkdown', () => {
        it('should format open issue correctly', () => {
            const issue = {
                number: 1,
                title: 'Test Issue',
                body: 'This is a test issue',
                state: 'open',
                labels: [{ name: 'bug' }, { name: 'urgent' }],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/issues/1',
            };
            const markdown = (0, index_1.formatIssueAsMarkdown)(issue, []);
            expect(markdown).toContain('# [Issue 1]:');
            expect(markdown).toContain('[Test Issue](https://github.com/test/repo/issues/1)');
            expect(markdown).toContain('This is a test issue');
            expect(markdown).not.toContain('## Description');
            expect(markdown).toContain('labels: bug, urgent');
            expect(markdown).toContain('author: testuser');
            expect(markdown).toContain('type: issue');
            expect(markdown).toContain('---');
            expect(markdown).toContain('state: open');
        });
        it('should format issue with assignees and milestone', () => {
            const issue = {
                number: 12,
                title: 'Issue with metadata',
                body: 'Issue body',
                state: 'open',
                labels: [{ name: 'enhancement' }],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/issues/12',
                assignees: [{ login: 'assignee1' }, { login: 'assignee2' }],
                milestone: { title: 'Sprint 1', number: 1 },
            };
            const markdown = (0, index_1.formatIssueAsMarkdown)(issue, []);
            expect(markdown).toContain('assignees: assignee1, assignee2');
            expect(markdown).toContain('milestone: Sprint 1');
            expect(markdown).toContain('labels: enhancement');
        });
        it('should format issue without assignees or milestone', () => {
            const issue = {
                number: 13,
                title: 'Issue without metadata',
                body: 'Issue body',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/issues/13',
            };
            const markdown = (0, index_1.formatIssueAsMarkdown)(issue, []);
            expect(markdown).toContain('assignees: none');
            expect(markdown).toContain('milestone: none');
            expect(markdown).toContain('labels: none');
        });
        it('should format closed issue correctly', () => {
            const issue = {
                number: 2,
                title: 'Closed Issue',
                body: 'This is closed',
                state: 'closed',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/issues/2',
            };
            const markdown = (0, index_1.formatIssueAsMarkdown)(issue, []);
            expect(markdown).toContain('# [Issue 2]:');
            expect(markdown).toContain('[Closed Issue](https://github.com/test/repo/issues/2)');
            expect(markdown).not.toContain('## Description');
            expect(markdown).toContain('state: closed');
            expect(markdown).toContain('type: issue');
        });
        it('should handle issue without body', () => {
            const issue = {
                number: 3,
                title: 'No Body Issue',
                body: '',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-15T10:30:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/issues/3',
            };
            const markdown = (0, index_1.formatIssueAsMarkdown)(issue, []);
            expect(markdown).toContain('_No description provided._');
        });
        it('should include comments when provided', () => {
            const issue = {
                number: 4,
                title: 'Issue with Comments',
                body: 'This issue has comments',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/issues/4',
            };
            const comments = [
                {
                    id: 1,
                    body: 'This is a comment',
                    user: { login: 'commenter', html_url: 'https://github.com/commenter' },
                    created_at: '2024-01-16T10:30:00Z',
                    updated_at: '2024-01-16T10:30:00Z',
                    html_url: 'https://github.com/test/repo/issues/4#issuecomment-1',
                },
            ];
            const markdown = (0, index_1.formatIssueAsMarkdown)(issue, comments);
            expect(markdown).not.toContain('## Comments');
            expect(markdown).toContain('# [Comment #1]()');
            expect(markdown).toContain('by [commenter]()');
            expect(markdown).toContain('This is a comment');
            expect(markdown).toContain('comments: 1');
            expect(markdown).toContain('_Posted on');
            // Check that --- separator appears before comment
            const commentIndex = markdown.indexOf('# [Comment #1]()');
            const beforeComment = markdown.substring(0, commentIndex);
            expect(beforeComment).toContain('---');
        });
        it('should increment headers when issue body starts with top-level header', () => {
            const issue = {
                number: 5,
                title: 'Issue with Headers',
                body: '# Main Title\n\n## Subtitle\n\nSome content\n\n### Sub-subtitle\n\nMore content',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/issues/5',
            };
            const markdown = (0, index_1.formatIssueAsMarkdown)(issue, []);
            // Headers should be incremented
            expect(markdown).toContain('## Main Title');
            expect(markdown).toContain('### Subtitle');
            expect(markdown).toContain('#### Sub-subtitle');
            // Check that original top-level header is not present (as standalone line)
            const bodyStart = markdown.indexOf('# [Issue 5]:');
            const bodySection = markdown.substring(bodyStart);
            // Should not have the original # Main Title as a standalone header line
            expect(bodySection).not.toMatch(/^# Main Title$/m);
            expect(bodySection).not.toMatch(/^## Subtitle$/m);
            expect(bodySection).not.toMatch(/^### Sub-subtitle$/m);
        });
        it('should not increment headers when issue body does not start with top-level header', () => {
            const issue = {
                number: 6,
                title: 'Issue without Top Header',
                body: '## Subtitle\n\nSome content\n\n### Sub-subtitle',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/issues/6',
            };
            const markdown = (0, index_1.formatIssueAsMarkdown)(issue, []);
            // Headers should remain unchanged
            expect(markdown).toContain('## Subtitle');
            expect(markdown).toContain('### Sub-subtitle');
            // Should not have incremented versions
            expect(markdown).not.toContain('### Subtitle');
            expect(markdown).not.toContain('#### Sub-subtitle');
        });
        it('should increment headers in comments when comment body starts with top-level header', () => {
            const issue = {
                number: 7,
                title: 'Issue with Header Comments',
                body: 'Regular body',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/issues/7',
            };
            const comments = [
                {
                    id: 1,
                    body: '# Comment Title\n\n## Comment Subtitle\n\nComment content',
                    user: { login: 'commenter', html_url: 'https://github.com/commenter' },
                    created_at: '2024-01-16T10:30:00Z',
                    updated_at: '2024-01-16T10:30:00Z',
                    html_url: 'https://github.com/test/repo/issues/7#issuecomment-1',
                },
            ];
            const markdown = (0, index_1.formatIssueAsMarkdown)(issue, comments);
            // Comment headers should be incremented
            expect(markdown).toContain('## Comment Title');
            expect(markdown).toContain('### Comment Subtitle');
            // Check that original headers are not present as standalone lines in comment section
            const commentSection = markdown.substring(markdown.indexOf('# [Comment #1]()'));
            expect(commentSection).not.toMatch(/^# Comment Title$/m);
            expect(commentSection).not.toMatch(/^## Comment Subtitle$/m);
        });
        it('should not increment headers in comments when comment body does not start with top-level header', () => {
            const issue = {
                number: 9,
                title: 'Issue with Regular Comments',
                body: 'Regular body',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/issues/9',
            };
            const comments = [
                {
                    id: 1,
                    body: '## Comment Subtitle\n\nComment content\n\n### Sub-subtitle',
                    user: { login: 'commenter', html_url: 'https://github.com/commenter' },
                    created_at: '2024-01-16T10:30:00Z',
                    updated_at: '2024-01-16T10:30:00Z',
                    html_url: 'https://github.com/test/repo/issues/9#issuecomment-1',
                },
            ];
            const markdown = (0, index_1.formatIssueAsMarkdown)(issue, comments);
            // Comment headers should remain unchanged
            expect(markdown).toContain('## Comment Subtitle');
            expect(markdown).toContain('### Sub-subtitle');
            // Should not have incremented versions
            expect(markdown).not.toContain('### Comment Subtitle');
            expect(markdown).not.toContain('#### Sub-subtitle');
        });
        it('should handle headers at maximum level (######) by leaving them unchanged', () => {
            const issue = {
                number: 10,
                title: 'Issue with Max Level Headers',
                body: '# Main Title\n\n## Subtitle\n\n### Level 3\n\n#### Level 4\n\n##### Level 5\n\n###### Level 6 (max)',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/issues/10',
            };
            const markdown = (0, index_1.formatIssueAsMarkdown)(issue, []);
            // Headers should be incremented up to level 6
            expect(markdown).toContain('## Main Title');
            expect(markdown).toContain('### Subtitle');
            expect(markdown).toContain('#### Level 3');
            expect(markdown).toContain('##### Level 4');
            expect(markdown).toContain('###### Level 5');
            // Level 6 header should remain unchanged (can't increment beyond max)
            expect(markdown).toContain('###### Level 6 (max)');
            // Should not have invalid 7-level header
            expect(markdown).not.toContain('#######');
        });
        it('should handle comment with headers at maximum level', () => {
            const issue = {
                number: 11,
                title: 'Issue with Max Level Comment Headers',
                body: 'Regular body',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/issues/11',
            };
            const comments = [
                {
                    id: 1,
                    body: '# Comment Title\n\n## Subtitle\n\n###### Max Level Header',
                    user: { login: 'commenter', html_url: 'https://github.com/commenter' },
                    created_at: '2024-01-16T10:30:00Z',
                    updated_at: '2024-01-16T10:30:00Z',
                    html_url: 'https://github.com/test/repo/issues/11#issuecomment-1',
                },
            ];
            const markdown = (0, index_1.formatIssueAsMarkdown)(issue, comments);
            // Comment headers should be incremented
            expect(markdown).toContain('## Comment Title');
            expect(markdown).toContain('### Subtitle');
            // Max level header should remain unchanged
            expect(markdown).toContain('###### Max Level Header');
            // Should not have invalid 7-level header
            expect(markdown).not.toContain('#######');
        });
        it('should handle multiple comments with proper separators', () => {
            const issue = {
                number: 8,
                title: 'Issue with Multiple Comments',
                body: 'Issue body',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/issues/8',
            };
            const comments = [
                {
                    id: 1,
                    body: 'First comment',
                    user: { login: 'user1', html_url: 'https://github.com/user1' },
                    created_at: '2024-01-16T10:30:00Z',
                    updated_at: '2024-01-16T10:30:00Z',
                    html_url: 'https://github.com/test/repo/issues/8#issuecomment-1',
                },
                {
                    id: 2,
                    body: 'Second comment',
                    user: { login: 'user2', html_url: 'https://github.com/user2' },
                    created_at: '2024-01-16T11:00:00Z',
                    updated_at: '2024-01-16T11:00:00Z',
                    html_url: 'https://github.com/test/repo/issues/8#issuecomment-2',
                },
            ];
            const markdown = (0, index_1.formatIssueAsMarkdown)(issue, comments);
            expect(markdown).toContain('# [Comment #1]()');
            expect(markdown).toContain('by [user1]()');
            expect(markdown).toContain('First comment');
            expect(markdown).toContain('# [Comment #2]()');
            expect(markdown).toContain('by [user2]()');
            expect(markdown).toContain('Second comment');
            // Check separators
            const comment1Index = markdown.indexOf('# [Comment #1]()');
            const comment2Index = markdown.indexOf('# [Comment #2]()');
            const betweenComments = markdown.substring(comment1Index, comment2Index);
            expect(betweenComments).toContain('---');
        });
        it('should include parent field when issue has a parent', () => {
            const issue = {
                number: 20,
                title: 'Child Issue',
                body: 'I am a sub-issue',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/issues/20',
            };
            const relationship = { parent: 67, children: [] };
            const markdown = (0, index_1.formatIssueAsMarkdown)(issue, [], relationship);
            expect(markdown).toContain('parent: 67');
            expect(markdown).toContain('children: none');
            expect(markdown).not.toContain('relationship:');
        });
        it('should include children field when issue has sub-issues', () => {
            const issue = {
                number: 30,
                title: 'Parent Issue',
                body: 'I have sub-issues',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/issues/30',
            };
            const relationship = { parent: null, children: [61, 63, 80] };
            const markdown = (0, index_1.formatIssueAsMarkdown)(issue, [], relationship);
            expect(markdown).toContain('parent: none');
            expect(markdown).toContain('children: 61, 63, 80');
            expect(markdown).not.toContain('relationship:');
        });
        it('should include both parent and children when issue is nested', () => {
            const issue = {
                number: 40,
                title: 'Nested Issue',
                body: 'I am both parent and child',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/issues/40',
            };
            const relationship = { parent: 10, children: [61, 63] };
            const markdown = (0, index_1.formatIssueAsMarkdown)(issue, [], relationship);
            expect(markdown).toContain('parent: 10');
            expect(markdown).toContain('children: 61, 63');
            expect(markdown).not.toContain('relationship:');
        });
        it('should default to none for both fields when no relationship provided', () => {
            const issue = {
                number: 50,
                title: 'Standalone Issue',
                body: 'No relationships',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/issues/50',
            };
            const markdown = (0, index_1.formatIssueAsMarkdown)(issue, []);
            expect(markdown).toContain('parent: none');
            expect(markdown).toContain('children: none');
            expect(markdown).not.toContain('relationship:');
        });
    });
    describe('formatPRAsMarkdown', () => {
        it('should format open PR correctly', () => {
            const pr = {
                number: 1,
                title: 'Test PR',
                body: 'This is a test PR',
                state: 'open',
                labels: [{ name: 'feature' }],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                merged_at: null,
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/pull/1',
                head: { ref: 'feature-branch' },
                base: { ref: 'main' },
            };
            const markdown = (0, index_1.formatPRAsMarkdown)(pr, []);
            expect(markdown).toContain('# [PR 1]');
            expect(markdown).toContain('Test PR');
            expect(markdown).toContain('feature-branch');
            expect(markdown).toContain('main');
            expect(markdown).toContain('This is a test PR');
            expect(markdown).toContain('branch: feature-branch → main');
            expect(markdown).toContain('type: pull_request');
            expect(markdown).not.toContain('## Description');
        });
        it('should format merged PR correctly', () => {
            const pr = {
                number: 2,
                title: 'Merged PR',
                body: 'This was merged',
                state: 'closed',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                merged_at: '2024-01-16T11:00:00Z',
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/pull/2',
                head: { ref: 'feature-branch' },
                base: { ref: 'main' },
            };
            const markdown = (0, index_1.formatPRAsMarkdown)(pr, []);
            expect(markdown).toContain('# [PR 2]');
            expect(markdown).toContain('Merged PR');
            expect(markdown).toContain('state: closed (merged)');
            expect(markdown).toContain('merged:');
            expect(markdown).toContain('type: pull_request');
        });
        it('should format closed PR correctly', () => {
            const pr = {
                number: 3,
                title: 'Closed PR',
                body: 'This was closed',
                state: 'closed',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                merged_at: null,
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/pull/3',
                head: { ref: 'feature-branch' },
                base: { ref: 'main' },
            };
            const markdown = (0, index_1.formatPRAsMarkdown)(pr, []);
            expect(markdown).toContain('# [PR 3]');
            expect(markdown).toContain('Closed PR');
            expect(markdown).toContain('state: closed');
            expect(markdown).toContain('type: pull_request');
            expect(markdown).not.toContain('merged:');
        });
        it('should include commits section for closed PR with commits', () => {
            const pr = {
                number: 7,
                title: 'Closed PR with commits',
                body: 'This PR has commits',
                state: 'closed',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                merged_at: null,
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/pull/7',
                head: { ref: 'feature-branch' },
                base: { ref: 'main' },
            };
            const commits = [
                {
                    sha: 'abc1234567890def',
                    commit: {
                        message: 'feat: add new feature',
                        author: { name: 'Author Name', date: '2024-01-16T10:00:00Z' },
                    },
                    author: { login: 'authoruser', html_url: 'https://github.com/authoruser' },
                    html_url: 'https://github.com/test/repo/commit/abc1234',
                    stats: { total: 5 },
                    files: [{ filename: 'src/file1.ts' }, { filename: 'src/file2.ts' }],
                },
                {
                    sha: 'def9876543210abc',
                    commit: {
                        message: 'fix: resolve bug',
                        author: { name: 'Fixer Name', date: '2024-01-16T10:15:00Z' },
                    },
                    author: { login: 'fixeruser', html_url: 'https://github.com/fixeruser' },
                    html_url: 'https://github.com/test/repo/commit/def9876',
                    stats: { total: 2 },
                    files: [{ filename: 'src/file3.ts' }],
                },
            ];
            const markdown = (0, index_1.formatPRAsMarkdown)(pr, [], [], commits);
            expect(markdown).toContain('## Commits');
            expect(markdown).toContain('### Commit 1: [abc1234]');
            expect(markdown).toContain('feat: add new feature');
            expect(markdown).toContain('by [authoruser]');
            expect(markdown).toContain('5 files modified');
            expect(markdown).toContain('### Commit 2: [def9876]');
            expect(markdown).toContain('fix: resolve bug');
            expect(markdown).toContain('by [fixeruser]');
            expect(markdown).toContain('2 files modified');
        });
        it('should not include commits section for open PR', () => {
            const pr = {
                number: 8,
                title: 'Open PR',
                body: 'This PR is open',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                merged_at: null,
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/pull/8',
                head: { ref: 'feature-branch' },
                base: { ref: 'main' },
            };
            const markdown = (0, index_1.formatPRAsMarkdown)(pr, [], [], []);
            expect(markdown).not.toContain('## Commits');
        });
        it('should format commit without author login using commit author name', () => {
            const pr = {
                number: 9,
                title: 'PR with commit',
                body: 'PR body',
                state: 'closed',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                merged_at: null,
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/pull/9',
                head: { ref: 'feature-branch' },
                base: { ref: 'main' },
            };
            const commits = [
                {
                    sha: 'abc1234567890def',
                    commit: {
                        message: 'feat: add feature',
                        author: { name: 'Commit Author', date: '2024-01-16T10:00:00Z' },
                    },
                    author: null,
                    html_url: 'https://github.com/test/repo/commit/abc1234',
                },
            ];
            const markdown = (0, index_1.formatPRAsMarkdown)(pr, [], [], commits);
            expect(markdown).toContain('by [Commit Author]');
            expect(markdown).toContain('https://github.com/Commit Author');
        });
        it('should format commit with files list when available', () => {
            const pr = {
                number: 10,
                title: 'PR with files',
                body: 'PR body',
                state: 'closed',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                merged_at: null,
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/pull/10',
                head: { ref: 'feature-branch' },
                base: { ref: 'main' },
            };
            const commits = [
                {
                    sha: 'abc1234567890def',
                    commit: {
                        message: 'feat: update files',
                        author: { name: 'Author', date: '2024-01-16T10:00:00Z' },
                    },
                    author: { login: 'authoruser', html_url: 'https://github.com/authoruser' },
                    html_url: 'https://github.com/test/repo/commit/abc1234',
                    stats: { total: 3 },
                    files: [{ filename: 'file1.ts' }, { filename: 'file2.ts' }, { filename: 'file3.ts' }],
                },
            ];
            const markdown = (0, index_1.formatPRAsMarkdown)(pr, [], [], commits);
            expect(markdown).toContain('3 files modified');
            expect(markdown).toContain('(file1.ts, file2.ts, file3.ts)');
        });
        it('should format PR with assignees and milestone', () => {
            const pr = {
                number: 5,
                title: 'PR with metadata',
                body: 'PR body',
                state: 'open',
                labels: [{ name: 'bug' }, { name: 'urgent' }],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                merged_at: null,
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/pull/5',
                head: { ref: 'feature-branch' },
                base: { ref: 'main' },
                assignees: [{ login: 'assignee1' }, { login: 'assignee2' }],
                milestone: { title: 'Sprint 1', number: 1 },
            };
            const markdown = (0, index_1.formatPRAsMarkdown)(pr, []);
            expect(markdown).toContain('assignees: assignee1, assignee2');
            expect(markdown).toContain('milestone: Sprint 1');
            expect(markdown).toContain('labels: bug, urgent');
        });
        it('should format PR without assignees or milestone', () => {
            const pr = {
                number: 6,
                title: 'PR without metadata',
                body: 'PR body',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                merged_at: null,
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/pull/6',
                head: { ref: 'feature-branch' },
                base: { ref: 'main' },
            };
            const markdown = (0, index_1.formatPRAsMarkdown)(pr, []);
            expect(markdown).toContain('assignees: none');
            expect(markdown).toContain('milestone: none');
            expect(markdown).toContain('labels: none');
        });
        it('should include review comments section when provided', () => {
            const pr = {
                number: 4,
                title: 'PR with review comments',
                body: 'PR body',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                merged_at: null,
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/pull/4',
                head: { ref: 'feature-branch' },
                base: { ref: 'main' },
            };
            const reviewComments = [
                {
                    id: 1,
                    body: 'Please update this section',
                    user: { login: 'reviewer', html_url: 'https://github.com/reviewer' },
                    created_at: '2024-01-16T10:30:00Z',
                    updated_at: '2024-01-16T10:30:00Z',
                    html_url: 'https://github.com/test/repo/pull/4#discussion-1',
                    path: 'src/index.ts',
                    line: 42,
                    side: 'RIGHT',
                    diff_hunk: '@@ -40,7 +42,7 @@ function demo() {\n- old line\n+ new line\n}',
                    in_reply_to_id: null,
                },
                {
                    id: 2,
                    body: 'Follow-up reply',
                    user: { login: 'author', html_url: 'https://github.com/author' },
                    created_at: '2024-01-16T10:45:00Z',
                    updated_at: '2024-01-16T10:45:00Z',
                    html_url: 'https://github.com/test/repo/pull/4#discussion-2',
                    in_reply_to_id: 1,
                },
            ];
            const markdown = (0, index_1.formatPRAsMarkdown)(pr, [], reviewComments);
            expect(markdown).toContain('## Review Threads (1)');
            expect(markdown).toContain('Review by [@reviewer](https://github.com/reviewer)');
            expect(markdown).toContain('src/index.ts');
            expect(markdown).toContain('line 42');
            expect(markdown).toContain('Please update this section');
            expect(markdown).toContain('Follow-up reply');
            expect(markdown).toContain('comments: 2');
            expect(markdown).toContain('```diff');
            expect(markdown).toContain('@@ -40,7 +42,7 @@ function demo() {');
        });
        it('should use level-1 header for Comments section', () => {
            const pr = {
                number: 20,
                title: 'PR with comments section',
                body: 'PR body',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                merged_at: null,
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/pull/20',
                head: { ref: 'feature-branch' },
                base: { ref: 'main' },
            };
            const comments = [
                {
                    id: 1,
                    body: 'Simple comment',
                    user: { login: 'commenter', html_url: 'https://github.com/commenter' },
                    created_at: '2024-01-16T10:30:00Z',
                    updated_at: '2024-01-16T10:30:00Z',
                    html_url: 'https://github.com/test/repo/pull/20#issuecomment-1',
                },
            ];
            const markdown = (0, index_1.formatPRAsMarkdown)(pr, comments);
            expect(markdown).toContain('# Comments (1)');
            expect(markdown).not.toMatch(/^## Comments/m);
        });
        it('should use level-2 header for individual comment entries', () => {
            const pr = {
                number: 21,
                title: 'PR with comment entries',
                body: 'PR body',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                merged_at: null,
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/pull/21',
                head: { ref: 'feature-branch' },
                base: { ref: 'main' },
            };
            const comments = [
                {
                    id: 1,
                    body: 'A comment',
                    user: { login: 'commenter', html_url: 'https://github.com/commenter' },
                    created_at: '2024-01-16T10:30:00Z',
                    updated_at: '2024-01-16T10:30:00Z',
                    html_url: 'https://github.com/test/repo/pull/21#issuecomment-1',
                },
            ];
            const markdown = (0, index_1.formatPRAsMarkdown)(pr, comments);
            expect(markdown).toContain('## [Comment #1]');
            expect(markdown).not.toMatch(/^### \[Comment #1\]/m);
        });
        it('should shift comment body headers starting with ## so top-level becomes ###', () => {
            const pr = {
                number: 22,
                title: 'PR with header comment',
                body: 'PR body',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                merged_at: null,
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/pull/22',
                head: { ref: 'feature-branch' },
                base: { ref: 'main' },
            };
            const comments = [
                {
                    id: 1,
                    body: '## Idea: Tracking\n\nSome text\n\n### How it would work\n\n- bullet',
                    user: { login: 'commenter', html_url: 'https://github.com/commenter' },
                    created_at: '2024-01-16T10:30:00Z',
                    updated_at: '2024-01-16T10:30:00Z',
                    html_url: 'https://github.com/test/repo/pull/22#issuecomment-1',
                },
            ];
            const markdown = (0, index_1.formatPRAsMarkdown)(pr, comments);
            expect(markdown).toContain('### Idea: Tracking');
            expect(markdown).toContain('#### How it would work');
            expect(markdown).not.toMatch(/^## Idea/m);
            expect(markdown).not.toMatch(/^### How it would work$/m);
        });
        it('should shift comment body headers starting with # so top-level becomes ###', () => {
            const pr = {
                number: 23,
                title: 'PR with h1 comment',
                body: 'PR body',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                merged_at: null,
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/pull/23',
                head: { ref: 'feature-branch' },
                base: { ref: 'main' },
            };
            const comments = [
                {
                    id: 1,
                    body: '# Big Title\n\n## Subtitle\n\nContent',
                    user: { login: 'commenter', html_url: 'https://github.com/commenter' },
                    created_at: '2024-01-16T10:30:00Z',
                    updated_at: '2024-01-16T10:30:00Z',
                    html_url: 'https://github.com/test/repo/pull/23#issuecomment-1',
                },
            ];
            const markdown = (0, index_1.formatPRAsMarkdown)(pr, comments);
            expect(markdown).toContain('### Big Title');
            expect(markdown).toContain('#### Subtitle');
        });
        it('should not shift comment body headers already at or below min level', () => {
            const pr = {
                number: 24,
                title: 'PR with deep headers',
                body: 'PR body',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                merged_at: null,
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/pull/24',
                head: { ref: 'feature-branch' },
                base: { ref: 'main' },
            };
            const comments = [
                {
                    id: 1,
                    body: '### Already deep\n\n#### Even deeper\n\nContent',
                    user: { login: 'commenter', html_url: 'https://github.com/commenter' },
                    created_at: '2024-01-16T10:30:00Z',
                    updated_at: '2024-01-16T10:30:00Z',
                    html_url: 'https://github.com/test/repo/pull/24#issuecomment-1',
                },
            ];
            const markdown = (0, index_1.formatPRAsMarkdown)(pr, comments);
            expect(markdown).toContain('### Already deep');
            expect(markdown).toContain('#### Even deeper');
        });
        it('should cap shifted headers at max level 6 in comment bodies', () => {
            const pr = {
                number: 25,
                title: 'PR with max level headers',
                body: 'PR body',
                state: 'open',
                labels: [],
                created_at: '2024-01-15T10:30:00Z',
                updated_at: '2024-01-16T10:30:00Z',
                merged_at: null,
                user: { login: 'testuser' },
                html_url: 'https://github.com/test/repo/pull/25',
                head: { ref: 'feature-branch' },
                base: { ref: 'main' },
            };
            const comments = [
                {
                    id: 1,
                    body: '## Title\n\n### Sub\n\n##### Deep\n\n###### Max',
                    user: { login: 'commenter', html_url: 'https://github.com/commenter' },
                    created_at: '2024-01-16T10:30:00Z',
                    updated_at: '2024-01-16T10:30:00Z',
                    html_url: 'https://github.com/test/repo/pull/25#issuecomment-1',
                },
            ];
            const markdown = (0, index_1.formatPRAsMarkdown)(pr, comments);
            expect(markdown).toContain('### Title');
            expect(markdown).toContain('#### Sub');
            expect(markdown).toContain('###### Deep');
            expect(markdown).toContain('###### Max');
        });
    });
    describe('fetchIssueRelationships', () => {
        const mockOctokit = github.getOctokit('fake-token');
        beforeEach(() => {
            jest.clearAllMocks();
        });
        it('should return correct map from GraphQL response', async () => {
            mockOctokit.graphql.mockResolvedValueOnce({
                repository: {
                    issue_5: {
                        parent: { number: 2 },
                        subIssues: { nodes: [{ number: 10 }, { number: 11 }] },
                    },
                    issue_7: {
                        parent: null,
                        subIssues: { nodes: [] },
                    },
                },
            });
            const result = await (0, index_1.fetchIssueRelationships)(mockOctokit, 'owner', 'repo', [5, 7]);
            expect(result.get(5)).toEqual({ parent: 2, children: [10, 11] });
            expect(result.get(7)).toEqual({ parent: null, children: [] });
            expect(mockOctokit.graphql).toHaveBeenCalledTimes(1);
        });
        it('should return empty map for empty issue list', async () => {
            const result = await (0, index_1.fetchIssueRelationships)(mockOctokit, 'owner', 'repo', []);
            expect(result.size).toBe(0);
            expect(mockOctokit.graphql).not.toHaveBeenCalled();
        });
        it('should return empty map and warn on GraphQL error', async () => {
            mockOctokit.graphql.mockRejectedValueOnce(new Error('GraphQL rate limit'));
            const result = await (0, index_1.fetchIssueRelationships)(mockOctokit, 'owner', 'repo', [1, 2]);
            expect(result.size).toBe(0);
            expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('GraphQL rate limit'));
        });
        it('should emit info instead of warning on schema error', async () => {
            mockOctokit.graphql.mockRejectedValueOnce(new Error("Request failed due to following response errors:\n - Field 'parent' doesn't exist on type 'Issue'"));
            const result = await (0, index_1.fetchIssueRelationships)(mockOctokit, 'owner', 'repo', [1, 2]);
            expect(result.size).toBe(0);
            expect(core.info).toHaveBeenCalledWith('Sub-issues API is not available for this repository. Skipping relationship sync.');
            expect(core.warning).not.toHaveBeenCalled();
        });
        it('should still warn on non-schema errors when sub-issues enabled', async () => {
            mockOctokit.graphql.mockRejectedValueOnce(new Error('Server error'));
            const result = await (0, index_1.fetchIssueRelationships)(mockOctokit, 'owner', 'repo', [3]);
            expect(result.size).toBe(0);
            expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('Server error'));
            expect(core.info).not.toHaveBeenCalled();
        });
    });
    describe('shiftHeadersToMinLevel', () => {
        it('should return empty/falsy content unchanged', () => {
            expect((0, index_1.shiftHeadersToMinLevel)('', 3)).toBe('');
        });
        it('should return content with no headers unchanged', () => {
            const content = 'Just some text\nwith no headers';
            expect((0, index_1.shiftHeadersToMinLevel)(content, 3)).toBe(content);
        });
        it('should shift headers when min current level is below target', () => {
            const content = '## Title\n\n### Sub\n\nText';
            const result = (0, index_1.shiftHeadersToMinLevel)(content, 3);
            expect(result).toBe('### Title\n\n#### Sub\n\nText');
        });
        it('should not shift when min current level already meets target', () => {
            const content = '### Title\n\n#### Sub';
            expect((0, index_1.shiftHeadersToMinLevel)(content, 3)).toBe(content);
        });
        it('should not shift when min current level exceeds target', () => {
            const content = '#### Title\n\n##### Sub';
            expect((0, index_1.shiftHeadersToMinLevel)(content, 3)).toBe(content);
        });
        it('should cap shifted headers at level 6', () => {
            const content = '# Title\n\n##### Deep';
            const result = (0, index_1.shiftHeadersToMinLevel)(content, 3);
            expect(result).toBe('### Title\n\n###### Deep');
        });
        it('should not exceed 6 hashes even when shift is large', () => {
            const content = '# Title\n\n###### Max';
            const result = (0, index_1.shiftHeadersToMinLevel)(content, 4);
            expect(result).toBe('#### Title\n\n###### Max');
        });
    });
    describe('Input Parameters', () => {
        const mockGetInput = core.getInput;
        const mockGetOctokit = github.getOctokit;
        const setMockOctokit = (mock) => mockGetOctokit.mockReturnValue(mock);
        const mockExistsSync = fs.existsSync;
        const mockMkdirSync = fs.mkdirSync;
        const mockWriteFileSync = fs.writeFileSync;
        const mockReadFileSync = fs.readFileSync;
        const mockPathJoin = path.join;
        const mockInfo = core.info;
        const mockWarning = core.warning;
        const mockSetFailed = core.setFailed;
        const mockSetOutput = core.setOutput;
        beforeEach(() => {
            jest.clearAllMocks();
            mockExistsSync.mockReturnValue(false);
            mockMkdirSync.mockImplementation(() => undefined);
            mockPathJoin.mockImplementation((...args) => args.join('/'));
            mockWriteFileSync.mockImplementation(() => undefined);
            mockReadFileSync.mockImplementation(() => '2024-01-01T00:00:00Z');
        });
        describe('token input', () => {
            it('should set outputs for issues-count, prs-count, last-synced-at, and modified-files', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    return '';
                });
                mockExistsSync.mockReturnValue(false);
                const issue = {
                    number: 1,
                    title: 'Issue 1',
                    body: 'Body',
                    state: 'open',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    user: { login: 'user1' },
                    html_url: 'https://example.com/issue/1',
                    milestone: null,
                };
                const issue2 = {
                    ...issue,
                    number: 2,
                    title: 'Issue 2',
                    html_url: 'https://example.com/issue/2',
                };
                const pr = {
                    number: 10,
                    title: 'PR 10',
                    body: 'PR Body',
                    state: 'open',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    merged_at: null,
                    user: { login: 'pr-user' },
                    html_url: 'https://example.com/pr/10',
                    head: { ref: 'feature' },
                    base: { ref: 'main' },
                };
                const pr2 = { ...pr, number: 11, title: 'PR 11', html_url: 'https://example.com/pr/11' };
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [issue, issue2] }),
                            get: jest.fn().mockImplementation(({ issue_number }) => {
                                return Promise.resolve({ data: issue_number === 1 ? issue : issue2 });
                            }),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [pr, pr2] }),
                            get: jest.fn().mockImplementation(({ pull_number }) => {
                                return Promise.resolve({ data: pull_number === 10 ? pr : pr2 });
                            }),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockSetOutput).toHaveBeenCalledWith('issues-count', 2);
                expect(mockSetOutput).toHaveBeenCalledWith('prs-count', 2);
                expect(mockSetOutput).toHaveBeenCalledWith('last-synced-at', expect.any(String));
                const modifiedFilesCall = mockSetOutput.mock.calls.find((call) => call[0] === 'modified-files');
                expect(modifiedFilesCall).toBeDefined();
                const modifiedFiles = modifiedFilesCall[1];
                expect(modifiedFiles).toContain('synced-issues/issues/issue-1.md');
                expect(modifiedFiles).toContain('synced-issues/issues/issue-2.md');
                expect(modifiedFiles).toContain('synced-issues/pull-requests/pr-10.md');
                expect(modifiedFiles).toContain('synced-issues/pull-requests/pr-11.md');
                expect(mockSetOutput).toHaveBeenCalledWith('app-token', '');
                expect(mockSetOutput).toHaveBeenCalledWith('github-token', 'test-token');
            });
            it('should error when token input is not provided and env is missing', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token') {
                        return '';
                    }
                    return '';
                });
                delete process.env.GITHUB_TOKEN;
                await (0, index_1.run)();
                expect(mockGetInput).toHaveBeenCalledWith('token');
                expect(mockSetFailed).toHaveBeenCalledWith(expect.stringContaining('GitHub token is required'));
            });
            it('should use provided token input', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token-123';
                    return '';
                });
                delete process.env.GITHUB_TOKEN;
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockGetInput).toHaveBeenCalledWith('token');
                expect(mockGetOctokit).toHaveBeenCalledWith('test-token-123');
            });
        });
        describe('output-dir input', () => {
            it('should use default output directory when not provided', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'output-dir')
                        return '';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockGetInput).toHaveBeenCalledWith('output-dir');
                expect(mockExistsSync).toHaveBeenCalledWith('synced-issues');
                expect(mockMkdirSync).toHaveBeenCalledWith('synced-issues', { recursive: true });
            });
            it('should use custom output directory when provided', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'output-dir')
                        return '/custom/output/path';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockExistsSync).toHaveBeenCalledWith('/custom/output/path');
                expect(mockMkdirSync).toHaveBeenCalledWith('/custom/output/path', { recursive: true });
            });
            it('should not create directory if it already exists', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'output-dir')
                        return '/existing/path';
                    return '';
                });
                mockExistsSync.mockReturnValue(true);
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockExistsSync).toHaveBeenCalledWith('/existing/path');
                expect(mockMkdirSync).not.toHaveBeenCalledWith('/existing/path', expect.anything());
            });
        });
        describe('sync-issues input', () => {
            it('should default to true when not provided', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-issues')
                        return '';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockInfo).toHaveBeenCalledWith('Syncing issues...');
                expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalled();
            });
            it('should sync issues when set to true', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-issues')
                        return 'true';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockInfo).toHaveBeenCalledWith('Syncing issues...');
                expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalled();
            });
            it('should not sync issues when set to false', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-issues')
                        return 'false';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn(),
                            get: jest.fn(),
                            listComments: jest.fn(),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockInfo).not.toHaveBeenCalledWith('Syncing issues...');
                expect(mockOctokit.rest.issues.listForRepo).not.toHaveBeenCalled();
            });
            it('should handle case-insensitive true values', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-issues')
                        return 'TRUE';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockInfo).toHaveBeenCalledWith('Syncing issues...');
                expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalled();
            });
        });
        describe('sync-prs input', () => {
            it('should default to true when not provided', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-prs')
                        return '';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockInfo).toHaveBeenCalledWith('Syncing pull requests...');
                expect(mockOctokit.rest.pulls.list).toHaveBeenCalled();
            });
            it('should sync PRs when set to true', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-prs')
                        return 'true';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockInfo).toHaveBeenCalledWith('Syncing pull requests...');
                expect(mockOctokit.rest.pulls.list).toHaveBeenCalled();
            });
            it('should not sync PRs when set to false', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-prs')
                        return 'false';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn(),
                            get: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockInfo).not.toHaveBeenCalledWith('Syncing pull requests...');
                expect(mockOctokit.rest.pulls.list).not.toHaveBeenCalled();
            });
        });
        describe('include-closed input', () => {
            it('should default to false when not provided', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'include-closed')
                        return '';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledWith(expect.objectContaining({ state: 'open' }));
                expect(mockOctokit.rest.pulls.list).toHaveBeenCalledWith(expect.objectContaining({ state: 'open' }));
            });
            it('should include closed items when set to true', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'include-closed')
                        return 'true';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledWith(expect.objectContaining({ state: 'all' }));
                expect(mockOctokit.rest.pulls.list).toHaveBeenCalledWith(expect.objectContaining({ state: 'all' }));
            });
            it('should exclude closed items when set to false', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'include-closed')
                        return 'false';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledWith(expect.objectContaining({ state: 'open' }));
                expect(mockOctokit.rest.pulls.list).toHaveBeenCalledWith(expect.objectContaining({ state: 'open' }));
            });
        });
        describe('updated-since input', () => {
            it('should pass since to issues and filter PRs when provided', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'updated-since')
                        return '2024-02-01T00:00:00Z';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({
                                data: [
                                    { number: 1, updated_at: '2024-02-05T00:00:00Z' },
                                    { number: 2, updated_at: '2024-01-01T00:00:00Z' },
                                ],
                            }),
                            get: jest.fn(),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledWith(expect.objectContaining({ since: '2024-02-01T00:00:00Z' }));
                expect(mockOctokit.rest.pulls.list).toHaveBeenCalledWith(expect.objectContaining({ sort: 'updated', direction: 'desc' }));
                // PR with older updated_at should be skipped
                expect(mockOctokit.rest.pulls.get).toHaveBeenCalledTimes(1);
                expect(mockOctokit.rest.pulls.get).toHaveBeenCalledWith(expect.objectContaining({ pull_number: 1 }));
            });
            it('should read updated-since from state file when input missing', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'state-file')
                        return '/tmp/state/last.txt';
                    return '';
                });
                mockExistsSync.mockImplementation((pathArg) => {
                    if (String(pathArg) === '/tmp/state/last.txt')
                        return true;
                    return false;
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockReadFileSync).toHaveBeenCalledWith('/tmp/state/last.txt', 'utf-8');
                expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledWith(expect.objectContaining({ since: '2024-01-01T00:00:00Z' }));
                expect(mockSetOutput).toHaveBeenCalledWith('last-synced-at', expect.any(String));
                expect(mockWriteFileSync).toHaveBeenCalledWith('/tmp/state/last.txt', expect.any(String), 'utf-8');
            });
        });
        describe('force-update input', () => {
            it('should re-write issue files even when body is unchanged', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-prs')
                        return 'false';
                    if (name === 'force-update')
                        return 'true';
                    return '';
                });
                const issue = {
                    number: 1,
                    title: 'Issue 1',
                    body: 'Body',
                    state: 'open',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    user: { login: 'user1' },
                    html_url: 'https://example.com/issue/1',
                    milestone: null,
                };
                const newContent = (0, index_1.formatIssueAsMarkdown)(issue, []);
                const existingContent = newContent.replace(/synced: .+/, 'synced: 2000-01-01T00:00:00Z');
                mockExistsSync.mockReturnValue(true);
                mockReadFileSync.mockReturnValue(existingContent);
                mockWriteFileSync.mockImplementation(() => undefined);
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [issue] }),
                            get: jest.fn().mockResolvedValue({ data: issue }),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn(),
                            get: jest.fn(),
                            listReviewComments: jest.fn(),
                        },
                    },
                    graphql: jest.fn().mockResolvedValue({ repository: {} }),
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockWriteFileSync).toHaveBeenCalled();
                expect(mockSetOutput).toHaveBeenCalledWith('issues-count', 1);
                expect(mockSetOutput).toHaveBeenCalledWith('modified-files', expect.stringContaining('issue-1.md'));
            });
            it('should re-write PR files even when body is unchanged', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-issues')
                        return 'false';
                    if (name === 'force-update')
                        return 'true';
                    return '';
                });
                const pr = {
                    number: 10,
                    title: 'PR 10',
                    body: 'PR Body',
                    state: 'open',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    merged_at: null,
                    user: { login: 'pr-user' },
                    html_url: 'https://example.com/pr/10',
                    head: { ref: 'feature' },
                    base: { ref: 'main' },
                };
                const newContent = (0, index_1.formatPRAsMarkdown)(pr, [], []);
                const existingContent = newContent.replace(/synced: .+/, 'synced: 2000-01-01T00:00:00Z');
                mockExistsSync.mockReturnValue(true);
                mockReadFileSync.mockReturnValue(existingContent);
                mockWriteFileSync.mockImplementation(() => undefined);
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn(),
                            get: jest.fn(),
                            listComments: jest.fn(),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [pr] }),
                            get: jest.fn().mockResolvedValue({ data: pr }),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                            listCommits: jest.fn(),
                        },
                        repos: {
                            getCommit: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockWriteFileSync).toHaveBeenCalled();
                expect(mockSetOutput).toHaveBeenCalledWith('prs-count', 1);
                expect(mockSetOutput).toHaveBeenCalledWith('modified-files', expect.stringContaining('pr-10.md'));
            });
        });
        describe('app-id and app-private-key inputs', () => {
            it('should throw error when only app-id provided', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'app-id')
                        return '12345';
                    return '';
                });
                await (0, index_1.run)();
                expect(mockSetFailed).toHaveBeenCalledWith(expect.stringContaining('GitHub App authentication requires both app-id and app-private-key'));
            });
            it('should throw error when only app-private-key provided', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'app-private-key')
                        return 'MOCK_PRIVATE_KEY_FOR_TESTING_ONLY';
                    return '';
                });
                await (0, index_1.run)();
                expect(mockSetFailed).toHaveBeenCalledWith(expect.stringContaining('GitHub App authentication requires both app-id and app-private-key'));
            });
            it('should output empty app-token when app credentials not provided', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockSetOutput).toHaveBeenCalledWith('app-token', '');
                expect(mockSetOutput).toHaveBeenCalledWith('github-token', 'test-token');
            });
            it('should generate app token when both app-id and app-private-key provided', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'app-id')
                        return '12345';
                    if (name === 'app-private-key')
                        return 'MOCK_PRIVATE_KEY_FOR_TESTING_ONLY';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        apps: {
                            getRepoInstallation: jest.fn().mockResolvedValue({ data: { id: 67890 } }),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockSetOutput).toHaveBeenCalledWith('app-token', 'mock-installation-token');
                expect(mockSetOutput).toHaveBeenCalledWith('github-token', 'test-token');
            });
        });
        describe('modified-files output', () => {
            it('should output empty modified-files when no files synced', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockSetOutput).toHaveBeenCalledWith('modified-files', '');
            });
            it('should output modified-files when only issues synced', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-prs')
                        return 'false';
                    return '';
                });
                const issue = {
                    number: 1,
                    title: 'Issue 1',
                    body: 'Body',
                    state: 'open',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    user: { login: 'user1' },
                    html_url: 'https://example.com/issue/1',
                    milestone: null,
                };
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [issue] }),
                            get: jest.fn().mockResolvedValue({ data: issue }),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn(),
                            get: jest.fn(),
                            listReviewComments: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockSetOutput).toHaveBeenCalledWith('modified-files', 'synced-issues/issues/issue-1.md');
                expect(mockSetOutput).toHaveBeenCalledWith('issues-count', 1);
                expect(mockSetOutput).toHaveBeenCalledWith('prs-count', 0);
            });
            it('should skip writing when only synced timestamp changes', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-prs')
                        return 'false';
                    return '';
                });
                const issue = {
                    number: 1,
                    title: 'Issue 1',
                    body: 'Body',
                    state: 'open',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    user: { login: 'user1' },
                    html_url: 'https://example.com/issue/1',
                    milestone: null,
                };
                // Build existing content that differs only by the synced timestamp
                const newContent = (0, index_1.formatIssueAsMarkdown)(issue, []);
                const existingContent = newContent.replace(/synced: .+/, 'synced: 2000-01-01T00:00:00Z');
                mockExistsSync.mockReturnValue(true);
                mockReadFileSync.mockReturnValue(existingContent);
                mockWriteFileSync.mockImplementation(() => undefined);
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [issue] }),
                            get: jest.fn().mockResolvedValue({ data: issue }),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn(),
                            get: jest.fn(),
                            listReviewComments: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                // No write because content (excluding synced) is unchanged
                expect(mockWriteFileSync).not.toHaveBeenCalled();
                expect(mockSetOutput).toHaveBeenCalledWith('issues-count', 1);
                expect(mockSetOutput).toHaveBeenCalledWith('prs-count', 0);
                expect(mockSetOutput).toHaveBeenCalledWith('modified-files', '');
            });
            it('should output modified-files when only PRs synced', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-issues')
                        return 'false';
                    return '';
                });
                const pr = {
                    number: 10,
                    title: 'PR 10',
                    body: 'PR Body',
                    state: 'open',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    merged_at: null,
                    user: { login: 'pr-user' },
                    html_url: 'https://example.com/pr/10',
                    head: { ref: 'feature' },
                    base: { ref: 'main' },
                };
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn(),
                            get: jest.fn(),
                            listComments: jest.fn(),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [pr] }),
                            get: jest.fn().mockResolvedValue({ data: pr }),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                            listCommits: jest.fn(),
                        },
                        repos: {
                            getCommit: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockSetOutput).toHaveBeenCalledWith('modified-files', 'synced-issues/pull-requests/pr-10.md');
                expect(mockSetOutput).toHaveBeenCalledWith('issues-count', 0);
                expect(mockSetOutput).toHaveBeenCalledWith('prs-count', 1);
            });
            it('should handle errors when fetching commit details gracefully', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-issues')
                        return 'false';
                    if (name === 'include-closed')
                        return 'true';
                    return '';
                });
                const closedPR = {
                    number: 17,
                    title: 'Closed PR',
                    body: 'PR Body',
                    state: 'closed',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    merged_at: null,
                    user: { login: 'pr-user' },
                    html_url: 'https://example.com/pr/17',
                    head: { ref: 'feature' },
                    base: { ref: 'main' },
                };
                const commit1 = {
                    sha: 'abc1234567890def',
                    commit: {
                        message: 'feat: add feature',
                        author: { name: 'Author', date: '2024-01-02T10:00:00Z' },
                    },
                    author: { login: 'authoruser', html_url: 'https://github.com/authoruser' },
                    html_url: 'https://github.com/test/repo/commit/abc1234',
                };
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn(),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [closedPR] }),
                            get: jest.fn().mockResolvedValue({ data: closedPR }),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                            listCommits: jest.fn().mockResolvedValue({ data: [commit1] }),
                        },
                        repos: {
                            getCommit: jest.fn().mockRejectedValue(new Error('Failed to fetch commit')),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                mockExistsSync.mockReturnValue(false);
                mockPathJoin.mockImplementation((...args) => args.join('/'));
                await (0, index_1.run)();
                // Should still write the file with basic commit info (fallback)
                expect(mockWriteFileSync).toHaveBeenCalled();
                // The warning is logged via core.debug, not core.warning for individual commit failures
                // But we should verify the file was written with fallback commit info
                const writeCall = mockWriteFileSync.mock.calls[0];
                expect(writeCall).toBeDefined();
                const writtenContent = writeCall[1];
                expect(writtenContent).toContain('## Commits');
                expect(writtenContent).toContain('feat: add feature');
            });
            it('should output empty modified-files when both sync-issues and sync-prs are false', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-issues')
                        return 'false';
                    if (name === 'sync-prs')
                        return 'false';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn(),
                            get: jest.fn(),
                            listComments: jest.fn(),
                        },
                        pulls: {
                            list: jest.fn(),
                            get: jest.fn(),
                            listReviewComments: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockSetOutput).toHaveBeenCalledWith('modified-files', '');
                expect(mockSetOutput).toHaveBeenCalledWith('issues-count', 0);
                expect(mockSetOutput).toHaveBeenCalledWith('prs-count', 0);
                expect(mockOctokit.rest.issues.listForRepo).not.toHaveBeenCalled();
                expect(mockOctokit.rest.pulls.list).not.toHaveBeenCalled();
            });
        });
        describe('sub-issue relationships', () => {
            it('should skip sub-issue fetch when sync-sub-issues is false', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-prs')
                        return 'false';
                    if (name === 'sync-sub-issues')
                        return 'false';
                    return '';
                });
                const issue = {
                    number: 5,
                    title: 'Test Issue',
                    body: 'Body',
                    state: 'open',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    user: { login: 'user1' },
                    html_url: 'https://example.com/issue/5',
                    milestone: null,
                };
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [issue] }),
                            get: jest.fn().mockResolvedValue({ data: issue }),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn(),
                            get: jest.fn(),
                            listReviewComments: jest.fn(),
                        },
                    },
                    graphql: jest.fn(),
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockOctokit.graphql).not.toHaveBeenCalled();
                const writeCall = mockWriteFileSync.mock.calls.find((call) => String(call[0]).includes('issue-5.md'));
                expect(writeCall).toBeDefined();
                const content = writeCall[1];
                expect(content).toContain('parent: none');
                expect(content).toContain('children: none');
            });
            it('should fetch sub-issues by default when sync-sub-issues is not set', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-prs')
                        return 'false';
                    return '';
                });
                const issue = {
                    number: 3,
                    title: 'Test Issue',
                    body: 'Body',
                    state: 'open',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    user: { login: 'user1' },
                    html_url: 'https://example.com/issue/3',
                    milestone: null,
                };
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [issue] }),
                            get: jest.fn().mockResolvedValue({ data: issue }),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn(),
                            get: jest.fn(),
                            listReviewComments: jest.fn(),
                        },
                    },
                    graphql: jest.fn().mockResolvedValue({
                        repository: {
                            issue_3: {
                                parent: { number: 1 },
                                subIssues: { nodes: [] },
                            },
                        },
                    }),
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockOctokit.graphql).toHaveBeenCalled();
            });
            it('should write parent and children from GraphQL into issue frontmatter', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-prs')
                        return 'false';
                    if (name === 'sync-sub-issues')
                        return 'true';
                    return '';
                });
                const issue = {
                    number: 5,
                    title: 'Child Issue',
                    body: 'Body',
                    state: 'open',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    user: { login: 'user1' },
                    html_url: 'https://example.com/issue/5',
                    milestone: null,
                };
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [issue] }),
                            get: jest.fn().mockResolvedValue({ data: issue }),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn(),
                            get: jest.fn(),
                            listReviewComments: jest.fn(),
                        },
                    },
                    graphql: jest.fn().mockResolvedValue({
                        repository: {
                            issue_5: {
                                parent: { number: 2 },
                                subIssues: { nodes: [{ number: 10 }, { number: 11 }] },
                            },
                        },
                    }),
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                const writeCall = mockWriteFileSync.mock.calls.find((call) => String(call[0]).includes('issue-5.md'));
                expect(writeCall).toBeDefined();
                const content = writeCall[1];
                expect(content).toContain('parent: 2');
                expect(content).toContain('children: 10, 11');
                expect(content).not.toContain('relationship:');
            });
        });
        describe('pagination', () => {
            it('should handle pagination for issues', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-prs')
                        return 'false';
                    return '';
                });
                const issue1 = {
                    number: 1,
                    title: 'Issue 1',
                    body: 'Body',
                    state: 'open',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    user: { login: 'user1' },
                    html_url: 'https://example.com/issue/1',
                    milestone: null,
                };
                // Create array of 100 issues for first page (exactly per_page to trigger pagination)
                const firstPageIssues = Array.from({ length: 100 }, (_, i) => ({
                    ...issue1,
                    number: i + 1,
                    title: `Issue ${i + 1}`,
                    html_url: `https://example.com/issue/${i + 1}`,
                }));
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest
                                .fn()
                                .mockResolvedValueOnce({ data: firstPageIssues }) // First page (exactly 100 items)
                                .mockResolvedValueOnce({ data: [issue1] }), // Second page (1 item, less than 100)
                            get: jest.fn().mockImplementation(({ issue_number }) => {
                                return Promise.resolve({
                                    data: issue_number <= 100 ? firstPageIssues[issue_number - 1] : issue1,
                                });
                            }),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn(),
                            get: jest.fn(),
                            listReviewComments: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledTimes(2);
                expect(mockOctokit.rest.issues.listForRepo).toHaveBeenNthCalledWith(1, expect.objectContaining({ page: 1, per_page: 100 }));
                expect(mockOctokit.rest.issues.listForRepo).toHaveBeenNthCalledWith(2, expect.objectContaining({ page: 2, per_page: 100 }));
                expect(mockSetOutput).toHaveBeenCalledWith('issues-count', 101);
            });
            it('should fetch commits for closed PRs', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-issues')
                        return 'false';
                    if (name === 'include-closed')
                        return 'true';
                    return '';
                });
                const closedPR = {
                    number: 15,
                    title: 'Closed PR',
                    body: 'PR Body',
                    state: 'closed',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    merged_at: null,
                    user: { login: 'pr-user' },
                    html_url: 'https://example.com/pr/15',
                    head: { ref: 'feature' },
                    base: { ref: 'main' },
                };
                const commit1 = {
                    sha: 'abc1234567890def',
                    commit: {
                        message: 'feat: add feature',
                        author: { name: 'Author', date: '2024-01-02T10:00:00Z' },
                    },
                    author: { login: 'authoruser', html_url: 'https://github.com/authoruser' },
                    html_url: 'https://github.com/test/repo/commit/abc1234',
                };
                const commitDetail1 = {
                    sha: 'abc1234567890def',
                    commit: {
                        message: 'feat: add feature',
                        author: { name: 'Author', date: '2024-01-02T10:00:00Z' },
                    },
                    author: { login: 'authoruser', html_url: 'https://github.com/authoruser' },
                    html_url: 'https://github.com/test/repo/commit/abc1234',
                    stats: { total: 3, additions: 10, deletions: 5 },
                    files: [{ filename: 'file1.ts' }, { filename: 'file2.ts' }],
                };
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn(),
                            get: jest.fn(),
                            listComments: jest.fn(),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [closedPR] }),
                            get: jest.fn().mockResolvedValue({ data: closedPR }),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                            listCommits: jest.fn().mockResolvedValue({ data: [commit1] }),
                        },
                        repos: {
                            getCommit: jest.fn().mockResolvedValue({ data: commitDetail1 }),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                mockExistsSync.mockReturnValue(false);
                mockPathJoin.mockImplementation((...args) => args.join('/'));
                await (0, index_1.run)();
                expect(mockOctokit.rest.pulls.listCommits).toHaveBeenCalledWith({
                    owner: 'test-owner',
                    repo: 'test-repo',
                    pull_number: 15,
                    per_page: 100,
                    page: 1,
                });
                expect(mockOctokit.rest.repos.getCommit).toHaveBeenCalledWith({
                    owner: 'test-owner',
                    repo: 'test-repo',
                    ref: 'abc1234567890def',
                });
            });
            it('should not fetch commits for open PRs', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-issues')
                        return 'false';
                    return '';
                });
                const openPR = {
                    number: 16,
                    title: 'Open PR',
                    body: 'PR Body',
                    state: 'open',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    merged_at: null,
                    user: { login: 'pr-user' },
                    html_url: 'https://example.com/pr/16',
                    head: { ref: 'feature' },
                    base: { ref: 'main' },
                };
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn(),
                            get: jest.fn(),
                            listComments: jest.fn(),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [openPR] }),
                            get: jest.fn().mockResolvedValue({ data: openPR }),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                            listCommits: jest.fn(),
                        },
                        repos: {
                            getCommit: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                mockExistsSync.mockReturnValue(false);
                mockPathJoin.mockImplementation((...args) => args.join('/'));
                await (0, index_1.run)();
                expect(mockOctokit.rest.pulls.listCommits).not.toHaveBeenCalled();
                expect(mockOctokit.rest.repos.getCommit).not.toHaveBeenCalled();
            });
            it('should handle pagination for PRs', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-issues')
                        return 'false';
                    return '';
                });
                const pr1 = {
                    number: 10,
                    title: 'PR 10',
                    body: 'PR Body',
                    state: 'open',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    merged_at: null,
                    user: { login: 'pr-user' },
                    html_url: 'https://example.com/pr/10',
                    head: { ref: 'feature' },
                    base: { ref: 'main' },
                };
                // Create array of 100 PRs for first page (exactly per_page to trigger pagination)
                const firstPagePRs = Array.from({ length: 100 }, (_, i) => ({
                    ...pr1,
                    number: i + 10,
                    title: `PR ${i + 10}`,
                    html_url: `https://example.com/pr/${i + 10}`,
                }));
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn(),
                            get: jest.fn(),
                            listComments: jest.fn(),
                        },
                        pulls: {
                            list: jest
                                .fn()
                                .mockResolvedValueOnce({ data: firstPagePRs }) // First page (exactly 100 items)
                                .mockResolvedValueOnce({ data: [pr1] }), // Second page (1 item, less than 100)
                            get: jest.fn().mockImplementation(({ pull_number }) => {
                                return Promise.resolve({
                                    data: pull_number <= 109 ? firstPagePRs[pull_number - 10] : pr1,
                                });
                            }),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                            listCommits: jest.fn(),
                        },
                        repos: {
                            getCommit: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockOctokit.rest.pulls.list).toHaveBeenCalledTimes(2);
                expect(mockSetOutput).toHaveBeenCalledWith('prs-count', 101);
            });
        });
        describe('app token fallback', () => {
            it('should fall back to github token when app token generation fails', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'app-id')
                        return '12345';
                    if (name === 'app-private-key')
                        return 'MOCK_PRIVATE_KEY_FOR_TESTING_ONLY';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        apps: {
                            getRepoInstallation: jest.fn().mockRejectedValue(new Error('App not installed')),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockSetOutput).toHaveBeenCalledWith('app-token', '');
                expect(mockSetOutput).toHaveBeenCalledWith('github-token', 'test-token');
                expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('Falling back to provided token'));
                // Should still use github token for API calls
                expect(mockGetOctokit).toHaveBeenCalledWith('test-token');
            });
        });
        describe('comment fetching errors', () => {
            it('should handle comment fetching errors gracefully', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-prs')
                        return 'false';
                    return '';
                });
                const issue = {
                    number: 1,
                    title: 'Issue 1',
                    body: 'Body',
                    state: 'open',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    user: { login: 'user1' },
                    html_url: 'https://example.com/issue/1',
                    milestone: null,
                };
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [issue] }),
                            get: jest.fn().mockResolvedValue({ data: issue }),
                            listComments: jest.fn().mockRejectedValue(new Error('Comment fetch failed')),
                        },
                        pulls: {
                            list: jest.fn(),
                            get: jest.fn(),
                            listReviewComments: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockSetOutput).toHaveBeenCalledWith('issues-count', 1);
                expect(mockSetOutput).toHaveBeenCalledWith('modified-files', 'synced-issues/issues/issue-1.md');
                // Should log warning but continue
                expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('Failed to fetch comments'));
                expect(mockInfo).toHaveBeenCalled();
            });
            it('should handle review comment fetching errors gracefully', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-issues')
                        return 'false';
                    return '';
                });
                const pr = {
                    number: 10,
                    title: 'PR 10',
                    body: 'PR Body',
                    state: 'open',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    merged_at: null,
                    user: { login: 'pr-user' },
                    html_url: 'https://example.com/pr/10',
                    head: { ref: 'feature' },
                    base: { ref: 'main' },
                };
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn(),
                            get: jest.fn(),
                            listComments: jest.fn(),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [pr] }),
                            get: jest.fn().mockResolvedValue({ data: pr }),
                            listReviewComments: jest
                                .fn()
                                .mockRejectedValue(new Error('Review comment fetch failed')),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockSetOutput).toHaveBeenCalledWith('prs-count', 1);
                expect(mockSetOutput).toHaveBeenCalledWith('modified-files', 'synced-issues/pull-requests/pr-10.md');
                expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('Failed to fetch review comments'));
            });
        });
        describe('state file handling', () => {
            it('should handle state file read errors gracefully', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'state-file')
                        return '/tmp/state/last.txt';
                    return '';
                });
                mockExistsSync.mockImplementation((pathArg) => {
                    if (String(pathArg) === '/tmp/state/last.txt')
                        return true;
                    return false;
                });
                mockReadFileSync.mockImplementation((pathArg) => {
                    if (String(pathArg) === '/tmp/state/last.txt') {
                        throw new Error('Permission denied');
                    }
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('Could not read state file'));
                // Should continue without updated-since filter
                expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledWith(expect.not.objectContaining({ since: expect.anything() }));
            });
            it('should handle state file write errors gracefully', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'state-file')
                        return '/tmp/state/last.txt';
                    return '';
                });
                mockExistsSync.mockReturnValue(false);
                mockWriteFileSync.mockImplementation((pathArg) => {
                    if (String(pathArg) === '/tmp/state/last.txt') {
                        throw new Error('Disk full');
                    }
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockWarning).toHaveBeenCalledWith(expect.stringContaining('Failed to persist last sync timestamp'));
                // Should still complete successfully
                expect(mockSetOutput).toHaveBeenCalledWith('issues-count', 0);
            });
            it('should handle empty state file', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'state-file')
                        return '/tmp/state/last.txt';
                    return '';
                });
                mockExistsSync.mockImplementation((pathArg) => {
                    if (String(pathArg) === '/tmp/state/last.txt')
                        return true;
                    return false;
                });
                mockReadFileSync.mockReturnValue('   \n  '); // Whitespace only
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                // Should not use updated-since when state file is empty
                expect(mockOctokit.rest.issues.listForRepo).toHaveBeenCalledWith(expect.not.objectContaining({ since: expect.anything() }));
            });
        });
        describe('custom output directory', () => {
            it('should output correct modified-files paths with custom output directory', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'output-dir')
                        return 'custom/docs';
                    if (name === 'sync-prs')
                        return 'false';
                    return '';
                });
                const issue = {
                    number: 1,
                    title: 'Issue 1',
                    body: 'Body',
                    state: 'open',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    user: { login: 'user1' },
                    html_url: 'https://example.com/issue/1',
                    milestone: null,
                };
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [issue] }),
                            get: jest.fn().mockResolvedValue({ data: issue }),
                            listComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                        pulls: {
                            list: jest.fn(),
                            get: jest.fn(),
                            listReviewComments: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockSetOutput).toHaveBeenCalledWith('modified-files', 'custom/docs/issues/issue-1.md');
            });
        });
        describe('comment pagination', () => {
            it('should handle paginated comments', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    if (name === 'sync-prs')
                        return 'false';
                    return '';
                });
                const issue = {
                    number: 1,
                    title: 'Issue 1',
                    body: 'Body',
                    state: 'open',
                    labels: [],
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-02T00:00:00Z',
                    user: { login: 'user1' },
                    html_url: 'https://example.com/issue/1',
                    milestone: null,
                };
                // Create 100 comments for first page, 50 for second page
                const firstPageComments = Array.from({ length: 100 }, (_, i) => ({
                    id: i + 1,
                    body: `Comment ${i + 1}`,
                    user: { login: 'user1', html_url: 'https://github.com/user1' },
                    created_at: '2024-01-16T10:30:00Z',
                    updated_at: '2024-01-16T10:30:00Z',
                    html_url: `https://example.com/issue/1#issuecomment-${i + 1}`,
                }));
                const secondPageComments = Array.from({ length: 50 }, (_, i) => ({
                    id: i + 101,
                    body: `Comment ${i + 101}`,
                    user: { login: 'user2', html_url: 'https://github.com/user2' },
                    created_at: '2024-01-16T11:00:00Z',
                    updated_at: '2024-01-16T11:00:00Z',
                    html_url: `https://example.com/issue/1#issuecomment-${i + 101}`,
                }));
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockResolvedValue({ data: [issue] }),
                            get: jest.fn().mockResolvedValue({ data: issue }),
                            listComments: jest
                                .fn()
                                .mockResolvedValueOnce({ data: firstPageComments })
                                .mockResolvedValueOnce({ data: secondPageComments }),
                        },
                        pulls: {
                            list: jest.fn(),
                            get: jest.fn(),
                            listReviewComments: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockOctokit.rest.issues.listComments).toHaveBeenCalledTimes(2);
                expect(mockOctokit.rest.issues.listComments).toHaveBeenNthCalledWith(1, expect.objectContaining({ page: 1, per_page: 100 }));
                expect(mockOctokit.rest.issues.listComments).toHaveBeenNthCalledWith(2, expect.objectContaining({ page: 2, per_page: 100 }));
                expect(mockSetOutput).toHaveBeenCalledWith('issues-count', 1);
            });
        });
        describe('error handling', () => {
            it('should handle errors and call setFailed', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockRejectedValue(new Error('API Error')),
                            get: jest.fn(),
                            listComments: jest.fn(),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                            listReviewComments: jest.fn().mockResolvedValue({ data: [] }),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockSetFailed).toHaveBeenCalledWith('API Error');
            });
            it('should handle unknown errors', async () => {
                mockGetInput.mockImplementation((name) => {
                    if (name === 'token')
                        return 'test-token';
                    return '';
                });
                const mockOctokit = {
                    rest: {
                        issues: {
                            listForRepo: jest.fn().mockRejectedValue('String error'),
                            get: jest.fn(),
                            listComments: jest.fn(),
                        },
                        pulls: {
                            list: jest.fn().mockResolvedValue({ data: [] }),
                            get: jest.fn(),
                        },
                    },
                };
                setMockOctokit(mockOctokit);
                await (0, index_1.run)();
                expect(mockSetFailed).toHaveBeenCalledWith('Unknown error occurred');
            });
        });
    });
});
