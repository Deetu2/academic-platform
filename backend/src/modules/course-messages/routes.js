import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import {
  getCourseMessages,
  sendCourseMessage
} from './controller.js';

const router = express.Router();

router.get('/:courseId/messages', authenticate, authorize('LECTURER', 'STUDENT'), getCourseMessages);
router.post('/:courseId/messages', authenticate, authorize('LECTURER', 'STUDENT'), sendCourseMessage);

export default router;
