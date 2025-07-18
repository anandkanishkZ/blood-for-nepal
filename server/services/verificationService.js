import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import emailService from './emailService.js';
import smsProviderManager from './smsProviderManager.js';
import config from '../config/index.js';
import { AppError } from '../utils/errorHandler.js';

class VerificationService {
  constructor() {
    this.maxAttempts = config.verification.maxAttempts;
    this.emailTokenExpiry = config.verification.emailTokenExpiry;
    this.smsOtpExpiry = config.verification.smsOtpExpiry;
  }

  async sendVerification(user, method) {
    try {
      // Check attempt limits
      if (user.verification_attempts >= this.maxAttempts) {
        throw new AppError(
          `अधिकतम प्रयास सीमा पार भयो। कृपया सहयोगलाई सम्पर्क गर्नुहोस्। (Maximum verification attempts exceeded. Please contact support.)`,
          429
        );
      }

      // Validate method and user data
      if (!['email', 'sms'].includes(method)) {
        throw new AppError('Invalid verification method', 400);
      }

      if (method === 'email' && !user.email) {
        throw new AppError('Email address is required for email verification', 400);
      }

      if (method === 'sms' && !user.phone) {
        throw new AppError('Phone number is required for SMS verification', 400);
      }

      // Check if already verified
      if (method === 'email' && user.is_email_verified) {
        throw new AppError('Email is already verified', 400);
      }

      if (method === 'sms' && user.is_phone_verified) {
        throw new AppError('Phone number is already verified', 400);
      }

      switch (method) {
        case 'email':
          return await this.sendEmailVerification(user);
        case 'sms':
          return await this.sendSmsVerification(user);
        default:
          throw new AppError('Invalid verification method', 400);
      }
    } catch (error) {
      // Log error for debugging
      console.error('Verification sending failed:', error);
      throw error;
    }
  }

  async sendEmailVerification(user) {
    try {
      const token = uuidv4();
      const expires = new Date(Date.now() + this.emailTokenExpiry);

      // Update user with verification data
      await user.update({
        verification_method: 'email',
        email_verification_token: token,
        verification_expires: expires,
        verification_attempts: user.verification_attempts + 1
      });

      // Send email
      await emailService.sendVerificationEmail(user, token);
      
      console.log(`📧 Email verification sent to ${user.email}`);

      return {
        method: 'email',
        message: 'प्रमाणीकरण इमेल सफलतापूर्वक पठाइयो। (Verification email sent successfully)',
        expiresIn: '24 hours',
        destination: user.email
      };
    } catch (error) {
      console.error('Email verification failed:', error);
      throw new AppError('इमेल पठाउन असफल भयो। कृपया फेरि प्रयास गर्नुहोस्। (Failed to send verification email)', 500);
    }
  }

