import express from 'express';
import { getDashboardStats, getPublicStats } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/dashboard/public-stats - Get public homepage statistics (No auth required)
router.get('/public-stats', getPublicStats);

// GET /api/dashboard/stats - Get dashboard statistics (Admin only)
router.get('/stats', protect, authorize('admin'), getDashboardStats);

export default router;
