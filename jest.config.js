/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 }
  },

  // Make calling deprecated APIs throw helpful error messages
  errorOnDeprecated: true,

  // A preset that is used as a base for Jest's configuration
  preset: "ts-jest",

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ["jest-extended", "jest-chain"],

  // The test environment that will be used for testing
  testEnvironment: "node",

  // Indicates whether each individual test should be reported during the run
  verbose: true
};