  async sendSmsVerification(user) {
    try {
      // Validate phone number format
      const phoneValidation = smsProviderManager.validatePhone(user.phone);
      if (!phoneValidation.valid) {
        throw new AppError(phoneValidation.message, 400);
      }

      const otp = smsProviderManager.generateOTP();
      const expires = new Date(Date.now() + this.smsOtpExpiry);

      // Update user with verification data
      await user.update({
        verification_method: 'sms',
        sms_verification_otp: otp,
        verification_expires: expires,
        verification_attempts: user.verification_attempts + 1
      });

      // Send SMS using provider manager (with automatic failover)
      const smsResult = await smsProviderManager.sendOTP(phoneValidation.formatted, otp, user.full_name);
      
      console.log(`📱 SMS OTP sent to ${phoneValidation.formatted} via ${smsResult.provider}`);

      // Handle different response types (including development fallback)
      let message = `OTP तपाईंको फोनमा पठाइयो। (OTP sent to your phone via ${smsResult.provider})`;
      let isDevelopmentMode = false;
      
      if (smsResult.response?.status === 'development_mode') {
        message = `🧪 विकास मोड: OTP कन्सोलमा देख्नुहोस्। (Development Mode: Check console for OTP)`;
        isDevelopmentMode = true;
        console.log(`🔑 DEVELOPMENT OTP for ${user.full_name} (${phoneValidation.formatted}): ${otp}`);
      } else if (smsResult.response?.status === 'fallback_mode') {
        message = '⚠️ SMS सेवामा समस्या छ। OTP: ' + otp + ' (SMS service issue. Your OTP is: ' + otp + ')';
        isDevelopmentMode = true;
        console.log(`🔑 FALLBACK OTP for ${user.full_name} (${phoneValidation.formatted}): ${otp}`);
      } else if (smsResult.isFailover) {
        message = `OTP तपाईंको फोनमा पठाइयो। (OTP sent via backup provider: ${smsResult.provider})`;
      }

      return {
        method: 'sms',
        message: message,
        expiresIn: '10 minutes',
        destination: `****${phoneValidation.formatted.slice(-4)}`,
        isDevelopmentMode: isDevelopmentMode,
        otp: isDevelopmentMode ? otp : undefined, // Include OTP for development/fallback mode
        fallbackMode: smsResult.response?.status === 'fallback_mode',
        provider: smsResult.provider,
        isFailover: smsResult.isFailover || false
      };
    } catch (error) {
      console.error('SMS verification failed:', error);
      
      // Better error handling for different types of SMS failures
      if (error.message.includes('insufficient funds') || error.message.includes('Not enough balance')) {
        throw new AppError(
          'SMS सेवामा समयिक समस्या छ। कृपया इमेल प्रमाणीकरण प्रयोग गर्नुहोस् वा केही समयपछि प्रयास गर्नुहोस्। (SMS service temporarily unavailable. Please use email verification or try again later.)', 
          503
        );
      }
      
      throw new AppError(error.message || 'SMS पठाउन असफल भयो। कृपया फेरि प्रयास गर्नुहोस्। (Failed to send SMS)', 500);
    }
  }

  async verifyCode(user, code, method) {
    try {
      // Check if verification has expired
      if (!user.verification_expires || new Date() > user.verification_expires) {
        throw new AppError(
          'प्रमाणीकरण कोडको अवधि समाप्त भयो। कृपया नयाँ कोड माग्नुहोस्। (Verification code has expired. Please request a new code)',
          400
        );
      }

      // Check if method matches
      if (user.verification_method !== method) {
        throw new AppError('Verification method mismatch', 400);
      }

      let isValid = false;
      let fieldToUpdate = {};

      switch (method) {
        case 'email':
          isValid = user.email_verification_token === code;
          if (isValid) {
            fieldToUpdate = {
              is_email_verified: true,
              email_verification_token: null
            };
          }
          break;
        case 'sms':
          isValid = user.sms_verification_otp === code;
          if (isValid) {
            fieldToUpdate = {
              is_phone_verified: true,
              sms_verification_otp: null
            };
          }
          break;
        default:
          throw new AppError('Invalid verification method', 400);
      }

      if (!isValid) {
        throw new AppError(
          'गलत प्रमाणीकरण कोड। कृपया फेरि प्रयास गर्नुहोस्। (Invalid verification code. Please try again)',
          400
        );
      }

      // Mark as verified and clear verification data
      await user.update({
        ...fieldToUpdate,
        verification_method: null,
        verification_expires: null,
        verification_attempts: 0
      });

      console.log(`✅ ${method} verification successful for user ${user.id}`);

      return {
        success: true,
        method: method,
        message: `${method === 'email' ? 'इमेल' : 'फोन'} सफलतापूर्वक प्रमाणीकरण भयो! (${method === 'email' ? 'Email' : 'Phone'} verified successfully!)`
      };
    } catch (error) {
      console.error('Code verification failed:', error);
      throw error;
    }
  }

