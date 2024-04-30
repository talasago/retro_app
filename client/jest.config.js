module.exports = {
  preset: 'ts-jest/presets/default-esm',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^domains/(.*)$': '<rootDir>/src/domains/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  setupFiles: ['<rootDir>/jestSetup.ts'],
  testEnvironment: 'jsdom',
};
