import express from 'express';
import smsProviderManager from '../../services/smsProviderManager.js';
import { protect, authorize } from '../../middleware/auth.js';
import { AppError } from '../../utils/errorHandler.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// @desc    Get SMS provider configuration
// @route   GET /api/v1/admin/sms-providers
// @access  Admin
router.get('/', async (req, res, next) => {
  try {
    const config = smsProviderManager.getProviderConfig();
    const stats = smsProviderManager.getProviderStats();
    
    res.status(200).json({
      success: true,
      data: {
        ...config,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Switch active SMS provider
// @route   POST /api/v1/admin/sms-providers/switch
// @access  Admin
router.post('/switch', async (req, res, next) => {
  try {
    const { provider } = req.body;
    
    if (!provider) {
      return next(new AppError('Provider name is required', 400));
    }
    
    const result = smsProviderManager.setActiveProvider(provider);
    
    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Test SMS providers
// @route   POST /api/v1/admin/sms-providers/test
// @access  Admin
router.post('/test', async (req, res, next) => {
  try {
    const { phone = '9801234567', provider } = req.body;
    
    let testResults;
    
    if (provider) {
      // Test specific provider
      const providerService = smsProviderManager.providers[provider];
      if (!providerService) {
        return next(new AppError(`Provider '${provider}' not found`, 404));
      }
      
      testResults = {
        [provider]: await providerService.testService(phone)
      };
    } else {
      // Test all providers
      testResults = await smsProviderManager.testAllProviders(phone);
    }
    
    res.status(200).json({
      success: true,
      data: {
        testResults,
        testPhone: phone
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Check SMS provider balances
// @route   GET /api/v1/admin/sms-providers/balance
// @access  Admin
router.get('/balance', async (req, res, next) => {
  try {
    const balances = await smsProviderManager.checkAllBalances();
    
    res.status(200).json({
      success: true,
      data: {
        balances,
        checkedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Send test OTP
// @route   POST /api/v1/admin/sms-providers/test-otp
// @access  Admin
router.post('/test-otp', async (req, res, next) => {
  try {
    const { phone, message = 'Test OTP from Blood For Nepal Admin Panel' } = req.body;
    
    if (!phone) {
      return next(new AppError('Phone number is required', 400));
    }
    
    const otp = smsProviderManager.generateOTP();
    const result = await smsProviderManager.sendOTP(phone, otp, 'Admin Test');
    
    res.status(200).json({
      success: true,
      message: 'Test OTP sent successfully',
      data: {
        phone,
        otp: otp, // Include OTP for admin testing
        provider: result.provider,
        messageId: result.messageId,
        isFailover: result.isFailover || false,
        isDevelopmentMode: result.response?.status === 'development_mode' || result.response?.status === 'fallback_mode'
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get SMS provider statistics and health
// @route   GET /api/v1/admin/sms-providers/health
// @access  Admin
router.get('/health', async (req, res, next) => {
  try {
    const config = smsProviderManager.getProviderConfig();
    const balances = await smsProviderManager.checkAllBalances();
    
    // Calculate health status for each provider
    const providerHealth = {};
    
    for (const [name, provider] of Object.entries(config.providers)) {
      const balance = balances[name];
      
      providerHealth[name] = {
        name: provider.name,
        enabled: provider.enabled,
        devMode: provider.devMode,
        isActive: name === config.active,
        balance: balance?.success ? balance.balance : 'Unknown',
        status: provider.enabled ? 
          (balance?.success ? 'Healthy' : 'Balance Check Failed') : 
          'Disabled'
      };
    }
    
    res.status(200).json({
      success: true,
      data: {
        activeProvider: config.active,
        failoverEnabled: config.enableFailover,
        providers: providerHealth,
        systemStatus: Object.values(providerHealth).some(p => p.enabled && p.status === 'Healthy') ? 'Operational' : 'Degraded'
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
