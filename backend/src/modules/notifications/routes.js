import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} from './controller.js';

const router = express.Router();

router.get('/', authenticate, getMyNotifications);
router.post('/:id/read', authenticate, markNotificationRead);
router.post('/read-all', authenticate, markAllNotificationsRead);
router.delete('/:id', authenticate, deleteNotification);

export default router;
