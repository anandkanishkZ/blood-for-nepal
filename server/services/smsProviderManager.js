import biraSmsService from './smsService.js';
import aakashSmsService from './aakashSmsService.js';
import config from '../config/index.js';

/**
 * SMS Provider Manager
 * Manages multiple SMS providers and handles failover
 */
class SmsProviderManager {
  constructor() {
    this.providers = {
      bira: biraSmsService,
      aakash: aakashSmsService
    };
    
    this.activeProvider = config.smsProvider.active || 'bira';
    this.enableFailover = config.smsProvider.enableFailover || false;
  }

  /**
   * Get the active SMS provider
   */
  getActiveProvider() {
    return this.providers[this.activeProvider];
  }

  /**
   * Get provider configuration
   */
  getProviderConfig() {
    return {
      active: this.activeProvider,
      enableFailover: this.enableFailover,
      providers: {
        bira: {
          name: 'BiraSMS',
          enabled: config.biraSms.enabled || true,
          devMode: config.biraSms.enableDevMode || false
        },
        aakash: {
          name: 'AakashSMS',
          enabled: config.aakashSms.enabled || true,
          devMode: config.aakashSms.enableDevMode || false
        }
      }
    };
  }

  /**
   * Set active SMS provider
   */
  setActiveProvider(providerName) {
    if (!this.providers[providerName]) {
      throw new Error(`Provider '${providerName}' not found`);
    }
    
    this.activeProvider = providerName;
    console.log(`📱 SMS Provider switched to: ${providerName.toUpperCase()}`);
    
    return {
      success: true,
      activeProvider: providerName,
      message: `SMS provider switched to ${providerName.toUpperCase()}`
    };
  }

  /**
   * Send OTP with automatic failover
   */
  async sendOTP(phoneNumber, otp, userName = '') {
    const primaryProvider = this.getActiveProvider();
    let lastError = null;

    // Try primary provider
    try {
      console.log(`📱 Attempting SMS via ${this.activeProvider.toUpperCase()}`);
      const result = await primaryProvider.sendOTP(phoneNumber, otp, userName);
      
      // Mark successful send
      result.provider = this.activeProvider.toUpperCase();
      return result;
      
    } catch (error) {
      console.log(`❌ Primary provider (${this.activeProvider.toUpperCase()}) failed:`, error.message);
      lastError = error;
      
      // If failover is disabled, throw the error
      if (!this.enableFailover) {
        throw error;
      }
    }

    // Try failover providers if enabled
    if (this.enableFailover) {
      const failoverProviders = Object.keys(this.providers).filter(name => name !== this.activeProvider);
      
      for (const providerName of failoverProviders) {
        try {
          console.log(`🔄 Trying failover provider: ${providerName.toUpperCase()}`);
          const provider = this.providers[providerName];
          const result = await provider.sendOTP(phoneNumber, otp, userName);
          
          // Mark as failover send
          result.provider = `${providerName.toUpperCase()} (Failover)`;
          result.isFailover = true;
          
          console.log(`✅ Failover successful via ${providerName.toUpperCase()}`);
          return result;
          
        } catch (failoverError) {
          console.log(`❌ Failover provider (${providerName.toUpperCase()}) also failed:`, failoverError.message);
          lastError = failoverError;
        }
      }
    }

    // All providers failed
    throw new Error(`All SMS providers failed. Last error: ${lastError.message}`);
  }

  /**
   * Check balance for all providers
   */
  async checkAllBalances() {
    const balances = {};
    
    for (const [name, provider] of Object.entries(this.providers)) {
      try {
        if (provider.checkBalance) {
          balances[name] = await provider.checkBalance();
        } else {
          balances[name] = {
            success: false,
            error: 'Balance check not supported',
            provider: name.toUpperCase()
          };
        }
      } catch (error) {
        balances[name] = {
          success: false,
          error: error.message,
          provider: name.toUpperCase()
        };
      }
    }
    
    return balances;
  }

  /**
   * Test all SMS providers
   */
  async testAllProviders(testPhone = '9801234567') {
    const testResults = {};
    
    for (const [name, provider] of Object.entries(this.providers)) {
      try {
        console.log(`\n🧪 Testing ${name.toUpperCase()} provider...`);
        testResults[name] = await provider.testService(testPhone);
      } catch (error) {
        console.error(`❌ ${name.toUpperCase()} test failed:`, error.message);
        testResults[name] = false;
      }
    }
    
    return testResults;
  }

  /**
   * Get provider statistics
   */
  getProviderStats() {
    return {
      activeProvider: this.activeProvider,
      enableFailover: this.enableFailover,
      availableProviders: Object.keys(this.providers),
      providersCount: Object.keys(this.providers).length
    };
  }

  /**
   * Validate phone number using active provider
   */
  validatePhone(phone) {
    const provider = this.getActiveProvider();
    return provider.validatePhone(phone);
  }

  /**
   * Generate OTP using active provider
   */
  generateOTP() {
    const provider = this.getActiveProvider();
    return provider.generateOTP();
  }
}

export default new SmsProviderManager();
