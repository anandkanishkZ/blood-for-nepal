/**
 * Root Jest config that runs both frontend and backend projects.
 */
module.exports = {
  projects: [
    '<rootDir>/jest.frontend.config.cjs',
    '<rootDir>/server/jest.config.cjs'
  ],
};
