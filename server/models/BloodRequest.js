import { DataTypes, Model } from 'sequelize';

class BloodRequest extends Model {
  static init(sequelize) {
    return super.init({
      patient_name: { type: DataTypes.STRING, allowNull: false },
      patient_age: { type: DataTypes.INTEGER, allowNull: false },
      patient_gender: { type: DataTypes.STRING, allowNull: false },
      contact_name: { type: DataTypes.STRING, allowNull: false },
      contact_phone: { type: DataTypes.STRING, allowNull: false },
      relationship: { type: DataTypes.STRING, allowNull: false },
      blood_type: { type: DataTypes.STRING, allowNull: false },
      rh_factor: { type: DataTypes.STRING, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      urgency: { type: DataTypes.STRING, allowNull: false },
      required_date: { type: DataTypes.DATEONLY, allowNull: true },
      purpose: { type: DataTypes.STRING, allowNull: false },
      hospital_name: { type: DataTypes.STRING, allowNull: false },
      hospital_address: { type: DataTypes.STRING, allowNull: false },
      province: { type: DataTypes.STRING, allowNull: false },
      district: { type: DataTypes.STRING, allowNull: false },
      municipality: { type: DataTypes.STRING, allowNull: false },
      ward: { type: DataTypes.STRING, allowNull: true },
      additional_info: { type: DataTypes.TEXT, allowNull: true },
      prescription_url: { type: DataTypes.STRING, allowNull: true },
      agreed_to_terms: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' }, // pending, completed, cancelled
      is_spam: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      admin_notes: { type: DataTypes.TEXT, allowNull: true },
      completed_at: { type: DataTypes.DATE, allowNull: true },
      marked_spam_at: { type: DataTypes.DATE, allowNull: true },
      user_id: { type: DataTypes.UUID, allowNull: true },
    }, {
      sequelize,
      modelName: 'BloodRequest',
      tableName: 'BloodRequests',
      timestamps: true
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  }
}

export default BloodRequest;
