const path = require('path');

module.exports = {
  displayName: 'server',
  rootDir: path.resolve(__dirname),
  testEnvironment: 'node',
  testMatch: ['<rootDir>/**/*.(test|spec).js'],
  testPathIgnorePatterns: ['/node_modules/', '/migrations/'],
  // No transform required for plain Node tests; add babel-jest if needed
};
