module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/.venv/'],
  testMatch: ['**/__tests__/unit/**/*.test.ts'],
  setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@actions/core$': '<rootDir>/src/__tests__/mocks/actions-core.ts',
    '^@actions/github$': '<rootDir>/src/__tests__/mocks/actions-github.ts',
    '^@octokit/auth-app$': '<rootDir>/src/__tests__/mocks/octokit-auth-app.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  transformIgnorePatterns: ['node_modules/(?!@octokit/auth-app)'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/__tests__/**'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
