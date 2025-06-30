'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('users');
    if (!tableDescription.block_note) {
      await queryInterface.addColumn('users', 'block_note', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Admin note for blocking user',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'block_note');
  }
}; 