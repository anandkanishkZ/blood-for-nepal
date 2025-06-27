import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  blockUser,
  unblockUser,
  impersonateUser,
  getAdminStats
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange
} from '../validators/authValidators.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', validateProfileUpdate, updateProfile);
router.put('/change-password', validatePasswordChange, changePassword);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/block', protect, authorize('admin'), blockUser);
router.put('/users/:id/unblock', protect, authorize('admin'), unblockUser);
router.post('/users/:id/impersonate', protect, authorize('admin'), impersonateUser);
router.get('/admin/stats', protect, authorize('admin'), getAdminStats);

export default router;
