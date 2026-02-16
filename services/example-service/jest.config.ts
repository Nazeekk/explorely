import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverage: true,
};

export default config;
