export default {
  testEnvironment: 'node',
  setupFiles: ['./tests/load-env.js'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  resolver: 'jest-resolver-enhanced',
  testPathIgnorePatterns: ['/template/', '/node_modules/'],
  moduleNameMapper: {
    '^@infrastructure/(.*)$': '<rootDir>/infrastructure/$1',
    '^@domains/(.*)$': '<rootDir>/src/domains/$1',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};
