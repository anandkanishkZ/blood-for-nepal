'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add location fields
    await queryInterface.addColumn('users', 'province', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'User province/state'
    });

    await queryInterface.addColumn('users', 'district', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'User district'
    });

    await queryInterface.addColumn('users', 'municipality', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'User municipality/city'
    });

    // Add weight field for medical information
    await queryInterface.addColumn('users', 'approximate_weight', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Approximate weight in kilograms'
    });

    // Add indexes for location fields for better search performance
    await queryInterface.addIndex('users', ['province'], {
      name: 'idx_users_province'
    });

    await queryInterface.addIndex('users', ['district'], {
      name: 'idx_users_district'
    });

    await queryInterface.addIndex('users', ['municipality'], {
      name: 'idx_users_municipality'
    });

    // Add composite index for location search
    await queryInterface.addIndex('users', ['province', 'district', 'municipality'], {
      name: 'idx_users_location_composite'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    await queryInterface.removeIndex('users', 'idx_users_location_composite');
    await queryInterface.removeIndex('users', 'idx_users_municipality');
    await queryInterface.removeIndex('users', 'idx_users_district');
    await queryInterface.removeIndex('users', 'idx_users_province');

    // Remove columns
    await queryInterface.removeColumn('users', 'approximate_weight');
    await queryInterface.removeColumn('users', 'municipality');
    await queryInterface.removeColumn('users', 'district');
    await queryInterface.removeColumn('users', 'province');
  }
};
