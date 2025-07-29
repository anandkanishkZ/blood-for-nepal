import BloodRequest from '../models/BloodRequest.js';
import models, { sequelize } from '../models/index.js';
import ActivityLogService from '../services/activityLogService.js';
import CertificateService from '../services/certificateService.js';
import { Op } from 'sequelize';

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
    
    // Log the blood request creation
    await ActivityLogService.logBloodRequestCreated(bloodRequest.id, req.user.id);
    
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
    const { view } = req.query; // 'all', 'active', 'trash'
    
    let whereCondition = {};
    
    // Filter based on view mode
    switch (view) {
      case 'trash':
        whereCondition.deleted_at = { [Op.ne]: null };
        whereCondition.permanently_deleted_at = null; // Not permanently deleted
        break;
      case 'active':
        whereCondition.deleted_at = null; // Not deleted
        break;
      default: // 'all' - show both active and trash but not permanently deleted
        whereCondition.permanently_deleted_at = null;
        break;
    }

    const bloodRequests = await BloodRequest.findAll({
      where: whereCondition,
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'phone', 'address']
      }, {
        model: models.User,
        as: 'deleter',
        attributes: ['id', 'full_name', 'email']
      }],
      order: [['created_at', 'DESC']]
    });
    
    res.json({ 
      success: true, 
      bloodRequests 
    });
  } catch (error) {
    console.error('Error fetching blood requests:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch blood requests'
    });
  }
};

// Get current user's blood requests
export const getMyBloodRequests = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    console.log('getMyBloodRequests called for user:', req.user.id);

    const bloodRequests = await BloodRequest.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'phone', 'address']
      }],
      order: [['created_at', 'DESC']]
    });
    
    console.log('Found blood requests:', bloodRequests.length);
    
    res.json({ 
      success: true, 
      bloodRequests 
    });
  } catch (error) {
    console.error('Error fetching user blood requests:', error);
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

    // Check if user has permission to view this request
    // Users can view their own requests, admins can view all
    if (req.user.role !== 'admin' && request.user_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to view this blood request' 
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

// Delete a blood request (Admin only) - Soft Delete to Trash
export const deleteBloodRequest = async (req, res) => {
  try {
    const { deletion_reason } = req.body;
    
    const request = await BloodRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood request not found' 
      });
    }

    // Check if already deleted
    if (request.deleted_at) {
      return res.status(400).json({ 
        success: false, 
        message: 'Blood request is already in trash' 
      });
    }
    
    // Soft delete - move to trash
    await request.update({
      deleted_at: new Date(),
      deleted_by: req.user?.id,
      deletion_reason: deletion_reason || null
    });

    // Log the soft deletion
    await ActivityLogService.logMovedToTrash(
      request.id,
      req.user?.id,
      deletion_reason
    );
    
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

// Restore blood request from trash (Admin only)
export const restoreBloodRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood request not found' 
      });
    }

    // Check if it's in trash
    if (!request.deleted_at) {
      return res.status(400).json({ 
        success: false, 
        message: 'Blood request is not in trash' 
      });
    }

    // Check if permanently deleted
    if (request.permanently_deleted_at) {
      return res.status(400).json({ 
        success: false, 
        message: 'Blood request has been permanently deleted and cannot be restored' 
      });
    }
    
    // Restore from trash
    await request.update({
      deleted_at: null,
      deleted_by: null,
      deletion_reason: null
    });

    // Log the restoration
    await ActivityLogService.logRestoredFromTrash(
      request.id,
      req.user?.id
    );
    
    res.json({ 
      success: true, 
      message: 'Blood request restored from trash successfully'
    });
  } catch (error) {
    console.error('Error restoring blood request:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to restore blood request'
    });
  }
};

// Permanently delete blood request (Admin only)
export const permanentlyDeleteBloodRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood request not found' 
      });
    }

    // Check if it's in trash first
    if (!request.deleted_at) {
      return res.status(400).json({ 
        success: false, 
        message: 'Blood request must be in trash before permanent deletion' 
      });
    }
    
    // Log the permanent deletion before destroying
    await ActivityLogService.logPermanentlyDeleted(
      request.id,
      req.user?.id,
      request.patient_name
    );

    // Permanently delete
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

    // Log the spam marking
    await ActivityLogService.logMarkedAsSpam(
      request.id,
      req.user?.id,
      admin_notes
    );
    
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

    const oldStatus = request.status;
    
    await request.update({
      status: 'completed',
      completed_at: new Date(),
      admin_notes: admin_notes || null
    });

    // Log the completion
    await ActivityLogService.logMarkedAsCompleted(
      request.id,
      req.user?.id,
      admin_notes
    );

    // Also log status change if it wasn't already completed
    if (oldStatus !== 'completed') {
      await ActivityLogService.logStatusChanged(
        request.id,
        req.user?.id,
        oldStatus,
        'completed',
        'Marked as completed by admin'
      );
    }
    
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

