'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add missing enum values for donation-related activities
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ActivityLogs_activity_type" 
      ADD VALUE 'donation_completed';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ActivityLogs_activity_type" 
      ADD VALUE 'requester_confirmation';
    `);
  },

  async down(queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing enum values directly
    // This would require recreating the enum type, which is complex
    // For now, we'll leave the enum values in place
    console.log('Warning: Rollback for enum values is not implemented');
  }
};
