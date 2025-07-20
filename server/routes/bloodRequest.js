import express from 'express';
import { 
  createBloodRequest, 
  getAllBloodRequests, 
  getBloodRequestById, 
  deleteBloodRequest, 
  restoreBloodRequest,
  permanentlyDeleteBloodRequest,
  markAsSpam, 
  markAsCompleted, 
  updateStatus,
  revertBloodRequest,
  getMyBloodRequests,
  sendConnectionRequest,
  getConnectionRequests,
  getMySentConnectionRequests,
  respondToConnectionRequest,
  revertConnectionRequest,
  getBloodRequestActivityLogs,
  addAdminNote,
  markDonationCompleted,
  confirmDonationReceipt,
  getSuccessfulDonations,
  generateCertificate,
  generateSquareCertificate,
  getDonorCertificates,
  bulkGenerateCertificates
} from '../controllers/bloodRequestController.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { protect, authorize } from '../middleware/auth.js';
import fs from 'fs';

const router = express.Router();

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for prescription upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'prescription-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST /api/blood-requests - Protected route (user must be logged in)
router.post('/', protect, upload.single('prescription'), createBloodRequest);

// GET /api/blood-requests/my-requests - Get current user's blood requests
router.get('/my-requests', protect, getMyBloodRequests);

// POST /api/blood-requests/connect - Send connection request to donor
router.post('/connect', protect, sendConnectionRequest);

// GET /api/blood-requests/connections - Get connection requests for current user
router.get('/connections', protect, getConnectionRequests);

// GET /api/blood-requests/my-sent-connections - Get connection requests sent by current user
router.get('/my-sent-connections', protect, getMySentConnectionRequests);

// PUT /api/blood-requests/connections/:id - Respond to connection request
router.put('/connections/:id', protect, respondToConnectionRequest);

// PUT /api/blood-requests/connections/:id/revert - Revert connection request to pending (Donor only)
router.put('/connections/:id/revert', protect, revertConnectionRequest);

// GET /api/blood-requests - Admin only
router.get('/', protect, authorize('admin'), getAllBloodRequests);

// GET /api/blood-requests/successful-donations - Get successful donations (Admin only)
router.get('/successful-donations', protect, authorize('admin'), getSuccessfulDonations);

// GET /api/blood-requests/:id - User can view their own, Admin can view all
router.get('/:id', protect, getBloodRequestById);

// DELETE /api/blood-requests/:id - Soft delete (move to trash) - Admin only
router.delete('/:id', protect, authorize('admin'), deleteBloodRequest);

// PUT /api/blood-requests/:id/restore - Restore from trash - Admin only
router.put('/:id/restore', protect, authorize('admin'), restoreBloodRequest);

// DELETE /api/blood-requests/:id/permanent - Permanently delete - Admin only
router.delete('/:id/permanent', protect, authorize('admin'), permanentlyDeleteBloodRequest);

// PUT /api/blood-requests/:id/spam - Admin only
router.put('/:id/spam', protect, authorize('admin'), markAsSpam);

// PUT /api/blood-requests/:id/complete - Admin only
router.put('/:id/complete', protect, authorize('admin'), markAsCompleted);

// PUT /api/blood-requests/:id/status - Admin only
router.put('/:id/status', protect, authorize('admin'), updateStatus);

// PUT /api/blood-requests/:id/revert - Admin only
router.put('/:id/revert', protect, authorize('admin'), revertBloodRequest);

// GET /api/blood-requests/:id/activity-logs - Get activity logs for blood request (Admin only)
router.get('/:id/activity-logs', protect, authorize('admin'), getBloodRequestActivityLogs);

// POST /api/blood-requests/:id/admin-note - Add admin note (Admin only)
router.post('/:id/admin-note', protect, authorize('admin'), addAdminNote);

// PUT /api/blood-requests/connections/:id/donation - Mark donation as completed (Donor only)
router.put('/connections/:id/donation', protect, markDonationCompleted);

// PUT /api/blood-requests/connections/:id/confirm - Confirm donation receipt (Requester only)
router.put('/connections/:id/confirm', protect, confirmDonationReceipt);

// Certificate routes
// POST /api/blood-requests/connections/:connectionRequestId/certificate - Generate certificate for successful donation (Admin only)
router.post('/connections/:connectionRequestId/certificate', protect, authorize('admin'), generateCertificate);

// POST /api/blood-requests/connections/:connectionRequestId/certificate/square - Generate square certificate for social media (Admin only)
router.post('/connections/:connectionRequestId/certificate/square', protect, authorize('admin'), generateSquareCertificate);

// GET /api/blood-requests/my-certificates - Get all certificates for current donor
router.get('/my-certificates', protect, getDonorCertificates);

// POST /api/blood-requests/certificates/bulk-generate - Bulk generate certificates (Admin only)
router.post('/certificates/bulk-generate', protect, authorize('admin'), bulkGenerateCertificates);

// GET /api/blood-requests/:id/prescription (secure prescription image)
router.get('/:id/prescription', protect, authorize('admin'), async (req, res) => {
  try {
    const request = await (await import('../models')).default.BloodRequest.findByPk(req.params.id);
    if (!request || !request.prescription_url) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    const filePath = path.join(__dirname, '..', request.prescription_url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    // Set content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif' };
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
