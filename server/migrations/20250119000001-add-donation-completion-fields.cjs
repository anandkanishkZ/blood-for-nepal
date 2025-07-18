'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('connection_requests', 'donation_status', {
      type: Sequelize.ENUM('not_started', 'completed', 'failed'),
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('connection_requests', 'donation_completed_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('connection_requests', 'donation_notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('connection_requests', 'requester_confirmed', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.addColumn('connection_requests', 'requester_confirmation_at', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('connection_requests', 'requester_confirmation_notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('connection_requests', 'donation_status');
    await queryInterface.removeColumn('connection_requests', 'donation_completed_at');
    await queryInterface.removeColumn('connection_requests', 'donation_notes');
    await queryInterface.removeColumn('connection_requests', 'requester_confirmed');
    await queryInterface.removeColumn('connection_requests', 'requester_confirmation_at');
    await queryInterface.removeColumn('connection_requests', 'requester_confirmation_notes');
  }
};
