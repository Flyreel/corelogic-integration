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

process.env = Object.assign(process.env, {
  FLYREEL_API_BASE_URL: "https://test.api.com",
  FLYREEL_API_TOKEN: "FAKETOKEN",
  CORELOGIC_DIGITALHUB_API: "https://CORELOGIC_DIGITALHUB_API.com",
  CORELOGIC_DIGITALHUB_API_KEY: "CORELOGIC_DIGITALHUB_API_KEY",
  CORELOGIC_DIGITALHUB_API_COMPANY_ID: "CORELOGIC_DIGITALHUB_API_COMPANY_ID",
  CORELOGIC_DIGITALHUB_API_USERNAME: "CORELOGIC_DIGITALHUB_API_USERNAME",
  CORELOGIC_DIGITALHUB_API_PASSWORD: "CORELOGIC_DIGITALHUB_API_PASSWORD",
});
