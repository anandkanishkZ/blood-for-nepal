import express from 'express';
import {
  register,
  registerDonor,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  blockUser,
  unblockUser,
  impersonateUser,
  getAdminStats,
  verifyUser,
  resendVerification,
  switchVerificationMethod,
  getVerificationStatus,
  verifyEmailLink
} from '../controllers/authController.js';
import { protect, authorize, requireVerification } from '../middleware/auth.js';
import {
  validateRegister,
  validateDonorRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange
} from '../validators/authValidators.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Verification routes (public)
router.post('/verify', verifyUser);
router.post('/resend-verification', resendVerification);
router.post('/switch-verification', switchVerificationMethod);
router.get('/verification-status/:userId', getVerificationStatus);
router.get('/verify-email', verifyEmailLink);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.post('/register-donor', validateDonorRegister, registerDonor);
router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', requireVerification, validateProfileUpdate, updateProfile);
router.put('/change-password', requireVerification, validatePasswordChange, changePassword);

// Admin routes
router.get('/users', authorize('admin'), getAllUsers);
router.put('/users/:id/block', authorize('admin'), blockUser);
router.put('/users/:id/unblock', authorize('admin'), unblockUser);
router.post('/users/:id/impersonate', authorize('admin'), impersonateUser);
router.get('/admin/stats', authorize('admin'), getAdminStats);

export default router;
