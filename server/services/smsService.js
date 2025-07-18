import config from '../config/index.js';

class SmsService {
  constructor() {
    this.baseUrl = config.biraSms.baseUrl;
    this.apiKey = config.biraSms.apiKey;
    this.routeId = config.biraSms.routeId;
    this.username = config.biraSms.username;
    this.password = config.biraSms.password;
    this.campaign = config.biraSms.campaign;
  }

  async sendOTP(phoneNumber, otp, userName = '') {
    try {
      // Check if we're in development mode and SMS is disabled
      if (config.nodeEnv === 'development' && config.biraSms.enableDevMode === false) {
        console.log('🧪 Development Mode: SMS bypassed');
        console.log(`📱 Would send OTP ${otp} to ${phoneNumber}`);
        return {
          success: true,
          messageId: `dev_${Date.now()}`,
          message: 'SMS sent successfully (Development Mode)',
          phone: phoneNumber,
          response: { status: 'development_mode' }
        };
      }

      // Format phone number for Nepal
      const formattedPhone = this.formatNepalPhone(phoneNumber);
      
      // Create message with proper formatting
      const message = this.createOTPMessage(otp, userName);
      
      // Prepare API parameters for POST request according to BiraSMS documentation
      const params = new URLSearchParams({
        key: this.apiKey,              // Use 'key' not 'api_key'
        campaign: this.campaign,       // Use campaign from config
        routeid: this.routeId,         // Use 'routeid' not 'senderid'
        type: 'text',                  // SMS type
        responsetype: 'json',          // Response format
        contacts: formattedPhone,      // Phone number
        msg: message                   // Message content
      });

      console.log(`🚀 Sending SMS to ${formattedPhone}: ${message}`);
      console.log('📝 API Parameters:', Object.fromEntries(params));

      // Make API request using POST method as per BiraSMS documentation
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'BloodForNepal/1.0'
        },
        body: params
      });

      const result = await response.text();
      console.log('📱 BiraSMS Response Status:', response.status);
      console.log('📱 BiraSMS Response:', result);

      // Parse response (BiraSMS returns different formats)
      let parsedResult;
      try {
        parsedResult = JSON.parse(result);
      } catch (e) {
        // If not JSON, treat as text response
        console.log('⚠️ Non-JSON response received:', result);
        parsedResult = { message: result, status: response.ok ? 'success' : 'error' };
      }

      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, result);
        
        // Handle specific BiraSMS errors
        if (result.includes('insufficient funds')) {
          console.warn('💳 BiraSMS Account Balance Low - Using Development Mode');
          if (config.nodeEnv === 'development') {
            console.log(`📱 Development Fallback: OTP ${otp} for ${formattedPhone}`);
            return {
              success: true,
              messageId: `fallback_${Date.now()}`,
              message: 'SMS sent successfully (Fallback Mode - Check Console)',
              phone: formattedPhone,
              response: { status: 'fallback_mode', otp: otp }
            };
          }
        }
        
        throw new Error(parsedResult.message || `HTTP ${response.status}: ${result}`);
      }

      // Check for success indicators - BiraSMS returns message ID on success
      const isSuccess = this.checkSMSSuccess(result, parsedResult);

      if (!isSuccess) {
        console.error('❌ SMS API Error:', parsedResult);
        throw new Error(parsedResult.message || 'SMS sending failed');
      }

      return {
        success: true,
        messageId: parsedResult.messageId || parsedResult.id || Date.now().toString(),
        message: 'SMS sent successfully',
        phone: formattedPhone,
        response: parsedResult
      };

    } catch (error) {
      console.error('❌ BiraSMS Error:', error);
      
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

  checkSMSSuccess(textResponse, jsonResponse) {
    // BiraSMS returns a message ID (32-character hex string) on success
    // Check if response is a valid message ID or contains success indicators
    const messageIdPattern = /^[a-f0-9]{32}$/i;
    
    // Check if response looks like a message ID
    if (messageIdPattern.test(textResponse.trim())) {
      return true;
    }
    
    // Check for error patterns first
    const errorIndicators = [
      'ERR:',
      'error',
      'failed',
      'invalid',
      'insufficient funds'
    ];
    
    const responseString = (textResponse + JSON.stringify(jsonResponse)).toLowerCase();
    
    // If contains error indicators, it's definitely not success
    if (errorIndicators.some(indicator => responseString.includes(indicator.toLowerCase()))) {
      return false;
    }
    
    // Check for success indicators
    const successIndicators = [
      'success',
      'sent',
      'queued',
      'delivered',
      'message sent',
      'OK'
    ];
    
    return successIndicators.some(indicator => 
      responseString.includes(indicator.toLowerCase())
    );
  }

  async checkDeliveryStatus(messageId) {
    try {
      const params = new URLSearchParams({
        key: this.apiKey,
        responsetype: 'json',
        messageid: messageId
      });

      const response = await fetch(`${this.baseUrl}/status?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      return {
        success: response.ok,
        status: result.status || 'unknown',
        data: result
      };
    } catch (error) {
      console.error('📱 SMS Status Check Error:', error);
      return {
        success: false,
        status: 'error',
        error: error.message
      };
    }
  }

  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Test SMS service (sends a test message)
  async testService(testPhone = '9801234567') {
    try {
      const testOTP = '123456';
      console.log('🧪 Testing SMS service...');
      
      const result = await this.sendOTP(testPhone, testOTP, 'Test User');
      console.log('✅ SMS service test successful:', result);
      return true;
    } catch (error) {
      console.error('❌ SMS service test failed:', error.message);
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

export default new SmsService();
