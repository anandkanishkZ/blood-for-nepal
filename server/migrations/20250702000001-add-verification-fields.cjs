'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'verification_method', {
      type: Sequelize.ENUM('email', 'sms'),
      allowNull: true,
      comment: 'User chosen verification method'
    });

    await queryInterface.addColumn('users', 'is_phone_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    await queryInterface.addColumn('users', 'sms_verification_otp', {
      type: Sequelize.STRING(6),
      allowNull: true,
      comment: 'SMS OTP for phone verification'
    });

    await queryInterface.addColumn('users', 'verification_expires', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Expiration time for verification token/OTP'
    });

    await queryInterface.addColumn('users', 'verification_attempts', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Number of verification attempts for security'
    });

    // Update existing email_verification_token column comment
    await queryInterface.changeColumn('users', 'email_verification_token', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Email verification token'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'verification_method');
    await queryInterface.removeColumn('users', 'is_phone_verified');
    await queryInterface.removeColumn('users', 'sms_verification_otp');
    await queryInterface.removeColumn('users', 'verification_expires');
    await queryInterface.removeColumn('users', 'verification_attempts');
  }
};