  async resendVerification(user) {
    try {
      if (!user.verification_method) {
        throw new AppError('No verification method set. Please start the registration process again.', 400);
      }

      // Check if already verified
      if (user.verification_method === 'email' && user.is_email_verified) {
        throw new AppError('Email is already verified', 400);
      }

      if (user.verification_method === 'sms' && user.is_phone_verified) {
        throw new AppError('Phone number is already verified', 400);
      }

      // Check rate limiting (minimum 1 minute between resends)
      if (user.verification_expires) {
        const timeSinceLastSend = Date.now() - (user.verification_expires.getTime() - 
          (user.verification_method === 'email' ? this.emailTokenExpiry : this.smsOtpExpiry));
        
        if (timeSinceLastSend < 60000) { // 1 minute
          const waitTime = Math.ceil((60000 - timeSinceLastSend) / 1000);
          throw new AppError(`कृपया ${waitTime} सेकेन्ड पर्खनुहोस्। (Please wait ${waitTime} seconds before resending)`, 429);
        }
      }

      return await this.sendVerification(user, user.verification_method);
    } catch (error) {
      console.error('Resend verification failed:', error);
      throw error;
    }
  }

  async switchVerificationMethod(user, newMethod) {
    try {
      if (!['email', 'sms'].includes(newMethod)) {
        throw new AppError('Invalid verification method', 400);
      }

      // Check if already verified with any method
      if (user.is_email_verified || user.is_phone_verified) {
        throw new AppError('User is already verified', 400);
      }

      // Validate required data for new method
      if (newMethod === 'email' && !user.email) {
        throw new AppError('Email address is required', 400);
      }

      if (newMethod === 'sms' && !user.phone) {
        throw new AppError('Phone number is required', 400);
      }

      // Clear previous verification data
      await user.update({
        verification_method: null,
        email_verification_token: null,
        sms_verification_otp: null,
        verification_expires: null,
        verification_attempts: 0
      });

      // Send verification with new method
      const result = await this.sendVerification(user, newMethod);

      console.log(`🔄 Switched verification method to ${newMethod} for user ${user.id}`);

      return {
        ...result,
        message: `प्रमाणीकरण विधि ${newMethod} मा परिवर्तन गरियो। ${result.message} (Switched to ${newMethod} verification. ${result.message})`
      };
    } catch (error) {
      console.error('Switch verification method failed:', error);
      throw error;
    }
  }

  // Check if user needs verification
  isVerificationRequired(user) {
    return !user.is_email_verified && !user.is_phone_verified;
  }

  // Get verification status
  getVerificationStatus(user) {
    return {
      emailVerified: user.is_email_verified,
      phoneVerified: user.is_phone_verified,
      hasActiveVerification: !!user.verification_method,
      activeMethod: user.verification_method,
      attemptsLeft: Math.max(0, this.maxAttempts - user.verification_attempts),
      expiresAt: user.verification_expires,
      verificationExpires: user.verification_expires, // Add both for compatibility
      // For development mode, we could expose the OTP if in fallback mode
      // This would require storing the fallback mode state in the user model
    };
  }

  // Clean up expired verification attempts (can be called by a cron job)
  async cleanupExpiredVerifications() {
    try {
      const User = (await import('../models/index.js')).default.User;
      
      const expiredUsers = await User.findAll({
        where: {
          verification_expires: {
            [Op.lt]: new Date()
          },
          verification_method: {
            [Op.not]: null
          }
        }
      });

      for (const user of expiredUsers) {
        await user.update({
          verification_method: null,
          email_verification_token: null,
          sms_verification_otp: null,
          verification_expires: null
        });
      }

      console.log(`🧹 Cleaned up ${expiredUsers.length} expired verifications`);
      return expiredUsers.length;
    } catch (error) {
      console.error('Cleanup expired verifications failed:', error);
      return 0;
    }
  }
}

export default new VerificationService();
