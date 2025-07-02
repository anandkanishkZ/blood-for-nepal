import path from 'path';
import fs from 'fs';
import models from '../models/index.js';

const { User } = models;

const uploadPhoto = async (req, res) => {
  console.log('=== UPLOAD PHOTO DEBUG ===');
  console.log('Upload endpoint hit', req.method);
  console.log('User from middleware:', req.user ? { id: req.user.id, email: req.user.email } : 'NO USER');
  console.log('Request file:', req.file);
  console.log('Request body:', req.body);
  console.log('Request headers auth:', req.headers.authorization);
  
  try {
    if (!req.file) {
      console.log('No file uploaded or invalid file type');
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded or invalid file type.' 
      });
    }

    // Verify file was actually saved
    const filePath = path.join(process.cwd(), 'uploads', req.file.filename);
    if (!fs.existsSync(filePath)) {
      console.error('File was not saved to disk:', filePath);
      return res.status(500).json({ 
        success: false,
        error: 'File upload failed - file not saved to disk.' 
      });
    }

    console.log('File saved successfully at:', filePath);

    // Return the URL path that can be accessed via the static file server
    const fileUrl = `/uploads/${req.file.filename}`;
    console.log('Generated file URL:', fileUrl);
    
    // If user is authenticated, save the avatar to their profile
    if (req.user && req.user.id) {
      console.log('Updating user avatar for user ID:', req.user.id);
      console.log('Avatar URL to save:', fileUrl);
      
      try {
        const updateResult = await User.update(
          { avatar: fileUrl },
          { where: { id: req.user.id } }
        );
        console.log('User avatar update result:', updateResult);
        
        // Verify the update worked by fetching the updated user
        const updatedUser = await User.findByPk(req.user.id, {
          attributes: ['id', 'avatar', 'full_name', 'updated_at']
        });
        console.log('Updated user after avatar save:', updatedUser ? {
          id: updatedUser.id,
          avatar: updatedUser.avatar,
          full_name: updatedUser.full_name,
          updated_at: updatedUser.updated_at
        } : 'User not found');
        
        if (!updatedUser || updatedUser.avatar !== fileUrl) {
          console.error('AVATAR UPDATE FAILED - Expected:', fileUrl, 'Got:', updatedUser ? updatedUser.avatar : 'null');
          throw new Error('Failed to update user avatar in database');
        } else {
          console.log('✓ Avatar update verified successfully');
        }
      } catch (dbError) {
        console.error('Database update error:', dbError);
        // Clean up the uploaded file if database update fails
        try {
          fs.unlinkSync(filePath);
          console.log('Cleaned up uploaded file due to database error');
        } catch (cleanupError) {
          console.error('Failed to clean up file:', cleanupError);
        }
        throw dbError;
      }
    } else {
      console.log('❌ No user found in request - authentication failed');
    }
    
    console.log('=== UPLOAD RESPONSE ===');
    console.log('Sending response with filePath:', fileUrl);
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
