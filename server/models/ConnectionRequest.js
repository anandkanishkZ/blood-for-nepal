import { DataTypes, Model } from 'sequelize';

class ConnectionRequest extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      requester_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      donor_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      blood_request_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'blood_requests',
          key: 'id'
        }
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending'
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      response_message: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      sequelize,
      tableName: 'connection_requests',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'requester_id', as: 'requester' });
    this.belongsTo(models.User, { foreignKey: 'donor_id', as: 'donor' });
    this.belongsTo(models.BloodRequest, { foreignKey: 'blood_request_id', as: 'bloodRequest' });
  }
}

export default ConnectionRequest;
