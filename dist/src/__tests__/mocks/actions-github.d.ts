export declare const getOctokit: jest.Mock<{
    rest: {
        issues: {
            listForRepo: jest.Mock<any, any, any>;
            get: jest.Mock<any, any, any>;
            listComments: jest.Mock<any, any, any>;
        };
        pulls: {
            list: jest.Mock<any, any, any>;
            get: jest.Mock<any, any, any>;
            listCommits: jest.Mock<any, any, any>;
            listReviewComments: jest.Mock<any, any, any>;
        };
        repos: {
            getCommit: jest.Mock<any, any, any>;
        };
    };
    graphql: jest.Mock<any, any, any>;
}, [], any>;
export declare const context: {
    repo: {
        owner: string;
        repo: string;
    };
    issue: {
        number: number;
    };
    payload: {};
    eventName: string;
    sha: string;
    ref: string;
    workflow: string;
    action: string;
    actor: string;
    job: string;
    runId: number;
    runNumber: number;
    runAttempt: number;
    apiUrl: string;
    serverUrl: string;
    graphqlUrl: string;
};
