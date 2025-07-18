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
    const bloodRequests = await BloodRequest.findAll({
      include: [{
        model: models.User,
        as: 'user',
        attributes: ['id', 'full_name', 'email', 'phone', 'address']
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

// Delete a blood request (Admin only)
export const deleteBloodRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findByPk(req.params.id);
    
    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Blood request not found' 
      });
    }
    
    await request.destroy();
    
    res.json({ 
      success: true, 
      message: 'Blood request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blood request:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to delete blood request'
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
      }
    });

    if (!connectionRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Connection request not found' 
      });
    }

    await connectionRequest.update({
      status: response,
      response_message: message || null
    });

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
