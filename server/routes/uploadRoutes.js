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

export default router;