// Send connection request to donor
export const sendConnectionRequest = async (req, res) => {
  try {
    const { donorId, bloodRequestId } = req.body;
    
    console.log('sendConnectionRequest called with:', {
      donorId,
      bloodRequestId,
      requesterId: req.user?.id
    });
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Verify blood request belongs to current user
    const bloodRequest = await BloodRequest.findOne({
      where: { 
        id: bloodRequestId,
        user_id: req.user.id,
        status: 'pending'
      }
    });

    if (!bloodRequest) {
      console.log('Blood request not found:', { bloodRequestId, userId: req.user.id });
      return res.status(404).json({ 
        success: false, 
        message: 'Blood request not found or not eligible' 
      });
    }

    // Check if donor exists and is a donor
    const donor = await models.User.findOne({
      where: { 
        id: donorId,
        is_donor: true
      }
    });

    if (!donor) {
      console.log('Donor not found:', { donorId });
      return res.status(404).json({ 
        success: false, 
        message: 'Donor not found' 
      });
    }

    // Check if connection request already exists
    const existingConnection = await models.ConnectionRequest.findOne({
      where: {
        requester_id: req.user.id,
        donor_id: donorId,
        blood_request_id: bloodRequestId
      }
    });

    if (existingConnection) {
      console.log('Existing connection found:', existingConnection.toJSON());
      return res.status(400).json({ 
        success: false, 
        message: 'Connection request already sent to this donor' 
      });
    }

    // Create connection request
    const connectionRequest = await models.ConnectionRequest.create({
      requester_id: req.user.id,
      donor_id: donorId,
      blood_request_id: bloodRequestId,
      status: 'pending'
    });

    // Log the connection request
    await ActivityLogService.logConnectionRequested(
      bloodRequestId,
      req.user.id,
      donorId,
      donor.full_name
    );

    console.log('Connection request created:', connectionRequest.toJSON());

    res.json({ 
      success: true, 
      message: 'Connection request sent successfully',
      connectionRequest
    });
  } catch (error) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to send connection request'
    });
  }
};

// Get connection requests for current user (as donor)
export const getConnectionRequests = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    console.log('getConnectionRequests called for user:', req.user.id);

    const connectionRequests = await models.ConnectionRequest.findAll({
      where: { donor_id: req.user.id },
      include: [
        {
          model: models.User,
          as: 'requester',
          attributes: ['id', 'full_name', 'email', 'phone', 'address']
        },
        {
          model: models.BloodRequest,
          as: 'bloodRequest',
          attributes: [
            'id', 'blood_type', 'rh_factor', 'quantity', 'urgency', 'hospital_name', 'hospital_address',
            'patient_name', 'patient_age', 'patient_gender', 'contact_name', 'contact_phone', 'relationship',
            'required_date', 'purpose', 'additional_info', 'province', 'district', 'municipality', 'ward',
            'created_at', 'status'
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    console.log('Found connection requests:', connectionRequests.length);

    res.json({ 
      success: true, 
      connectionRequests 
    });
  } catch (error) {
    console.error('Error fetching connection requests:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch connection requests'
    });
  }
};

// Respond to connection request
export const respondToConnectionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, message } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!['accepted', 'rejected'].includes(response)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid response. Must be "accepted" or "rejected"' 
      });
    }

    const connectionRequest = await models.ConnectionRequest.findOne({
      where: { 
        id: id,
        donor_id: req.user.id,
        status: 'pending'
      },
      include: [{
        model: models.BloodRequest,
        as: 'bloodRequest'
      }]
    });

    if (!connectionRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Connection request not found' 
      });
    }

    // Update connection request status
    await connectionRequest.update({
      status: response,
      response_message: message || null
    });

    // Get donor details for logging
    const donor = await models.User.findByPk(req.user.id, {
      attributes: ['id', 'full_name']
    });

    // If donor accepted, automatically update blood request status to "processing"
    if (response === 'accepted') {
      const bloodRequest = connectionRequest.bloodRequest;
      const oldStatus = bloodRequest.status;
      
      if (oldStatus !== 'processing') {
        await bloodRequest.update({ status: 'processing' });
        
        // Log the automatic status change
        await ActivityLogService.logStatusChanged(
          bloodRequest.id,
          req.user.id,
          oldStatus,
          'processing',
          'Automatically updated when donor accepted connection request'
        );
      }

      // Log donor acceptance
      await ActivityLogService.logDonorAccepted(
        connectionRequest.blood_request_id,
        req.user.id,
        donor.full_name
      );
    } else {
      // Log donor rejection
      await ActivityLogService.logDonorRejected(
        connectionRequest.blood_request_id,
        req.user.id,
        donor.full_name,
        message
      );
    }

    res.json({ 
      success: true, 
      message: `Connection request ${response} successfully`,
      connectionRequest
    });
  } catch (error) {
    console.error('Error responding to connection request:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to respond to connection request'
    });
  }
};

