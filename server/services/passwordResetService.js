import crypto from 'crypto';
import { Op } from 'sequelize';
import { AppError } from '../utils/errorHandler.js';
import emailService from './emailService.js';
import smsProviderManager from './smsProviderManager.js';
import models from '../models/index.js';
import config from '../config/index.js';

const { User } = models;

/**
 * Password Reset Service
 * Handles forgot password and reset password functionality
 */
class PasswordResetService {
  constructor() {
    this.resetTokenExpiry = 30 * 60 * 1000; // 30 minutes
    this.maxAttempts = 3; // Maximum reset attempts per day
  }

  /**
   * Generate a secure password reset token
   */
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate 6-digit OTP for SMS reset
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send password reset link/OTP
   */
  async sendPasswordReset(email, method = 'email') {
    try {
      // Find user by email
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        // For security, don't reveal if email exists or not
        return {
          success: true,
          message: 'यदि यो इमेल दर्ता गरिएको छ भने, तपाईंले पासवर्ड रिसेट निर्देशनहरू प्राप्त गर्नुहुनेछ। (If this email is registered, you will receive password reset instructions.)',
          method: method
        };
      }

      // Check if account is active
      if (!user.is_active) {
        throw new AppError('Account has been deactivated. Please contact support.', 403);
      }

      // Check rate limiting (max 3 attempts per day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const resetAttempts = await User.count({
        where: {
          id: user.id,
          reset_password_expire: {
            [Op.gte]: today
          }
        }
      });

      if (resetAttempts >= this.maxAttempts) {
        throw new AppError(
          'आजको लागि अधिकतम पासवर्ड रिसेट प्रयासहरू पुगिसकेको छ। कृपया भोलि फेरि प्रयास गर्नुहोस्। (Maximum password reset attempts reached for today. Please try again tomorrow.)',
          429
        );
      }

      if (method === 'email') {
        return await this.sendEmailReset(user);
      } else if (method === 'sms') {
        return await this.sendSMSReset(user);
      } else {
        throw new AppError('Invalid reset method', 400);
      }

    } catch (error) {
      console.error('Password reset error:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('पासवर्ड रिसेट पठाउन असफल भयो। कृपया फेरि प्रयास गर्नुहोस्। (Failed to send password reset. Please try again.)', 500);
    }
  }

  /**
   * Send password reset via email
   */
  async sendEmailReset(user) {
    const resetToken = this.generateResetToken();
    const expires = new Date(Date.now() + this.resetTokenExpiry);

    // Save reset token to database
    await user.update({
      reset_password_token: resetToken,
      reset_password_expire: expires
    });

    // Send reset email
    await emailService.sendPasswordResetEmail(user, resetToken);

    console.log(`📧 Password reset email sent to ${user.email}`);

    return {
      success: true,
      message: 'पासवर्ड रिसेट लिंक तपाईंको इमेलमा पठाइयो। (Password reset link sent to your email.)',
      method: 'email',
      expiresIn: '30 minutes',
      destination: `****${user.email.slice(-4)}`
    };
  }

  /**
   * Send password reset via SMS
   */
  async sendSMSReset(user) {
    if (!user.phone) {
      throw new AppError('No phone number associated with this account. Please use email reset.', 400);
    }

    const resetOTP = this.generateOTP();
    const expires = new Date(Date.now() + this.resetTokenExpiry);

    // Save reset token to database
    await user.update({
      reset_password_token: resetOTP,
      reset_password_expire: expires
    });

    // Send SMS with OTP
    const smsResult = await smsProviderManager.sendOTP(user.phone, resetOTP, user.full_name);

    console.log(`📱 Password reset OTP sent to ${user.phone} via ${smsResult.provider}`);

    return {
      success: true,
      message: `पासवर्ड रिसेट OTP तपाईंको फोनमा पठाइयो। (Password reset OTP sent to your phone via ${smsResult.provider})`,
      method: 'sms',
      expiresIn: '30 minutes',
      destination: `****${user.phone.slice(-4)}`,
      provider: smsResult.provider,
      isDevelopmentMode: smsResult.response?.status === 'development_mode',
      otp: smsResult.response?.status === 'development_mode' ? resetOTP : undefined
    };
  }

  /**
   * Verify reset token/OTP and reset password
   */
  async resetPassword(token, newPassword, method = 'email') {
    try {
      // Find user with valid reset token
      const user = await User.findOne({
        where: {
          reset_password_token: token,
          reset_password_expire: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        throw new AppError(
          'अवैध वा म्याद सकिएको रिसेट टोकन। कृपया नयाँ पासवर्ड रिसेट अनुरोध गर्नुहोस्। (Invalid or expired reset token. Please request a new password reset.)',
          400
        );
      }

      // Check if account is active
      if (!user.is_active) {
        throw new AppError('Account has been deactivated. Please contact support.', 403);
      }

      // Update password and clear reset token
      await user.update({
        password: newPassword,
        reset_password_token: null,
        reset_password_expire: null
      });

      // Send confirmation email
      try {
        await emailService.sendPasswordResetConfirmation(user);
      } catch (emailError) {
        console.log('Password reset confirmation email failed (non-critical):', emailError.message);
      }

      console.log(`✅ Password reset successful for user ${user.email}`);

      return {
        success: true,
        message: 'पासवर्ड सफलतापूर्वक रिसेट गरियो। अब तपाईं नयाँ पासवर्डले लगइन गर्न सक्नुहुन्छ। (Password reset successfully. You can now login with your new password.)',
        method: method
      };

    } catch (error) {
      console.error('Password reset error:', error);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('पासवर्ड रिसेट गर्न असफल भयो। कृपया फेरि प्रयास गर्नुहोस्। (Failed to reset password. Please try again.)', 500);
    }
  }

  /**
   * Verify reset token without resetting password
   */
  async verifyResetToken(token) {
    try {
      const user = await User.findOne({
        where: {
          reset_password_token: token,
          reset_password_expire: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        return {
          valid: false,
          message: 'अवैध वा म्याद सकिएको रिसेट टोकन। (Invalid or expired reset token.)'
        };
      }

      const timeRemaining = Math.max(0, new Date(user.reset_password_expire) - new Date());
      const minutesRemaining = Math.floor(timeRemaining / (1000 * 60));

      return {
        valid: true,
        message: 'वैध रिसेट टोकन। (Valid reset token.)',
        expiresIn: `${minutesRemaining} minutes`,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name
        }
      };

    } catch (error) {
      console.error('Token verification error:', error);
      return {
        valid: false,
        message: 'टोकन प्रमाणीकरण असफल भयो। (Token verification failed.)'
      };
    }
  }

  /**
   * Clean up expired reset tokens (can be run periodically)
   */
  async cleanupExpiredTokens() {
    try {
      const result = await User.update(
        {
          reset_password_token: null,
          reset_password_expire: null
        },
        {
          where: {
            reset_password_expire: {
              [Op.lt]: new Date()
            }
          }
        }
      );

      console.log(`🧹 Cleaned up ${result[0]} expired password reset tokens`);
      return result[0];
    } catch (error) {
      console.error('Token cleanup error:', error);
      return 0;
    }
  }
}

export default new PasswordResetService();
