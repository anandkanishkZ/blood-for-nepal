import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import models from '../models/index.js';
import config from '../config/index.js';
import { AppError } from '../utils/errorHandler.js';

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

    const { fullName, email, password, bloodType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }

    // Create user
    const user = await User.create({
      full_name: fullName,
      email,
      password,
      blood_type: bloodType
    });

    // Generate token
    const token = generateToken(user.id);

    // Set cookie
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
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
      return next(new AppError('Invalid email or password', 401));
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
    console.log('=== DONOR REGISTRATION DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
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
