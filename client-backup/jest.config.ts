import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: './jest-environment-custom.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironmentOptions: {
    html: true,
    resources: 'usable',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
};

export default config;
