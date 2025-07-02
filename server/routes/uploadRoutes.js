import express from 'express';
import upload from '../middleware/multerConfig.js';
import { uploadPhoto } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import models from '../models/index.js';

const { User } = models;

const router = express.Router();

// Test endpoint to verify upload route is working
router.get('/test', (req, res) => {
  res.json({ message: 'Upload routes are working correctly' });
});

// Route for uploading profile photo (protected route, with multer error handling)
router.post('/upload', protect, (req, res, next) => {
  upload.single('profilePhoto')(req, res, function (err) {
    if (err) {
      console.error('Multer error:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        stack: err.stack
      });
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false,
          error: 'File too large. Maximum size is 2MB.' 
        });
      } else if (err.message.includes('Only images')) {
        return res.status(400).json({ 
          success: false,
          error: 'Only image files (jpeg, jpg, png) are allowed.' 
        });
      } else {
        return res.status(400).json({ 
          success: false,
          error: err.message 
        });
      }
    }
    
    next();
  });
}, uploadPhoto);

// Test endpoint to check user data in database
router.get('/user-debug', protect, async (req, res) => {
  try {
    if (req.user && req.user.id) {
      const user = await User.findByPk(req.user.id);
      
      res.json({
        success: true,
        userFromMiddleware: req.user,
        userFromDatabase: user
      });
    } else {
      res.status(401).json({ error: 'No user in request' });
    }
  } catch (error) {
    console.error('User debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Direct database test endpoint
router.post('/test-avatar-update', protect, async (req, res) => {
  try {
    console.log('=== DIRECT AVATAR UPDATE TEST ===');
    console.log('User ID:', req.user.id);
    
    const testAvatarUrl = '/uploads/test-avatar.jpg';
    
    // Direct update using raw query
    const [affectedRows] = await User.update(
      { avatar: testAvatarUrl },
      { 
        where: { id: req.user.id },
        returning: true // This doesn't work in MySQL, but helps in PostgreSQL
      }
    );
    
    console.log('Affected rows:', affectedRows);
    
    // Fetch the updated user
    const updatedUser = await User.findByPk(req.user.id);
    console.log('User after update:', {
      id: updatedUser.id,
      avatar: updatedUser.avatar,
      updatedAt: updatedUser.updatedAt
    });
    
    res.json({
      success: true,
      message: 'Direct avatar update test',
      affectedRows,
      user: updatedUser
    });
  } catch (error) {
    console.error('Direct avatar update test error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
