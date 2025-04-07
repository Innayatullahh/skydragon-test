module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/__tests__/setup.js',
    '/__tests__/teardown.js',
    '/__tests__/jest.setup.js'
  ],
  verbose: true
}; 