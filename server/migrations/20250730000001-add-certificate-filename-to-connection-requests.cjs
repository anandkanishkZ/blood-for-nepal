"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('connection_requests', 'certificate_filename', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'donation_status' // Place after donation_status if supported
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('connection_requests', 'certificate_filename');
  }
};
