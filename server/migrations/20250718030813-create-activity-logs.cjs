'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ActivityLogs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      blood_request_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'BloodRequests',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      activity_type: {
        type: Sequelize.ENUM(
          'created',
          'donor_accepted', 
          'donor_rejected',
          'status_changed',
          'marked_spam',
          'marked_completed',
          'admin_note_added',
          'connection_requested',
          'reverted_to_pending'
        ),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      old_value: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      new_value: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('ActivityLogs', ['blood_request_id']);
    await queryInterface.addIndex('ActivityLogs', ['user_id']);
    await queryInterface.addIndex('ActivityLogs', ['activity_type']);
    await queryInterface.addIndex('ActivityLogs', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ActivityLogs');
  }
};
