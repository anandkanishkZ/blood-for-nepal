'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('BloodRequests', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending', // pending, completed, cancelled
      after: 'agreed_to_terms'
    });

    await queryInterface.addColumn('BloodRequests', 'is_spam', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'status'
    });

    await queryInterface.addColumn('BloodRequests', 'admin_notes', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'is_spam'
    });

    await queryInterface.addColumn('BloodRequests', 'completed_at', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'admin_notes'
    });

    await queryInterface.addColumn('BloodRequests', 'marked_spam_at', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'completed_at'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('BloodRequests', 'status');
    await queryInterface.removeColumn('BloodRequests', 'is_spam');
    await queryInterface.removeColumn('BloodRequests', 'admin_notes');
    await queryInterface.removeColumn('BloodRequests', 'completed_at');
    await queryInterface.removeColumn('BloodRequests', 'marked_spam_at');
  }
};
