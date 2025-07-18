import { DataTypes, Model } from 'sequelize';

class ActivityLog extends Model {
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      blood_request_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'BloodRequests',
          key: 'id'
        }
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      activity_type: {
        type: DataTypes.ENUM(
          'created',
          'donor_accepted', 
          'donor_rejected',
          'status_changed',
          'marked_spam',
          'marked_completed',
          'admin_note_added',
          'connection_requested',
          'reverted_to_pending',
          'moved_to_trash',
          'restored_from_trash',
          'permanently_deleted'
        ),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      old_value: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      new_value: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSON,
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
      modelName: 'ActivityLog',
      tableName: 'ActivityLogs',
      timestamps: true
    });
  }

  static associate(models) {
    this.belongsTo(models.BloodRequest, { foreignKey: 'blood_request_id', as: 'bloodRequest' });
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  }
}

export default ActivityLog;
