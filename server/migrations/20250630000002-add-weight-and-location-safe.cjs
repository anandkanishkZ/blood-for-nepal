'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Add weight field for medical information
      await queryInterface.addColumn('users', 'approximate_weight', {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Approximate weight in kilograms'
      });
      console.log('✅ Added approximate_weight column');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ approximate_weight column already exists, skipping...');
      } else {
        throw error;
      }
    }

    // Check and add location fields if they don't exist
    try {
      await queryInterface.addColumn('users', 'province', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'User province/state'
      });
      console.log('✅ Added province column');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ province column already exists, skipping...');
      } else {
        throw error;
      }
    }

    try {
      await queryInterface.addColumn('users', 'district', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'User district'
      });
      console.log('✅ Added district column');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ district column already exists, skipping...');
      } else {
        throw error;
      }
    }

    try {
      await queryInterface.addColumn('users', 'municipality', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'User municipality/city'
      });
      console.log('✅ Added municipality column');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ municipality column already exists, skipping...');
      } else {
        throw error;
      }
    }

    // Add indexes for location fields for better search performance
    try {
      await queryInterface.addIndex('users', ['province'], {
        name: 'idx_users_province'
      });
      console.log('✅ Added province index');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ province index already exists, skipping...');
      }
    }

    try {
      await queryInterface.addIndex('users', ['district'], {
        name: 'idx_users_district'
      });
      console.log('✅ Added district index');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ district index already exists, skipping...');
      }
    }

    try {
      await queryInterface.addIndex('users', ['municipality'], {
        name: 'idx_users_municipality'
      });
      console.log('✅ Added municipality index');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ municipality index already exists, skipping...');
      }
    }

    try {
      await queryInterface.addIndex('users', ['province', 'district', 'municipality'], {
        name: 'idx_users_location_composite'
      });
      console.log('✅ Added location composite index');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ location composite index already exists, skipping...');
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    try {
      await queryInterface.removeIndex('users', 'idx_users_location_composite');
    } catch (error) {
      console.log('⚠️ Could not remove location composite index:', error.message);
    }

    try {
      await queryInterface.removeIndex('users', 'idx_users_municipality');
    } catch (error) {
      console.log('⚠️ Could not remove municipality index:', error.message);
    }

    try {
      await queryInterface.removeIndex('users', 'idx_users_district');
    } catch (error) {
      console.log('⚠️ Could not remove district index:', error.message);
    }

    try {
      await queryInterface.removeIndex('users', 'idx_users_province');
    } catch (error) {
      console.log('⚠️ Could not remove province index:', error.message);
    }

    // Remove columns
    try {
      await queryInterface.removeColumn('users', 'approximate_weight');
    } catch (error) {
      console.log('⚠️ Could not remove approximate_weight column:', error.message);
    }

    try {
      await queryInterface.removeColumn('users', 'municipality');
    } catch (error) {
      console.log('⚠️ Could not remove municipality column:', error.message);
    }

    try {
      await queryInterface.removeColumn('users', 'district');
    } catch (error) {
      console.log('⚠️ Could not remove district column:', error.message);
    }

    try {
      await queryInterface.removeColumn('users', 'province');
    } catch (error) {
      console.log('⚠️ Could not remove province column:', error.message);
    }
  }
};
