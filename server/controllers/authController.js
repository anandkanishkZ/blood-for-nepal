import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import models from '../models/index.js';
import config from '../config/index.js';
import { AppError } from '../utils/errorHandler.js';
import verificationService from '../services/verificationService.js';
import emailService from '../services/emailService.js';
import passwordResetService from '../services/passwordResetService.js';

const { User } = models;

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
};

// Set JWT Cookie
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(Date.now() + config.jwt.cookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('token', token, cookieOptions);
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()));
    }

    const { 
      fullName, 
      email, 
      password, 
      bloodType, 
      phone, 
      verificationMethod = 'email' // Default to email if not specified
    } = req.body;

    // Validate verification method
    if (!['email', 'sms'].includes(verificationMethod)) {
      return next(new AppError('Invalid verification method. Choose email or sms.', 400));
    }

    // Validate required fields based on verification method
    if (verificationMethod === 'sms' && !phone) {
      return next(new AppError('Phone number is required for SMS verification', 400));
    }

    // Check if user already exists
    const whereCondition = email ? { email } : {};
    if (phone && verificationMethod === 'sms') {
      whereCondition[Op.or] = [{ email }, { phone }];
    }

    const existingUser = await User.findOne({ where: whereCondition });

    if (existingUser) {
      // Check if user is already verified
      if (existingUser.is_email_verified || existingUser.is_phone_verified) {
        return next(new AppError(
          'An account with this email already exists. Please login or use the forgot password option if you\'ve forgotten your password.', 
          409
        ));
      }
      
      // User exists but not verified - resend verification
      try {
        const result = await verificationService.sendVerification(existingUser, verificationMethod);
        
        return res.status(200).json({
          success: true,
          message: `खाता पहिले नै छ। ${result.message} (Account already exists. ${result.message})`,
          data: {
            userId: existingUser.id,
            method: result.method,
            expiresIn: result.expiresIn,
            destination: result.destination,
            needsVerification: true,
            isDevelopmentMode: result.isDevelopmentMode,
            otp: result.otp,
            fallbackMode: result.fallbackMode
          }
        });
      } catch (verificationError) {
        return next(verificationError);
      }
    }

    // Create new user
    const userData = {
      full_name: fullName,
      email,
      password,
      blood_type: bloodType,
      is_email_verified: false,
      is_phone_verified: false,
      verification_attempts: 0
    };

    // Add phone if provided
    if (phone) {
      userData.phone = phone;
    }

    const user = await User.create(userData);

    // Send verification based on chosen method
    try {
      const result = await verificationService.sendVerification(user, verificationMethod);

      res.status(201).json({
        success: true,
        message: `खाता सफलतापूर्वक बनाइयो! ${result.message} (Registration successful! ${result.message})`,
        data: {
          userId: user.id,
          method: result.method,
          expiresIn: result.expiresIn,
          destination: result.destination,
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            blood_type: user.blood_type,
            phone: user.phone ? `****${user.phone.slice(-4)}` : null
          },
          needsVerification: true,
          isDevelopmentMode: result.isDevelopmentMode,
          otp: result.otp,
          fallbackMode: result.fallbackMode
        }
      });
    } catch (verificationError) {
      // If verification fails, we should still inform about successful registration
      res.status(201).json({
        success: true,
        message: 'खाता सफलतापूर्वक बनाइयो तर प्रमाणीकरण पठाउन असफल भयो। कृपया फेरि प्रयास गर्नुहोस्। (Registration successful but verification failed to send. Please try again.)',
        data: {
          userId: user.id,
          needsVerification: true,
          verificationError: verificationError.message
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()));
    }

    const { email, password } = req.body;

    // Check if user exists and include password for validation
    const user = await User.findOne({
      where: { email },
      attributes: { include: ['password'] }
    });

    if (!user) {
      return next(new AppError('No account found with this email address. Please create an account first.', 404));
    }

    // Check if account is active
    if (!user.is_active) {
      return next(new AppError('Account has been deactivated. Please contact support.', 401));
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if user is verified (either email or phone)
    if (!user.is_email_verified && !user.is_phone_verified) {
      return res.status(200).json({
        success: false,
        needsVerification: true,
        message: 'Account verification required. Please verify your email or phone first.',
        data: {
          userId: user.id,
          email: user.email,
          phone: user.phone,
          is_email_verified: user.is_email_verified,
          is_phone_verified: user.is_phone_verified,
          verification_method: user.verification_method || 'email'
        }
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Set cookie
    setTokenCookie(res, token);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    res.cookie('token', '', {
      expires: new Date(0),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()));
    }

    const allowedFields = [
      'full_name',
      'phone',
      'address',
      'province',
      'district',
      'municipality',
      'date_of_birth',
      'gender',
      'emergency_contact',
      'medical_conditions',
      'approximate_weight',
      'blood_type',
      'is_donor'
    ];

    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    const [updatedRowsCount] = await User.update(updateData, {
      where: { id: req.user.id },
      returning: true
    });

    if (updatedRowsCount === 0) {
      return next(new AppError('User not found', 404));
    }

    const updatedUser = await User.findByPk(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()));
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findByPk(req.user.id, {
      attributes: { include: ['password'] }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Validate current password
    const isValidPassword = await user.validatePassword(currentPassword);
    if (!isValidPassword) {
      return next(new AppError('Current password is incorrect', 400));
    }

    // Update password
    await user.update({ password: newPassword });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donors (public for find-donor page)
// @route   GET /api/v1/auth/donors
// @access  Public
export const getDonors = async (req, res, next) => {
  try {
    const donors = await User.findAll({
      where: {
        is_donor: true,
        is_active: true,
        phone: { [Op.ne]: null },
        blood_type: { [Op.ne]: null }
      },
      attributes: { 
        exclude: ['password', 'email_verification_token', 'sms_verification_otp', 
                 'reset_password_token', 'reset_password_expire', 'verification_expires'] 
      },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      data: { donors }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/v1/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID (admin only)
// @route   GET /api/v1/auth/users/:id
// @access  Private/Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block a user (admin only)
// @route   PUT /api/v1/auth/users/:id/block
// @access  Private/Admin
export const blockUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { block_note } = req.body;

    // Only allow blocking users, not admins
    const user = await User.findByPk(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    if (user.role !== 'user') {
      return next(new AppError('Only regular users can be blocked.', 400));
    }
    if (user.is_active === false) {
      return next(new AppError('User is already blocked.', 400));
    }
    if (!block_note || !block_note.trim()) {
      return next(new AppError('Block note is required.', 400));
    }

    user.is_active = false;
    user.block_note = block_note;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User has been blocked.',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unblock a user (admin only)
// @route   PUT /api/v1/auth/users/:id/unblock
// @access  Private/Admin
export const unblockUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    // Only allow unblocking users, not admins
    const user = await User.findByPk(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    if (user.role !== 'user') {
      return next(new AppError('Only regular users can be unblocked.', 400));
    }
    if (user.is_active === true) {
      return next(new AppError('User is not blocked.', 400));
    }
    user.is_active = true;
    user.block_note = null;
    await user.save();
    res.status(200).json({
      success: true,
      message: 'User has been unblocked.',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Impersonate a user (admin only)
// @route   POST /api/v1/auth/users/:id/impersonate
// @access  Private/Admin
export const impersonateUser = async (req, res, next) => {
  try {
    const admin = req.user;
    const userId = req.params.id;
    if (admin.role !== 'admin') {
      return next(new AppError('Only admins can impersonate users.', 403));
    }
    if (admin.id === userId) {
      return next(new AppError('You are already logged in as this user.', 400));
    }
    const user = await User.findByPk(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    // Optionally, prevent impersonating other admins
    // if (user.role !== 'user') {
    //   return next(new AppError('Can only impersonate regular users.', 400));
    // }
    // Generate a JWT for the target user
    const token = generateToken(user.id);
    // Log the impersonation (could be extended to DB/audit log)
    console.log(`[IMPERSONATE] Admin ${admin.email} (${admin.id}) is impersonating user ${user.email} (${user.id})`);
    res.status(200).json({
      success: true,
      message: `Impersonation token generated for user ${user.email}`,
      data: { token, user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/v1/auth/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const activeDonors = await User.count({ where: { is_donor: true, is_active: true } });
    // TODO: Replace with real pending requests count from requests table
    const pendingRequests = 0;
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeDonors,
        pendingRequests
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register donor with extended information
// @route   POST /api/v1/auth/register-donor
// @access  Private (user must be logged in)
export const registerDonor = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()));
    }

    const { 
      patientName, 
      phoneNumber,
      email,
      dateOfBirth,
      gender,
      bloodType,
      rhFactor,
      lastDonation,
      medicalConditions,
      location,
      street,
      availableForEmergency
    } = req.body;

    // Combine blood type and Rh factor
    const fullBloodType = bloodType && rhFactor ? `${bloodType}${rhFactor}` : null;

    // Update user with extended donor information
    const updateData = {
      full_name: patientName,
      phone: phoneNumber,
      date_of_birth: dateOfBirth,
      gender,
      blood_type: fullBloodType,
      last_donation_date: lastDonation,
      medical_conditions: medicalConditions,
      emergency_contact: phoneNumber, // Using phone as emergency contact for now
      is_donor: true,
      // Store location information in address field (can be improved with separate location table later)
      address: location && location.province ? 
        `${street || ''}, ${location.municipality || ''}, ${location.district || ''}, ${location.province || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '') 
        : street || null
    };

    // Remove empty/null values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === null || updateData[key] === '' || updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Update the user
    const [updatedRowsCount] = await User.update(updateData, {
      where: { id: req.user.id },
      returning: true
    });

    if (updatedRowsCount === 0) {
      return next(new AppError('User not found', 404));
    }

    // Get the updated user
    const updatedUser = await User.findByPk(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Donor registration completed successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify user (email or SMS)
// @route   POST /api/v1/auth/verify
// @access  Public
export const verifyUser = async (req, res, next) => {
  try {
    const { userId, code, method } = req.body;

    if (!userId || !code || !method) {
      return next(new AppError('User ID, verification code, and method are required', 400));
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Verify the code
    const verificationResult = await verificationService.verifyCode(user, code, method);

    // Generate login token
    const token = generateToken(user.id);
    setTokenCookie(res, token);

    // Send welcome email if email was verified
    if (method === 'email' && user.is_email_verified) {
      try {
        await emailService.sendWelcomeEmail(user);
      } catch (emailError) {
        console.log('Welcome email failed (non-critical):', emailError.message);
      }
    }

    // Refresh user data
    await user.reload();

    res.status(200).json({
      success: true,
      message: `${verificationResult.message} Blood For Nepal मा स्वागत छ! (${verificationResult.message} Welcome to Blood For Nepal!)`,
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          blood_type: user.blood_type,
          is_email_verified: user.is_email_verified,
          is_phone_verified: user.is_phone_verified,
          is_donor: user.is_donor,
          role: user.role
        },
        token,
        verificationStatus: verificationService.getVerificationStatus(user)
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification
// @route   POST /api/v1/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return next(new AppError('User ID is required', 400));
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.is_email_verified || user.is_phone_verified) {
      return next(new AppError('User is already verified', 400));
    }

    const result = await verificationService.resendVerification(user);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        method: result.method,
        expiresIn: result.expiresIn,
        destination: result.destination,
        isDevelopmentMode: result.isDevelopmentMode,
        otp: result.otp,
        fallbackMode: result.fallbackMode
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Switch verification method
// @route   POST /api/v1/auth/switch-verification
// @access  Public
export const switchVerificationMethod = async (req, res, next) => {
  try {
    const { userId, newMethod } = req.body;

    if (!userId || !newMethod) {
      return next(new AppError('User ID and new method are required', 400));
    }

    if (!['email', 'sms'].includes(newMethod)) {
      return next(new AppError('Invalid verification method', 400));
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.is_email_verified || user.is_phone_verified) {
      return next(new AppError('User is already verified', 400));
    }

    const result = await verificationService.switchVerificationMethod(user, newMethod);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        method: result.method,
        expiresIn: result.expiresIn,
        destination: result.destination,
        isDevelopmentMode: result.isDevelopmentMode,
        otp: result.otp,
        fallbackMode: result.fallbackMode
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get verification status
// @route   GET /api/v1/auth/verification-status/:userId
// @access  Public
export const getVerificationStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const status = verificationService.getVerificationStatus(user);

    res.status(200).json({
      success: true,
      data: {
        userId: user.id,
        verificationRequired: verificationService.isVerificationRequired(user),
        ...status
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Verify email via link (for email verification)
// @route   GET /api/v1/auth/verify-email
// @access  Public
export const verifyEmailLink = async (req, res, next) => {
  try {
    const { token, email } = req.query;
    
    console.log('📧 Email verification request:', { token, email });

    if (!token || !email) {
      console.log('❌ Missing token or email');
      return next(new AppError('Invalid verification link', 400));
    }

    // First, check if user exists and is already verified
    const existingUser = await User.findOne({
      where: {
        email: decodeURIComponent(email)
      }
    });

    if (existingUser && existingUser.is_email_verified) {
      console.log('✅ User already verified, redirecting to success');
      // Generate login token for already verified user
      const loginToken = generateToken(existingUser.id);
      setTokenCookie(res, loginToken);
      return res.status(200).json({
        success: true,
        message: 'Email already verified! You are now logged in.',
        data: {
          user: {
            id: existingUser.id,
            full_name: existingUser.full_name,
            email: existingUser.email,
            blood_type: existingUser.blood_type,
            is_email_verified: existingUser.is_email_verified,
            is_phone_verified: existingUser.is_phone_verified
          },
          token: loginToken,
          redirectTo: '/dashboard',
          alreadyVerified: true
        }
      });
    }

    // Check for pending verification (token must match and not be expired)
    const user = await User.findOne({
      where: {
        email: decodeURIComponent(email),
        email_verification_token: token,
        verification_expires: {
          [Op.gt]: new Date()
        }
      }
    });

    // If not found, do NOT verify, and do NOT update user
    if (!user) {
      console.log('❌ User not found or token expired/invalid');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification link.',
        data: { alreadyVerified: false }
      });
    }

    console.log('✅ User found, proceeding with verification');

    // Verify using the verification service
    const verificationResult = await verificationService.verifyCode(user, token, 'email');
    
    console.log('✅ Verification service completed:', verificationResult);

    // Generate login token
    const loginToken = generateToken(user.id);
    setTokenCookie(res, loginToken);

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user);
    } catch (emailError) {
      console.log('Welcome email failed (non-critical):', emailError.message);
    }

    // Refresh user data
    await user.reload();

    console.log('✅ Email verification completed successfully');

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You are now logged in.',
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          blood_type: user.blood_type,
          is_email_verified: user.is_email_verified,
          is_phone_verified: user.is_phone_verified
        },
        token: loginToken,
        redirectTo: '/dashboard'
      }
    });
  } catch (error) {
    console.error('❌ Email verification error:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    next(error);
  }
};

// @desc    Forgot password - send reset link/OTP
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()));
    }

    const { email, method = 'email' } = req.body;

    console.log(`🔑 Password reset requested for: ${email} via ${method}`);

    const result = await passwordResetService.sendPasswordReset(email, method);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        method: result.method,
        expiresIn: result.expiresIn,
        destination: result.destination,
        provider: result.provider,
        isDevelopmentMode: result.isDevelopmentMode,
        otp: result.otp // Only included in development mode for SMS
      }
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    next(error);
  }
};

// @desc    Reset password with token/OTP
// @route   POST /api/v1/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, errors.array()));
    }

    const { token, password, method = 'email' } = req.body;

    console.log(`🔄 Password reset attempt with ${method} method`);

    const result = await passwordResetService.resetPassword(token, password, method);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        method: result.method,
        redirectTo: '/login'
      }
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    next(error);
  }
};

// @desc    Verify reset token
// @route   GET /api/v1/auth/verify-reset-token/:token
// @access  Public
export const verifyResetToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    console.log(`🔍 Verifying reset token`);

    const result = await passwordResetService.verifyResetToken(token);

    res.status(200).json({
      success: result.valid,
      message: result.message,
      data: result.valid ? {
        expiresIn: result.expiresIn,
        user: result.user
      } : null
    });

  } catch (error) {
    console.error('❌ Verify reset token error:', error);
    next(error);
  }
};
