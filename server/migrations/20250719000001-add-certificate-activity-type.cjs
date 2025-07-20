'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the new enum value to the existing activity_type enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ActivityLogs_activity_type" 
      ADD VALUE IF NOT EXISTS 'certificate_generated';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support removing enum values easily
    // If rollback is needed, you would need to recreate the enum
    // For now, we'll leave this empty as removing enum values is complex
    console.log('Rollback note: PostgreSQL does not support removing enum values easily.');
    console.log('The certificate_generated value will remain in the enum.');
  }
};
