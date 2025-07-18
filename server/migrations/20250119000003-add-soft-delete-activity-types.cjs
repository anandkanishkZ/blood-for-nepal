'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new enum values to the activity_type enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ActivityLogs_activity_type" 
      ADD VALUE 'moved_to_trash';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ActivityLogs_activity_type" 
      ADD VALUE 'restored_from_trash';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_ActivityLogs_activity_type" 
      ADD VALUE 'permanently_deleted';
    `);
  },

  async down(queryInterface, Sequelize) {
    // Note: PostgreSQL doesn't support removing enum values directly
    // This would require recreating the enum type, which is complex
    // For now, we'll leave the enum values in place
    console.log('Warning: Rollback for enum values is not implemented');
  }
};
