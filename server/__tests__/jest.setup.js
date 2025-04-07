/**
 * Jest setup file
 * This file runs before each test and configures the test environment
 */

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Set global test timeout
jest.setTimeout(10000);

// Mock console methods to keep test output clean
global.console = {
  ...console,
  // Uncomment these lines to suppress logs during tests
  // log: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock mongoose
jest.mock('mongoose', () => {
  const originalModule = jest.requireActual('mongoose');
  return {
    ...originalModule,
    Types: {
      ...originalModule.Types,
      ObjectId: {
        isValid: jest.fn().mockReturnValue(true),
      },
    },
  };
});