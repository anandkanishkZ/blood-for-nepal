const path = require('path');

module.exports = {
  displayName: 'frontend',
  rootDir: path.resolve(__dirname),
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}'],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-react'] }],
  },
  moduleNameMapper: {
    '^.+\\.(css|scss|sass)$': 'identity-obj-proxy',
    '^.+\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/test/__mocks__/fileMock.js',
  },
  testPathIgnorePatterns: ['/node_modules/', '/server/'],
  extensionsToTreatAsEsm: [],
};
