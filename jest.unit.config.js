/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  preset: "ts-jest",
  setupFilesAfterEnv: [path.join(__dirname, "setupUnitTests.ts")],
  testEnvironment: "node",
  verbose: true,
  testPathIgnorePatterns: ["/node_modules/", "/.build/"],
};

process.env = Object.assign(process.env, {});
