'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('BloodRequests', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      comment: 'Soft delete timestamp - when the record was moved to trash'
    });

    await queryInterface.addColumn('BloodRequests', 'permanently_deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      comment: 'Permanent delete timestamp - when the record was permanently deleted'
    });

    await queryInterface.addColumn('BloodRequests', 'deleted_by', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'Admin who deleted the record'
    });

    await queryInterface.addColumn('BloodRequests', 'deletion_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Reason for deletion'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('BloodRequests', 'deleted_at');
    await queryInterface.removeColumn('BloodRequests', 'permanently_deleted_at');
    await queryInterface.removeColumn('BloodRequests', 'deleted_by');
    await queryInterface.removeColumn('BloodRequests', 'deletion_reason');
  }
};
