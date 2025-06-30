module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('users');
    if (!tableDescription.avatar) {
      await queryInterface.addColumn('users', 'avatar', {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Profile photo URL path'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'avatar');
  }
};
