export const getOctokit = jest.fn(() => ({
  rest: {
    issues: {
      listForRepo: jest.fn(),
      get: jest.fn(),
      listComments: jest.fn(),
    },
    pulls: {
      list: jest.fn(),
      get: jest.fn(),
      listCommits: jest.fn(),
      listReviewComments: jest.fn(),
    },
    repos: {
      getCommit: jest.fn(),
    },
  },
  graphql: jest.fn(),
}));

export const context = {
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
};