// Revert connection request status back to pending (Donor only)
export const revertConnectionRequest = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const connectionRequest = await models.ConnectionRequest.findByPk(req.params.id);

    if (!connectionRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Connection request not found' 
      });
    }

    // Verify the current user is the donor (recipient of the request)
    if (connectionRequest.donor_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to revert this connection request' 
      });
    }

    // Only allow reverting if the status is not pending
    if (connectionRequest.status === 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Connection request is already pending' 
      });
    }

    await connectionRequest.update({
      status: 'pending',
      response_message: null,
      updated_at: new Date()
    });

    // Get donor details for logging
    const donor = await models.User.findByPk(req.user.id, {
      attributes: ['id', 'full_name']
    });

    // Log the reversion
    await ActivityLogService.logRevertedToPending(
      connectionRequest.blood_request_id,
      req.user.id,
      donor.full_name
    );

    const updatedRequest = await models.ConnectionRequest.findByPk(req.params.id, {
      include: [
        {
          model: models.User,
          as: 'requester',
          attributes: ['id', 'full_name', 'email', 'phone', 'address']
        },
        {
          model: models.BloodRequest,
          as: 'bloodRequest',
          attributes: ['id', 'blood_type', 'rh_factor', 'quantity', 'urgency', 'hospital_name', 'hospital_address', 'patient_name', 'patient_age', 'patient_gender', 'contact_name', 'contact_phone', 'relationship', 'required_date', 'purpose', 'additional_info', 'province', 'district', 'municipality', 'ward', 'created_at', 'status']
        }
      ]
    });

    res.json({ 
      success: true, 
      message: 'Connection request reverted to pending successfully',
      connectionRequest: updatedRequest
    });
  } catch (error) {
    console.error('Error reverting connection request:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to revert connection request'
    });
  }
};

// Get connection requests sent by current user (as requester)
export const getMySentConnectionRequests = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    console.log('getMySentConnectionRequests called for user:', req.user.id);

    const connectionRequests = await models.ConnectionRequest.findAll({
      where: { requester_id: req.user.id },
      include: [
        {
          model: models.User,
          as: 'donor',
          attributes: ['id', 'full_name', 'email', 'phone', 'address', 'blood_type']
        },
        {
          model: models.BloodRequest,
          as: 'bloodRequest',
          attributes: ['id', 'patient_name', 'blood_type', 'rh_factor', 'quantity', 'hospital_name', 'urgency', 'created_at']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    console.log('Found sent connection requests:', connectionRequests.length);
    
    res.json({ 
      success: true, 
      connectionRequests 
    });
  } catch (error) {
    console.error('Error fetching sent connection requests:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch sent connection requests'
    });
  }
};

// Get activity logs for a specific blood request (Admin only)
export const getBloodRequestActivityLogs = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Verify blood request exists
    const bloodRequest = await BloodRequest.findByPk(id);
    if (!bloodRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood request not found' 
      });
    }

    // Get activity logs
    const logs = await ActivityLogService.getLogsForBloodRequest(id);
    
    res.json({ 
      success: true, 
      logs,
      bloodRequest: {
        id: bloodRequest.id,
        patient_name: bloodRequest.patient_name,
        blood_type: bloodRequest.blood_type,
        status: bloodRequest.status
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch activity logs'
    });
  }
};

