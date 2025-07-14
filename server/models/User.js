import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  // Instance method to check password
  async validatePassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Instance method to get public user data
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.reset_password_token;
    delete values.reset_password_expire;
    delete values.email_verification_token;
    delete values.sms_verification_otp;
    delete values.verification_expires;
    delete values.verification_attempts;
    return values;
  }

  // Static method to define the model
  static init(sequelize) {
    return super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Full name is required'
          },
          len: {
            args: [2, 100],
            msg: 'Full name must be between 2 and 100 characters'
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'Email address is already registered'
        },
        validate: {
          notEmpty: {
            msg: 'Email is required'
          },
          isEmail: {
            msg: 'Please provide a valid email address'
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Password is required'
          },
          len: {
            args: [6, 100],
            msg: 'Password must be at least 6 characters long'
          }
        }
      },
      blood_type: {
        type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Blood type is required'
          },
          isIn: {
            args: [['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']],
            msg: 'Please select a valid blood type'
          }
        }
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [10, 15],
            msg: 'Phone number must be between 10 and 15 digits'
          }
        }
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      province: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [2, 100],
            msg: 'Province name must be between 2 and 100 characters'
          }
        }
      },
      district: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [2, 100],
            msg: 'District name must be between 2 and 100 characters'
          }
        }
      },
      municipality: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [2, 100],
            msg: 'Municipality name must be between 2 and 100 characters'
          }
        }
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
          isDate: {
            msg: 'Please provide a valid date of birth'
          },
          isBefore: {
            args: new Date().toISOString(),
            msg: 'Date of birth cannot be in the future'
          }
        }
      },
      gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true
      },
      is_donor: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      block_note: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Admin note for blocking user'
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Profile photo URL path'
      },
      last_donation_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      emergency_contact: {
        type: DataTypes.STRING,
        allowNull: true
      },
      medical_conditions: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      approximate_weight: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          min: {
            args: [20],
            msg: 'Weight should be at least 20 kg'
          },
          max: {
            args: [300],
            msg: 'Weight should not exceed 300 kg'
          }
        }
      },
      verification_method: {
        type: DataTypes.ENUM('email', 'sms'),
        allowNull: true,
        comment: 'User chosen verification method'
      },
      is_email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      is_phone_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      email_verification_token: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Email verification token'
      },
      sms_verification_otp: {
        type: DataTypes.STRING(6),
        allowNull: true,
        comment: 'SMS OTP for phone verification'
      },
      verification_expires: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Expiration time for verification token/OTP'
      },
      verification_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Number of verification attempts for security'
      },
      reset_password_token: {
        type: DataTypes.STRING,
        allowNull: true
      },
      reset_password_expire: {
        type: DataTypes.DATE,
        allowNull: true
      },
      role: {
        type: DataTypes.ENUM('user', 'admin', 'moderator'),
        defaultValue: 'user'
      }
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      underscored: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(user.password, salt);
          }
        }
      },
      indexes: [
        {
          unique: true,
          fields: ['email']
        },
        {
          fields: ['blood_type']
        },
        {
          fields: ['is_donor']
        },
        {
          fields: ['is_active']
        },
        {
          fields: ['province']
        },
        {
          fields: ['district']
        },
        {
          fields: ['municipality']
        },
        {
          fields: ['province', 'district', 'municipality'],
          name: 'idx_users_location_composite'
        }
      ]
    });
  }

  // Static method for associations
  static associate(models) {
    // Define associations here when you add more models
    // Example: User.hasMany(models.BloodRequest, { foreignKey: 'user_id' });
  }
}

export default User;
