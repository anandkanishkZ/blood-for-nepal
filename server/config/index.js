// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

// Function to get email config dynamically
const getEmailConfig = () => ({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  from: process.env.EMAIL_FROM || 'noreply@bloodfornepal.org'
});

const config = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_PREFIX: process.env.API_PREFIX || '/api/v1',

  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'blood_for_nepal',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    dialect: process.env.DB_DIALECT || 'postgres',
    url: process.env.DATABASE_URL
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    expiresIn: process.env.JWT_EXPIRE || '7d',
    cookieExpire: process.env.JWT_COOKIE_EXPIRE || 7
  },

  // CORS Configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  },

  // Client URL for email links
  clientUrl: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173',

  // Rate Limiting
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100
  },

  // Security
  security: {
    bcryptSaltRounds: 12
  },

  // Email Configuration - use getter for dynamic loading
  get email() {
    return getEmailConfig();
  },



  // SMS Configuration (AakashSMS)
  aakashSms: {
    authToken: process.env.AAKASH_SMS_AUTH_TOKEN,
    baseUrl: process.env.AAKASH_SMS_BASE_URL || 'https://sms.aakashsms.com/sms/v3/send',
    enableDevMode: process.env.AAKASH_SMS_DEV_MODE !== 'false', // Enable by default in dev
    enabled: process.env.AAKASH_SMS_ENABLED !== 'false'
  },

  // SMS Provider Configuration
  smsProvider: {
    active: process.env.SMS_PROVIDER_ACTIVE || 'aakash', // Only 'aakash' supported now
    enableFailover: process.env.SMS_PROVIDER_FAILOVER === 'true',
  },

  // Node Environment
  nodeEnv: process.env.NODE_ENV || 'development',

  // Frontend URL
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // Verification Settings
  verification: {
    emailTokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
    smsOtpExpiry: 10 * 60 * 1000, // 10 minutes
    maxAttempts: 3
  }
};

export default config;