// Add admin note to blood request (Admin only)
export const addAdminNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!note || note.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Note is required' 
      });
    }

    const bloodRequest = await BloodRequest.findByPk(id);
    if (!bloodRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood request not found' 
      });
    }

    // Update admin notes
    const currentNotes = bloodRequest.admin_notes || '';
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${note}`;
    const updatedNotes = currentNotes 
      ? `${currentNotes}\n${newNote}` 
      : newNote;

    await bloodRequest.update({
      admin_notes: updatedNotes
    });

    // Log the admin note
    await ActivityLogService.logAdminNoteAdded(
      id,
      req.user.id,
      note
    );
    
    res.json({ 
      success: true, 
      message: 'Admin note added successfully',
      admin_notes: updatedNotes
    });
  } catch (error) {
    console.error('Error adding admin note:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to add admin note'
    });
  }
};

// Mark donation as completed by donor
export const markDonationCompleted = async (req, res) => {
  try {
    const { id } = req.params; // connection request ID
    const { status, notes } = req.body; // status: 'completed' or 'failed'
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!['completed', 'failed'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid donation status. Must be "completed" or "failed"' 
      });
    }

    const connectionRequest = await models.ConnectionRequest.findOne({
      where: { 
        id: id,
        donor_id: req.user.id,
        status: 'accepted' // Only accepted connections can be marked as donated
      },
      include: [{
        model: models.BloodRequest,
        as: 'bloodRequest'
      }]
    });

    if (!connectionRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Connection request not found or not eligible for donation completion' 
      });
    }

    // Update donation status
    await connectionRequest.update({
      donation_status: status,
      donation_completed_at: new Date(),
      donation_notes: notes || null
    });

    // Get donor details for logging
    const donor = await models.User.findByPk(req.user.id, {
      attributes: ['id', 'full_name']
    });

    // Check if donation is being marked as completed AND requester has already confirmed
    // If both conditions are met, automatically mark the blood request as completed
    if (status === 'completed' && connectionRequest.requester_confirmed === true) {
      console.log(`🩸 AUTO-COMPLETION CHECK: Donor marked donation as completed and requester already confirmed for blood request ${connectionRequest.blood_request_id}`);
      
      const bloodRequest = connectionRequest.bloodRequest;
      
      // Only update if not already completed
      if (bloodRequest.status !== 'completed') {
        console.log(`🩸 AUTO-COMPLETING: Updating blood request ${connectionRequest.blood_request_id} status from "${bloodRequest.status}" to "completed"`);
        
        await bloodRequest.update({
          status: 'completed',
          completed_at: new Date()
        });

        // Log the automatic completion
        await ActivityLogService.logStatusChanged(
          connectionRequest.blood_request_id,
          req.user.id,
          bloodRequest.status,
          'completed',
          'Automatically completed when both donor and requester confirmed successful donation'
        );

        await ActivityLogService.logMarkedAsCompleted(
          connectionRequest.blood_request_id,
          req.user.id,
          'Automatically completed when both parties confirmed donation completion'
        );
        
        console.log(`🩸 AUTO-COMPLETION SUCCESS: Blood request ${connectionRequest.blood_request_id} marked as completed`);
      } else {
        console.log(`🩸 AUTO-COMPLETION SKIPPED: Blood request ${connectionRequest.blood_request_id} already completed`);
      }
    } else {
      console.log(`🩸 AUTO-COMPLETION CONDITIONS NOT MET: donation_status="${status}", requester_confirmed=${connectionRequest.requester_confirmed}, blood_request_id=${connectionRequest.blood_request_id}`);
    }

    // Log the donation completion
    await ActivityLogService.logDonationCompleted(
      connectionRequest.blood_request_id,
      req.user.id,
      donor.full_name,
      status,
      notes
    );

    res.json({ 
      success: true, 
      message: `Donation marked as ${status} successfully${status === 'completed' && connectionRequest.requester_confirmed === true ? '. Blood request automatically marked as completed.' : ''}`,
      connectionRequest
    });
  } catch (error) {
    console.error('Error marking donation completion:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to mark donation completion'
    });
  }
};

// Confirm donation receipt by requester
export const confirmDonationReceipt = async (req, res) => {
  try {
    const { id } = req.params; // connection request ID
    const { confirmed, notes } = req.body; // confirmed: true/false
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (typeof confirmed !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: 'Confirmation status must be true or false' 
      });
    }

    const connectionRequest = await models.ConnectionRequest.findOne({
      where: { 
        id: id,
        donation_status: 'completed' // Only completed donations can be confirmed
      },
      include: [
        {
          model: models.BloodRequest,
          as: 'bloodRequest',
          where: { user_id: req.user.id } // Ensure requester owns the blood request
        }
      ]
    });

    if (!connectionRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Connection request not found or not eligible for confirmation' 
      });
    }

    // Update confirmation status
    await connectionRequest.update({
      requester_confirmed: confirmed,
      requester_confirmation_at: new Date(),
      requester_confirmation_notes: notes || null
    });

    // Get requester details for logging
    const requester = await models.User.findByPk(req.user.id, {
      attributes: ['id', 'full_name']
    });

    // Check if both donor has completed donation AND requester has confirmed receipt
    // If both conditions are met, automatically mark the blood request as completed
    if (confirmed === true && connectionRequest.donation_status === 'completed') {
      console.log(`🩸 AUTO-COMPLETION CHECK: Requester confirmed receipt and donor already completed donation for blood request ${connectionRequest.blood_request_id}`);
      
      const bloodRequest = connectionRequest.bloodRequest;
      
      // Only update if not already completed
      if (bloodRequest.status !== 'completed') {
        console.log(`🩸 AUTO-COMPLETING: Updating blood request ${connectionRequest.blood_request_id} status from "${bloodRequest.status}" to "completed"`);
        
        await bloodRequest.update({
          status: 'completed',
          completed_at: new Date()
        });

        // Log the automatic completion
        await ActivityLogService.logStatusChanged(
          connectionRequest.blood_request_id,
          req.user.id,
          bloodRequest.status,
          'completed',
          'Automatically completed when both donor and requester confirmed successful donation'
        );

        await ActivityLogService.logMarkedAsCompleted(
          connectionRequest.blood_request_id,
          req.user.id,
          'Automatically completed when both parties confirmed donation completion'
        );
        
        console.log(`🩸 AUTO-COMPLETION SUCCESS: Blood request ${connectionRequest.blood_request_id} marked as completed`);
      } else {
        console.log(`🩸 AUTO-COMPLETION SKIPPED: Blood request ${connectionRequest.blood_request_id} already completed`);
      }
    } else {
      console.log(`🩸 AUTO-COMPLETION CONDITIONS NOT MET: confirmed=${confirmed}, donation_status="${connectionRequest.donation_status}", blood_request_id=${connectionRequest.blood_request_id}`);
    }

    // Log the confirmation
    await ActivityLogService.logRequesterConfirmation(
      connectionRequest.blood_request_id,
      req.user.id,
      requester.full_name,
      confirmed,
      notes
    );

    res.json({ 
      success: true, 
      message: `Donation receipt ${confirmed ? 'confirmed' : 'denied'} successfully${confirmed && connectionRequest.donation_status === 'completed' ? '. Blood request automatically marked as completed.' : ''}`,
      connectionRequest
    });
  } catch (error) {
    console.error('Error confirming donation receipt:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to confirm donation receipt'
    });
  }
};

// Get successful donations statistics and details (Admin only)
export const getSuccessfulDonations = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    const { page = 1, limit = 20, startDate, endDate, donor, requester, bloodType } = req.query;
    const offset = (page - 1) * limit;

    // Build where conditions for filtering
    const connectionWhere = {
      status: 'accepted',
      donation_status: 'completed',
      requester_confirmed: true
    };

    const bloodRequestWhere = {
      status: 'completed'
    };

    // Date range filter
    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) dateFilter[Op.gte] = new Date(startDate);
      if (endDate) dateFilter[Op.lte] = new Date(endDate);
      connectionWhere.donation_completed_at = dateFilter;
    }

    // Blood type filter
    if (bloodType) {
      bloodRequestWhere.blood_type = bloodType;
    }

    // Get successful donations with all related data
    const successfulDonations = await models.ConnectionRequest.findAndCountAll({
      where: connectionWhere,
      include: [
        {
          model: models.User,
          as: 'donor',
          attributes: ['id', 'full_name', 'email', 'phone', 'blood_type', 'address'],
          where: donor ? {
            [Op.or]: [
              { full_name: { [Op.iLike]: `%${donor}%` } },
              { email: { [Op.iLike]: `%${donor}%` } }
            ]
          } : undefined
        },
        {
          model: models.User,
          as: 'requester',
          attributes: ['id', 'full_name', 'email', 'phone', 'address'],
          where: requester ? {
            [Op.or]: [
              { full_name: { [Op.iLike]: `%${requester}%` } },
              { email: { [Op.iLike]: `%${requester}%` } }
            ]
          } : undefined
        },
        {
          model: models.BloodRequest,
          as: 'bloodRequest',
          where: bloodRequestWhere,
          attributes: [
            'id', 'patient_name', 'patient_age', 'patient_gender', 'blood_type', 'rh_factor',
            'quantity', 'urgency', 'hospital_name', 'hospital_address', 'purpose',
            'required_date', 'province', 'district', 'municipality', 'completed_at',
            'contact_name', 'contact_phone', 'relationship'
          ]
        }
      ],
      order: [['donation_completed_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get statistics
    const stats = await getSuccessfulDonationsStats();

    res.json({
      success: true,
      data: {
        donations: successfulDonations.rows,
        pagination: {
          total: successfulDonations.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(successfulDonations.count / limit)
        },
        statistics: stats
      }
    });
  } catch (error) {
    console.error('Error fetching successful donations:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch successful donations'
    });
  }
};

// Helper function to get donation statistics
const getSuccessfulDonationsStats = async () => {
  try {
    // Total successful donations
    const totalDonations = await models.ConnectionRequest.count({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true
      }
    });

    // This month's donations
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const thisMonthDonations = await models.ConnectionRequest.count({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true,
        donation_completed_at: {
          [Op.gte]: currentMonth
        }
      }
    });

    // Active donors count (unique donors who have successfully donated)
    const activeDonorsCount = await models.ConnectionRequest.count({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true
      },
      distinct: true,
      col: 'donor_id'
    });

    // Top donors (donors with most successful donations)
    const topDonors = await models.ConnectionRequest.findAll({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true
      },
      include: [{
        model: models.User,
        as: 'donor',
        attributes: ['id', 'full_name', 'blood_type', 'email']
      }],
      attributes: [
        'donor_id',
        [sequelize.fn('COUNT', sequelize.col('donor_id')), 'donation_count']
      ],
      group: ['donor_id', 'donor.id', 'donor.full_name', 'donor.blood_type', 'donor.email'],
      order: [[sequelize.fn('COUNT', sequelize.col('donor_id')), 'DESC']],
      limit: 10
    });

    // Blood type distribution (unique blood types that have been donated)
    const bloodTypeStats = await models.ConnectionRequest.findAll({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true
      },
      include: [{
        model: models.BloodRequest,
        as: 'bloodRequest',
        attributes: []
      }],
      attributes: [
        [sequelize.col('bloodRequest.blood_type'), 'blood_type'],
        [sequelize.col('bloodRequest.rh_factor'), 'rh_factor'],
        [sequelize.fn('COUNT', sequelize.col('ConnectionRequest.id')), 'count']
      ],
      group: [sequelize.col('bloodRequest.blood_type'), sequelize.col('bloodRequest.rh_factor')],
      order: [[sequelize.fn('COUNT', sequelize.col('ConnectionRequest.id')), 'DESC']],
      raw: true
    });

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrend = await models.ConnectionRequest.findAll({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true,
        donation_completed_at: {
          [Op.gte]: sixMonthsAgo
        }
      },
      attributes: [
        [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('donation_completed_at')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('ConnectionRequest.id')), 'count']
      ],
      group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('donation_completed_at'))],
      order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('donation_completed_at')), 'ASC']]
    });

    // Recent successful donations (last 5)
    const recentDonations = await models.ConnectionRequest.findAll({
      where: {
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true
      },
      include: [
        {
          model: models.User,
          as: 'donor',
          attributes: ['id', 'full_name', 'blood_type']
        },
        {
          model: models.BloodRequest,
          as: 'bloodRequest',
          attributes: ['patient_name', 'blood_type', 'rh_factor', 'hospital_name']
        }
      ],
      order: [['donation_completed_at', 'DESC']],
      limit: 5
    });

    return {
      totalDonations,
      thisMonthDonations,
      activeDonorsCount,
      topDonors: topDonors.map(donor => ({
        ...donor.dataValues,
        donor: donor.donor
      })),
      bloodTypeStats: bloodTypeStats.map(stat => ({
        bloodType: `${stat.blood_type || 'Unknown'}${stat.rh_factor || ''}`,
        count: parseInt(stat.count)
      })),
      uniqueBloodTypesCount: bloodTypeStats.length,
      monthlyTrend: monthlyTrend.map(trend => ({
        month: trend.dataValues.month,
        count: parseInt(trend.dataValues.count)
      })),
      recentDonations
    };
  } catch (error) {
    console.error('Error calculating donation statistics:', error);
    return {
      totalDonations: 0,
      thisMonthDonations: 0,
      activeDonorsCount: 0,
      topDonors: [],
      bloodTypeStats: [],
      uniqueBloodTypesCount: 0,
      monthlyTrend: [],
      recentDonations: []
    };
  }
};

// Generate certificate for a successful donation (Admin only)
export const generateCertificate = async (req, res) => {
  try {
    const { connectionRequestId } = req.params;
    
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    // Find the connection request with all related data
    const connectionRequest = await models.ConnectionRequest.findOne({
      where: { 
        id: connectionRequestId,
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true
      },
      include: [
        {
          model: models.User,
          as: 'donor',
          attributes: ['id', 'full_name', 'email', 'phone', 'blood_type', 'address', 'avatar']
        },
        {
          model: models.BloodRequest,
          as: 'bloodRequest',
          attributes: [
            'id', 'patient_name', 'patient_age', 'patient_gender', 'blood_type', 'rh_factor',
            'quantity', 'urgency', 'hospital_name', 'hospital_address', 'purpose',
            'required_date', 'province', 'district', 'municipality', 'completed_at'
          ]
        }
      ]
    });

    if (!connectionRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Successful donation not found' 
      });
    }

    // If certificate already exists, return the existing certificate URL
    if (connectionRequest.certificate_filename) {
      return res.json({
        success: true,
        message: 'Certificate already generated',
        certificate: {
          filename: connectionRequest.certificate_filename,
          url: `/uploads/certificates/${connectionRequest.certificate_filename}`,
          donorName: connectionRequest.donor.full_name,
          generatedAt: connectionRequest.donation_completed_at || null
        }
      });
    }

    // Prepare donor data for certificate
    const donorData = {
      id: connectionRequest.donor.id,
      full_name: connectionRequest.donor.full_name,
      blood_type: connectionRequest.donor.blood_type,
      email: connectionRequest.donor.email,
      phone: connectionRequest.donor.phone,
      address: connectionRequest.donor.address,
      profilePhoto: connectionRequest.donor.avatar
    };

    // Generate certificate
    const certificate = await CertificateService.generateCertificate(donorData, connectionRequest);

    // Save certificate filename to the connection request
    connectionRequest.certificate_filename = certificate.filename;
    await connectionRequest.save();

    // Log certificate generation
    await ActivityLogService.logCertificateGenerated(
      connectionRequest.blood_request_id,
      req.user.id,
      connectionRequest.donor.full_name,
      certificate.filename
    );

    res.json({
      success: true,
      message: 'Certificate generated successfully',
      certificate: {
        filename: certificate.filename,
        url: certificate.url,
        donorName: donorData.full_name,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to generate certificate'
    });
  }
};

// Generate square certificate for social media sharing (Admin only)
export const generateSquareCertificate = async (req, res) => {
  try {
    const { connectionRequestId } = req.params;
    
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    // Find the connection request with all related data
    const connectionRequest = await models.ConnectionRequest.findOne({
      where: { 
        id: connectionRequestId,
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true
      },
      include: [
        {
          model: models.User,
          as: 'donor',
          attributes: ['id', 'full_name', 'email', 'phone', 'blood_type', 'address', 'avatar']
        },
        {
          model: models.BloodRequest,
          as: 'bloodRequest',
          attributes: [
            'id', 'patient_name', 'patient_age', 'patient_gender', 'blood_type', 'rh_factor',
            'quantity', 'urgency', 'hospital_name', 'hospital_address', 'purpose',
            'required_date', 'province', 'district', 'municipality', 'completed_at'
          ]
        }
      ]
    });

    if (!connectionRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Successful donation not found' 
      });
    }

    // Prepare donor data for square certificate
    const donorData = {
      id: connectionRequest.donor.id,
      full_name: connectionRequest.donor.full_name,
      blood_type: connectionRequest.donor.blood_type,
      email: connectionRequest.donor.email,
      phone: connectionRequest.donor.phone,
      address: connectionRequest.donor.address,
      profilePhoto: connectionRequest.donor.avatar
    };

    // Generate square certificate
    const certificate = await CertificateService.generateSquareCertificate(donorData, connectionRequest);

    // Log square certificate generation
    await ActivityLogService.logCertificateGenerated(
      connectionRequest.blood_request_id,
      req.user.id,
      connectionRequest.donor.full_name,
      certificate.filename
    );

    res.json({
      success: true,
      message: 'Square certificate generated successfully',
      certificate: {
        filename: certificate.filename,
        url: certificate.url,
        donorName: donorData.full_name,
        format: 'square',
        size: '1080x1080',
        optimizedFor: 'social_media',
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating square certificate:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to generate square certificate'
    });
  }
};

// Get all certificates for a donor (for donor's personal use)
export const getDonorCertificates = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Find all successful donations by this donor
    const successfulDonations = await models.ConnectionRequest.findAll({
      where: { 
        donor_id: req.user.id,
        status: 'accepted',
        donation_status: 'completed',
        requester_confirmed: true
      },
      include: [
        {
          model: models.BloodRequest,
          as: 'bloodRequest',
          attributes: [
            'id', 'patient_name', 'blood_type', 'rh_factor', 'quantity', 
            'hospital_name', 'completed_at'
          ]
        }
      ],
      order: [['donation_completed_at', 'DESC']]
    });

    res.json({
      success: true,
      successfulDonations,
      message: `Found ${successfulDonations.length} successful donations`
    });
  } catch (error) {
    console.error('Error fetching donor certificates:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch donor certificates'
    });
  }
};

// Bulk generate certificates for all successful donations (Admin only)
export const bulkGenerateCertificates = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    const { startDate, endDate, donorId } = req.query;

    // Build where conditions
    const connectionWhere = {
      status: 'accepted',
      donation_status: 'completed',
      requester_confirmed: true
    };

    // Date range filter
    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) dateFilter[Op.gte] = new Date(startDate);
      if (endDate) dateFilter[Op.lte] = new Date(endDate);
      connectionWhere.donation_completed_at = dateFilter;
    }

    // Specific donor filter
    if (donorId) {
      connectionWhere.donor_id = donorId;
    }

    // Get all successful donations
    const successfulDonations = await models.ConnectionRequest.findAll({
      where: connectionWhere,
      include: [
        {
          model: models.User,
          as: 'donor',
          attributes: ['id', 'full_name', 'email', 'phone', 'blood_type', 'address', 'avatar']
        },
        {
          model: models.BloodRequest,
          as: 'bloodRequest',
          attributes: [
            'id', 'patient_name', 'patient_age', 'patient_gender', 'blood_type', 'rh_factor',
            'quantity', 'urgency', 'hospital_name', 'hospital_address', 'purpose',
            'required_date', 'province', 'district', 'municipality', 'completed_at'
          ]
        }
      ],
      order: [['donation_completed_at', 'DESC']]
    });

    const generatedCertificates = [];
    const errors = [];

    // Generate certificates for each donation
    for (const donation of successfulDonations) {
      try {
        const donorData = {
          id: donation.donor.id,
          full_name: donation.donor.full_name,
          blood_type: donation.donor.blood_type,
          email: donation.donor.email,
          phone: donation.donor.phone,
          address: donation.donor.address,
          profilePhoto: donation.donor.avatar
        };

        const certificate = await CertificateService.generateCertificate(donorData, donation);

        generatedCertificates.push({
          donationId: donation.id,
          donorName: donorData.full_name,
          certificate: certificate
        });

        // Log certificate generation
        await ActivityLogService.logCertificateGenerated(
          donation.blood_request_id,
          req.user.id,
          donation.donor.full_name,
          certificate.filename
        );
      } catch (error) {
        errors.push({
          donationId: donation.id,
          donorName: donation.donor.full_name,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Generated ${generatedCertificates.length} certificates`,
      generatedCertificates,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: successfulDonations.length,
        generated: generatedCertificates.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error('Error bulk generating certificates:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to bulk generate certificates'
    });
  }
};
