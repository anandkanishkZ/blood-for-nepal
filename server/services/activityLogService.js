import models from '../models/index.js';

class ActivityLogService {
  static async createLog(bloodRequestId, userId, activityType, description, options = {}) {
    try {
      const logData = {
        blood_request_id: bloodRequestId,
        user_id: userId,
        activity_type: activityType,
        description,
        old_value: options.oldValue || null,
        new_value: options.newValue || null,
        metadata: options.metadata || null
      };

      const log = await models.ActivityLog.create(logData);
      return log;
    } catch (error) {
      console.error('Error creating activity log:', error);
      throw error;
    }
  }

  static async getLogsForBloodRequest(bloodRequestId) {
    try {
      const logs = await models.ActivityLog.findAll({
        where: { blood_request_id: bloodRequestId },
        include: [
          {
            model: models.User,
            as: 'user',
            attributes: ['id', 'full_name', 'email']
          }
        ],
        order: [['created_at', 'DESC']]
      });
      return logs;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  }

  static async logBloodRequestCreated(bloodRequestId, userId) {
    return this.createLog(
      bloodRequestId,
      userId,
      'created',
      'Blood request was created'
    );
  }

  static async logDonorAccepted(bloodRequestId, donorId, donorName) {
    return this.createLog(
      bloodRequestId,
      donorId,
      'donor_accepted',
      `Donor ${donorName} accepted the connection request`,
      {
        metadata: { donor_id: donorId, donor_name: donorName }
      }
    );
  }

  static async logDonorRejected(bloodRequestId, donorId, donorName, reason = null) {
    return this.createLog(
      bloodRequestId,
      donorId,
      'donor_rejected',
      `Donor ${donorName} rejected the connection request${reason ? `: ${reason}` : ''}`,
      {
        metadata: { donor_id: donorId, donor_name: donorName, reason }
      }
    );
  }

  static async logStatusChanged(bloodRequestId, userId, oldStatus, newStatus, reason = null) {
    return this.createLog(
      bloodRequestId,
      userId,
      'status_changed',
      `Status changed from "${oldStatus}" to "${newStatus}"${reason ? `: ${reason}` : ''}`,
      {
        oldValue: oldStatus,
        newValue: newStatus,
        metadata: { reason }
      }
    );
  }

  static async logMarkedAsSpam(bloodRequestId, adminId, reason = null) {
    return this.createLog(
      bloodRequestId,
      adminId,
      'marked_spam',
      `Blood request marked as spam${reason ? `: ${reason}` : ''}`,
      {
        metadata: { reason }
      }
    );
  }

  static async logMarkedAsCompleted(bloodRequestId, adminId, notes = null) {
    return this.createLog(
      bloodRequestId,
      adminId,
      'marked_completed',
      `Blood request marked as completed${notes ? `: ${notes}` : ''}`,
      {
        metadata: { admin_notes: notes }
      }
    );
  }

  static async logAdminNoteAdded(bloodRequestId, adminId, note) {
    return this.createLog(
      bloodRequestId,
      adminId,
      'admin_note_added',
      `Admin note added: ${note}`,
      {
        newValue: note
      }
    );
  }

  static async logConnectionRequested(bloodRequestId, requesterId, donorId, donorName) {
    return this.createLog(
      bloodRequestId,
      requesterId,
      'connection_requested',
      `Connection request sent to donor ${donorName}`,
      {
        metadata: { donor_id: donorId, donor_name: donorName }
      }
    );
  }

  static async logRevertedToPending(bloodRequestId, donorId, donorName) {
    return this.createLog(
      bloodRequestId,
      donorId,
      'reverted_to_pending',
      `Donor ${donorName} reverted their response back to pending`,
      {
        metadata: { donor_id: donorId, donor_name: donorName }
      }
    );
  }

  static async logDonationCompleted(bloodRequestId, donorId, donorName, status, notes = null) {
    return this.createLog(
      bloodRequestId,
      donorId,
      'donation_completed',
      `Donor ${donorName} marked donation as ${status}${notes ? `: ${notes}` : ''}`,
      {
        metadata: { 
          donor_id: donorId, 
          donor_name: donorName, 
          donation_status: status,
          notes 
        }
      }
    );
  }

  static async logRequesterConfirmation(bloodRequestId, requesterId, requesterName, confirmed, notes = null) {
    return this.createLog(
      bloodRequestId,
      requesterId,
      'requester_confirmation',
      `Requester ${requesterName} ${confirmed ? 'confirmed' : 'denied'} donation receipt${notes ? `: ${notes}` : ''}`,
      {
        metadata: { 
          requester_id: requesterId, 
          requester_name: requesterName, 
          confirmed,
          notes 
        }
      }
    );
  }

  // Soft delete activity logs
  static async logMovedToTrash(bloodRequestId, adminId, reason) {
    return this.createLog(
      bloodRequestId,
      adminId,
      'moved_to_trash',
      `Blood request moved to trash${reason ? `: ${reason}` : ''}`,
      {
        metadata: { 
          admin_id: adminId,
          reason 
        }
      }
    );
  }

  static async logRestoredFromTrash(bloodRequestId, adminId) {
    return this.createLog(
      bloodRequestId,
      adminId,
      'restored_from_trash',
      'Blood request restored from trash',
      {
        metadata: { 
          admin_id: adminId
        }
      }
    );
  }

  static async logPermanentlyDeleted(bloodRequestId, adminId, patientName) {
    return this.createLog(
      bloodRequestId,
      adminId,
      'permanently_deleted',
      `Blood request for ${patientName} permanently deleted`,
      {
        metadata: { 
          admin_id: adminId,
          patient_name: patientName
        }
      }
    );
  }
}

export default ActivityLogService;
