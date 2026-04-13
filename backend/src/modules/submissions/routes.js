import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';
import {
  submitAssignment,
  getAssignmentSubmissions,
  getMySubmissions,
  getSubmissionHistory,
  gradeSubmission,
  downloadSubmission
} from './controller.js';

const router = express.Router();

router.post('/assignments/:id/submissions', authenticate, authorize('STUDENT'), upload.single('file'), submitAssignment);
router.get('/assignments/:id/submissions', authenticate, authorize('LECTURER'), getAssignmentSubmissions);
router.get('/students/me/submissions', authenticate, authorize('STUDENT'), getMySubmissions);
router.get('/assignments/:assignmentId/my-submissions', authenticate, authorize('STUDENT'), getSubmissionHistory);
router.post('/submissions/:id/grade', authenticate, authorize('LECTURER'), upload.single('feedbackFile'), gradeSubmission);
router.get('/submissions/:id/download', authenticate, downloadSubmission);

export default router;
