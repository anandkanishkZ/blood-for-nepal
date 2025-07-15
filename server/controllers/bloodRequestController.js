import BloodRequest from '../models/BloodRequest.js';
import models from '../models/index.js';

// Create a new blood request
export const createBloodRequest = async (req, res) => {
  try {
    const data = req.body;
    
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required to create blood request' 
      });
    }
    
    // If prescription file is uploaded, attach its URL
    if (req.file) {
      data.prescription_url = `/uploads/${req.file.filename}`;
    }
    
    // Associate the blood request with the logged-in user
    data.user_id = req.user.id;
    
    const bloodRequest = await BloodRequest.create(data);
    
    // Return the created request with user information
    const createdRequest = await BloodRequest.findByPk(bloodRequest.id, {
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'phone']
      }]
    });
    
    res.status(201).json({ 
      success: true, 
      bloodRequest: createdRequest,
      message: 'Blood request created successfully'
    });
  } catch (error) {
    console.error('Error creating blood request:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create blood request'
    });
  }
};

// Get all blood requests (for admin or listing)
export const getAllBloodRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.findAll({
      order: [['createdAt', 'DESC']],
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'phone', 'role']
      }]
    });
    
    res.json({ 
      success: true, 
      requests,
      message: `Found ${requests.length} blood requests`
    });
  } catch (error) {
    console.error('Error fetching blood requests:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch blood requests'
    });
  }
};

// Get a single blood request by ID
export const getBloodRequestById = async (req, res) => {
  try {
    const request = await BloodRequest.findByPk(req.params.id, {
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'phone', 'role', 'blood_type', 'is_donor']
      }]
    });
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood request not found' 
      });
    }
    
    res.json({ 
      success: true, 
      request,
      message: 'Blood request retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching blood request:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch blood request'
    });
  }
};

// Soft delete a blood request (Admin only) - Move to trash
export const deleteBloodRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood request not found' 
      });
    }
    
    // Soft delete - move to trash
    await request.update({
      status: 'cancelled',
      admin_notes: 'Moved to trash',
      updated_at: new Date()
    });
    
    res.json({ 
      success: true, 
      message: 'Blood request moved to trash successfully'
    });
  } catch (error) {
    console.error('Error moving blood request to trash:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to move blood request to trash'
    });
  }
};

// Permanently delete a blood request (Admin only) - Delete from trash
export const permanentlyDeleteBloodRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood request not found' 
      });
    }
    
    // Check if it's in trash (cancelled status)
    if (request.status !== 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Blood request must be in trash before permanent deletion' 
      });
    }
    
    await request.destroy();
    
    res.json({ 
      success: true, 
      message: 'Blood request permanently deleted successfully'
    });
  } catch (error) {
    console.error('Error permanently deleting blood request:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to permanently delete blood request'
    });
  }
};

// Mark blood request as spam (Admin only)
export const markAsSpam = async (req, res) => {
  try {
    const { admin_notes } = req.body;
    
    const request = await BloodRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood request not found' 
      });
    }
    
    await request.update({
      is_spam: true,
      marked_spam_at: new Date(),
      admin_notes: admin_notes || null
    });
    
    res.json({ 
      success: true, 
      message: 'Blood request marked as spam successfully'
    });
  } catch (error) {
    console.error('Error marking blood request as spam:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to mark blood request as spam'
    });
  }
};

// Mark blood request as completed (Admin only)
export const markAsCompleted = async (req, res) => {
  try {
    const { admin_notes } = req.body;
    
    const request = await BloodRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood request not found' 
      });
    }
    
    await request.update({
      status: 'completed',
      completed_at: new Date(),
      admin_notes: admin_notes || null
    });
    
    res.json({ 
      success: true, 
      message: 'Blood request marked as completed successfully'
    });
  } catch (error) {
    console.error('Error marking blood request as completed:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to mark blood request as completed'
    });
  }
};

// Update blood request status (Admin only)
export const updateStatus = async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    
    const request = await BloodRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood request not found' 
      });
    }
    
    const updateData = {
      status,
      admin_notes: admin_notes || null
    };
    
    if (status === 'completed') {
      updateData.completed_at = new Date();
    }
    
    await request.update(updateData);
    
    res.json({ 
      success: true, 
      message: `Blood request status updated to ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating blood request status:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update blood request status'
    });
  }
};

// Revert blood request (Admin only) - reset to pending and remove spam/completed flags
export const revertBloodRequest = async (req, res) => {
  try {
    const { admin_notes } = req.body;
    
    const request = await BloodRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood request not found' 
      });
    }
    
    await request.update({
      status: 'pending',
      is_spam: false,
      completed_at: null,
      marked_spam_at: null,
      admin_notes: admin_notes || null
    });
    
    res.json({ 
      success: true, 
      message: 'Blood request reverted to pending status successfully'
    });
  } catch (error) {
    console.error('Error reverting blood request:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to revert blood request'
    });
  }
};

// Restore blood request from trash (Admin only)
export const restoreBloodRequest = async (req, res) => {
  try {
    const { admin_notes } = req.body;
    
    const request = await BloodRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood request not found' 
      });
    }
    
    // Check if it's in trash (cancelled status)
    if (request.status !== 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Blood request is not in trash' 
      });
    }
    
    await request.update({
      status: 'pending',
      admin_notes: admin_notes || 'Restored from trash',
      updated_at: new Date()
    });
    
    res.json({ 
      success: true, 
      message: 'Blood request restored from trash successfully'
    });
  } catch (error) {
    console.error('Error restoring blood request from trash:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to restore blood request from trash'
    });
  }
};
