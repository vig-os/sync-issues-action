"use strict";
// Setup mocks before any imports
// This file runs before tests, so we can set up the environment
// Mock fs.promises to avoid the "Cannot destructure property 'access'" error
const originalFs = require('fs');
if (!originalFs.promises) {
    originalFs.promises = {
        writeFile: jest.fn(),
        mkdir: jest.fn(),
        readFile: jest.fn(),
        access: jest.fn(),
    };
}
// Mock @actions/core before it's imported
jest.mock('@actions/core', () => {
    return {
        getInput: jest.fn(),
        getBooleanInput: jest.fn(),
        setFailed: jest.fn(),
        info: jest.fn(),
        setOutput: jest.fn(),
        warning: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        summary: {
            addRaw: jest.fn(),
            addTable: jest.fn(),
            addHeading: jest.fn(),
            addSeparator: jest.fn(),
            addBreak: jest.fn(),
            addList: jest.fn(),
            addLink: jest.fn(),
            addImage: jest.fn(),
            addQuote: jest.fn(),
            addCodeBlock: jest.fn(),
            addDetails: jest.fn(),
            addEOL: jest.fn(),
            stringify: jest.fn(),
            write: jest.fn(),
            clear: jest.fn(),
            isEmptyBuffer: jest.fn(),
            filePath: '',
            bufferSize: 0,
        },
    };
});
// Mock @octokit/auth-app (ESM module that Jest can't handle)
jest.mock('@octokit/auth-app', () => {
    return {
        createAppAuth: jest.fn(() => {
            return jest.fn(async (options) => {
                if (options.type === 'app') {
                    return { token: 'mock-app-token' };
                }
                if (options.type === 'installation') {
                    return { token: 'mock-installation-token' };
                }
                return { token: 'mock-token' };
            });
        }),
    };
});
// Mock @actions/github
jest.mock('@actions/github', () => {
    return {
        getOctokit: jest.fn(() => ({
            rest: {
                issues: {
                    listForRepo: jest.fn(),
                    get: jest.fn(),
                    listComments: jest.fn(),
                },
                pulls: {
                    list: jest.fn(),
                    get: jest.fn(),
                },
            },
            graphql: jest.fn(),
        })),
        context: {
            repo: {
                owner: 'test-owner',
                repo: 'test-repo',
            },
            issue: {
                number: 1,
            },
            payload: {},
            eventName: 'push',
            sha: 'test-sha',
            ref: 'refs/heads/main',
            workflow: 'test-workflow',
            action: 'test-action',
            actor: 'test-actor',
            job: 'test-job',
            runId: 123,
            runNumber: 1,
            runAttempt: 1,
            apiUrl: 'https://api.github.com',
            serverUrl: 'https://github.com',
            graphqlUrl: 'https://api.github.com/graphql',
        },
    };
});
// Mock fs
jest.mock('fs', () => {
    const actualFs = jest.requireActual('fs');
    return {
        ...actualFs,
        existsSync: jest.fn(),
        mkdirSync: jest.fn(),
        writeFileSync: jest.fn(),
        readFileSync: jest.fn(),
        promises: {
            writeFile: jest.fn(),
            mkdir: jest.fn(),
            readFile: jest.fn(),
            access: jest.fn(),
        },
    };
});
// Mock path
jest.mock('path', () => {
    const actualPath = jest.requireActual('path');
    return {
        ...actualPath,
        join: jest.fn((...args) => args.join('/')),
    };
});
