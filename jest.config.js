export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  resolver: 'jest-resolver-enhanced',
  moduleNameMapper: {
    '^@infrastructure/(.*)$': '<rootDir>/infrastructure/$1',
    '^@domains/(.*)$': '<rootDir>/src/domains/$1',
  },
};
