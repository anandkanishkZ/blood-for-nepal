'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BloodRequests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      patient_name: { type: Sequelize.STRING, allowNull: false },
      patient_age: { type: Sequelize.INTEGER, allowNull: false },
      patient_gender: { type: Sequelize.STRING, allowNull: false },
      contact_name: { type: Sequelize.STRING, allowNull: false },
      contact_phone: { type: Sequelize.STRING, allowNull: false },
      relationship: { type: Sequelize.STRING, allowNull: false },
      blood_type: { type: Sequelize.STRING, allowNull: false },
      rh_factor: { type: Sequelize.STRING, allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      urgency: { type: Sequelize.STRING, allowNull: false },
      required_date: { type: Sequelize.DATEONLY, allowNull: true },
      purpose: { type: Sequelize.STRING, allowNull: false },
      hospital_name: { type: Sequelize.STRING, allowNull: false },
      hospital_address: { type: Sequelize.STRING, allowNull: false },
      province: { type: Sequelize.STRING, allowNull: false },
      district: { type: Sequelize.STRING, allowNull: false },
      municipality: { type: Sequelize.STRING, allowNull: false },
      ward: { type: Sequelize.STRING, allowNull: true },
      additional_info: { type: Sequelize.TEXT, allowNull: true },
      prescription_url: { type: Sequelize.STRING, allowNull: true },
      agreed_to_terms: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BloodRequests');
  }
};
