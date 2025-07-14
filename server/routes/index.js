import express from 'express';
import authRoutes from './auth.js';
import uploadRoutes from './uploadRoutes.js';
import adminRoutes from './admin/index.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Blood For Nepal API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/', uploadRoutes);
router.use('/admin', adminRoutes);

export default router;
