module.exports = {
  // The root directory that Jest should scan for tests and modules
  roots: ['<rootDir>'],
  
  // The test environment that will be used for testing
  testEnvironment: 'node',
  
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  // An array of regexp pattern strings that are matched against all source file paths
  modulePathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  // A map from regular expressions to module names that allow to stub out resources
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/__tests__/'
  ],
  
  // A list of paths to directories that Jest should use to search for files in
  moduleDirectories: [
    'node_modules',
    '.'
  ],
  
  // Setup files to run before each test
  setupFiles: ['<rootDir>/__tests__/jest.setup.js'],
  
  // Setup files to run after the environment is set up
  setupFilesAfterEnv: ['<rootDir>/__tests__/teardown.js']
}; 