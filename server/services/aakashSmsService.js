import config from '../config/index.js';

/**
 * AakashSMS Service Implementation
 * Provider: AakashSMS (Nepal)
 * API Documentation: https://sms.aakashsms.com/
 */
class AakashSmsService {
  constructor() {
    this.baseUrl = config.aakashSms.baseUrl;
    this.authToken = config.aakashSms.authToken;
    this.enabled = config.aakashSms.enabled;
  }

  async sendOTP(phoneNumber, otp, userName = '') {
    try {
      // Check if AakashSMS is enabled
      if (!this.enabled) {
        throw new Error('AakashSMS service is disabled');
      }

      // Check if we're in development mode and SMS is disabled
      if (config.nodeEnv === 'development' && config.aakashSms.enableDevMode === false) {
        console.log('🧪 Development Mode: AakashSMS bypassed');
        console.log(`📱 Would send OTP ${otp} to ${phoneNumber}`);
        return {
          success: true,
          messageId: `dev_aakash_${Date.now()}`,
          message: 'SMS sent successfully (Development Mode)',
          phone: phoneNumber,
          response: { status: 'development_mode' }
        };
      }

      // Format phone number for Nepal
      const formattedPhone = this.formatNepalPhone(phoneNumber);
      
      // Create message with proper formatting
      const message = this.createOTPMessage(otp, userName);
      
      console.log(`🚀 Sending SMS via AakashSMS to ${formattedPhone}: ${message}`);

      // Prepare API request using AakashSMS v3 API
      const requestBody = {
        auth_token: this.authToken,
        to: formattedPhone,
        text: message
      };

      console.log('📝 AakashSMS API Parameters:', {
        ...requestBody,
        auth_token: '***hidden***'
      });

      // Make API request using POST method
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'BloodForNepal/1.0'
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('📱 AakashSMS Response Status:', response.status);
      console.log('📱 AakashSMS Response:', result);

      if (!response.ok) {
        console.error('❌ AakashSMS HTTP Error:', response.status, result);
        
        // Handle specific AakashSMS errors
        if (result.message && result.message.includes('Not enough balance')) {
          console.warn('💳 AakashSMS Account Balance Low - Using Development Mode');
          if (config.nodeEnv === 'development') {
            console.log(`📱 Development Fallback: OTP ${otp} for ${formattedPhone}`);
            return {
              success: true,
              messageId: `fallback_aakash_${Date.now()}`,
              message: 'SMS sent successfully (Fallback Mode - Check Console)',
              phone: formattedPhone,
              response: { status: 'fallback_mode', otp: otp }
            };
          }
        }
        
        throw new Error(result.message || `HTTP ${response.status}: ${JSON.stringify(result)}`);
      }

      // Check for success - AakashSMS returns { error: false } on success
      if (result.error === false) {
        return {
          success: true,
          messageId: result.data?.valid?.[0]?.id || Date.now().toString(),
          message: 'SMS sent successfully',
          phone: formattedPhone,
          response: result
        };
      } else {
        console.error('❌ AakashSMS API Error:', result);
        throw new Error(result.message || 'SMS sending failed');
      }

    } catch (error) {
      console.error('❌ AakashSMS Error:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('Invalid Nepal mobile number')) {
        throw new Error('कृपया मान्य नेपाली मोबाइल नम्बर प्रविष्ट गर्नुहोस्। (Please enter a valid Nepal mobile number)');
      }
      
      throw new Error('SMS पठाउन असफल भयो। कृपया फेरि प्रयास गर्नुहोस्। (Failed to send SMS. Please try again.)');
    }
  }

  formatNepalPhone(phone) {
    if (!phone) {
      throw new Error('Phone number is required');
    }

    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Remove country code if present
    if (cleaned.startsWith('977')) {
      cleaned = cleaned.substring(3);
    }
    
    // Remove leading zeros
    cleaned = cleaned.replace(/^0+/, '');
    
    // Validate Nepal mobile number format
    if (cleaned.length === 10 && cleaned.startsWith('98')) {
      return cleaned;
    }
    
    // Handle 9-digit numbers starting with 8 (add leading 9)
    if (cleaned.length === 9 && cleaned.startsWith('8')) {
      return '9' + cleaned;
    }
    
    throw new Error('Invalid Nepal mobile number format. Expected format: 98XXXXXXXX');
  }

  createOTPMessage(otp, userName = '') {
    const greeting = userName ? `Hello ${userName}!` : 'Hello!';
    
    return `${greeting} Your Blood For Nepal verification code: ${otp}

Expires in 10 minutes. Do not share.

-BFN Team`;
  }

  async checkBalance() {
    try {
      const response = await fetch('https://sms.aakashsms.com/sms/v4/available-credit', {
        method: 'GET',
        headers: {
          'auth-token': this.authToken,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (response.ok && result.response_code === 200) {
        return {
          success: true,
          balance: result.available_credit,
          provider: 'AakashSMS'
        };
      } else {
        throw new Error(result.message || 'Failed to check balance');
      }
    } catch (error) {
      console.error('❌ AakashSMS Balance Check Error:', error);
      return {
        success: false,
        error: error.message,
        provider: 'AakashSMS'
      };
    }
  }

  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Test SMS service
  async testService(testPhone = '9801234567') {
    try {
      const testOTP = '123456';
      console.log('🧪 Testing AakashSMS service...');
      
      const result = await this.sendOTP(testPhone, testOTP, 'Test User');
      console.log('✅ AakashSMS service test successful:', result);
      return true;
    } catch (error) {
      console.error('❌ AakashSMS service test failed:', error.message);
      return false;
    }
  }

  // Validate phone number without sending SMS
  validatePhone(phone) {
    try {
      const formatted = this.formatNepalPhone(phone);
      return {
        valid: true,
        formatted: formatted,
        message: 'Valid Nepal mobile number'
      };
    } catch (error) {
      return {
        valid: false,
        formatted: null,
        message: error.message
      };
    }
  }
}

export default new AakashSmsService();
