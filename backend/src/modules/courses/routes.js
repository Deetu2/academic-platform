import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  regenerateJoinCode,
  enrollInCourse,
  dropCourse
} from './controller.js';

const router = express.Router();

router.post('/', authenticate, authorize('LECTURER'), createCourse);
router.get('/', authenticate, getCourses);
router.get('/:id', authenticate, getCourseById);
router.patch('/:id', authenticate, authorize('LECTURER'), updateCourse);
router.post('/:id/join-code', authenticate, authorize('LECTURER'), regenerateJoinCode);
router.post('/enroll', authenticate, authorize('STUDENT'), enrollInCourse);
router.post('/:id/drop', authenticate, authorize('STUDENT'), dropCourse);

export default router;
