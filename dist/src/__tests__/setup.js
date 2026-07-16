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
