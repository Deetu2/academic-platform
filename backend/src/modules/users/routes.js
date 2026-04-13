import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';
import { getMe, updateMe, uploadProfilePhoto, getAllUsers, updateUserStatus, getAdminStats, getAdminCharts } from './controller.js';

const router = express.Router();

// User routes (authenticated)
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateMe);
router.post('/me/photo', authenticate, authorize('LECTURER'), upload.single('photo'), uploadProfilePhoto);

// Admin routes
router.get('/admin/stats', authenticate, authorize('ADMIN'), getAdminStats);
router.get('/admin/charts', authenticate, authorize('ADMIN'), getAdminCharts);
router.get('/admin/users', authenticate, authorize('ADMIN'), getAllUsers);
router.patch('/admin/users/:id/status', authenticate, authorize('ADMIN'), updateUserStatus);

export default router;
