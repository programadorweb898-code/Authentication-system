export default {
  testEnvironment: 'node',
  transform: {},
  setupFilesAfterEnv: ['./tests/setup.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  resolver: 'jest-resolver-enhanced',
};
