import path from 'path';
import fs from 'fs';
import models from '../models/index.js';

const { User } = models;

const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded or invalid file type.' 
      });
    }

    // Verify file was actually saved
    const filePath = path.join(process.cwd(), 'uploads', req.file.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ 
        success: false,
        error: 'File upload failed - file not saved to disk.' 
      });
    }

    // Return the URL path that can be accessed via the static file server
    const fileUrl = `/uploads/${req.file.filename}`;
    
    // If user is authenticated, save the avatar to their profile
    if (req.user && req.user.id) {
      try {
        await User.update(
          { avatar: fileUrl },
          { where: { id: req.user.id } }
        );
        
        // Verify the update worked by fetching the updated user
        const updatedUser = await User.findByPk(req.user.id, {
          attributes: ['id', 'avatar', 'full_name', 'updated_at']
        });
        
        if (!updatedUser || updatedUser.avatar !== fileUrl) {
          throw new Error('Failed to update user avatar in database');
        }
      } catch (dbError) {
        // Clean up the uploaded file if database update fails
        try {
          fs.unlinkSync(filePath);
        } catch (cleanupError) {
          console.error('Failed to clean up file:', cleanupError);
        }
        throw dbError;
      }
    }
    
    res.status(200).json({ 
      message: 'File uploaded successfully!', 
      filePath: fileUrl,
      success: true 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to upload file.' 
    });
  }
};

export { uploadPhoto };
