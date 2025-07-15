import express from 'express';
import { 
  createBloodRequest, 
  getAllBloodRequests, 
  getBloodRequestById, 
  deleteBloodRequest, 
  permanentlyDeleteBloodRequest,
  restoreBloodRequest,
  markAsSpam, 
  markAsCompleted, 
  updateStatus,
  revertBloodRequest
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

// GET /api/blood-requests - Admin only
router.get('/', protect, authorize('admin'), getAllBloodRequests);

// GET /api/blood-requests/:id - Admin only
router.get('/:id', protect, authorize('admin'), getBloodRequestById);

// DELETE /api/blood-requests/:id - Admin only (soft delete - move to trash)
router.delete('/:id', protect, authorize('admin'), deleteBloodRequest);

// DELETE /api/blood-requests/:id/permanent - Admin only (permanent delete)
router.delete('/:id/permanent', protect, authorize('admin'), permanentlyDeleteBloodRequest);

// PUT /api/blood-requests/:id/restore - Admin only (restore from trash)
router.put('/:id/restore', protect, authorize('admin'), restoreBloodRequest);

// PUT /api/blood-requests/:id/spam - Admin only
router.put('/:id/spam', protect, authorize('admin'), markAsSpam);

// PUT /api/blood-requests/:id/complete - Admin only
router.put('/:id/complete', protect, authorize('admin'), markAsCompleted);

// PUT /api/blood-requests/:id/status - Admin only
router.put('/:id/status', protect, authorize('admin'), updateStatus);

// PUT /api/blood-requests/:id/revert - Admin only
router.put('/:id/revert', protect, authorize('admin'), revertBloodRequest);

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
