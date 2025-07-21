import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import { getAllMedia, deleteMedia } from '../../controllers/mediaController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// GET /api/v1/admin/media - Get all media files
router.get('/', getAllMedia);

// DELETE /api/v1/admin/media/:filepath - Delete a media file
router.delete('/:filepath', deleteMedia);

export default router;
