import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';
import {
  createAssignment,
  getCourseAssignments,
  getAssignmentById
} from './controller.js';

const router = express.Router();

router.post('/courses/:id/assignments', authenticate, authorize('LECTURER'), upload.single('attachment'), createAssignment);
router.get('/courses/:id/assignments', authenticate, getCourseAssignments);
router.get('/assignments/:id', authenticate, getAssignmentById);

export default router;
