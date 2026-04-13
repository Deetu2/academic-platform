import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import prisma from '../../utils/db.js';
import { 
  notifyLecturerNewMessage,
  notifyLecturerNewSubmission,
  notifyStudentsMaterialUploaded,
  notifyStudentsNewAssignment,
  notifyStudentAssignmentGraded
} from '../../utils/notifications.js';
import { catchAsync } from '../../utils/errors.js';

const router = express.Router();

// Test endpoint - create a test notification
router.post('/test', authenticate, catchAsync(async (req, res) => {
  const { userId } = req.user;
  
  // Create a simple test notification
  const notification = await prisma.notification.create({
    data: {
      userId,
      type: 'NEW_MESSAGE',
      title: '🔔 Test Notification',
      body: 'This is a test notification to verify the system works!',
      link: '/notifications'
    }
  });

  res.json({
    success: true,
    message: 'Test notification created!',
    data: notification
  });
}));

// Test message notification
router.post('/test-message', authenticate, catchAsync(async (req, res) => {
  const { courseId, studentName } = req.body;
  
  await notifyLecturerNewMessage(courseId, studentName);
  
  res.json({
    success: true,
    message: 'Message notification sent!'
  });
}));

// Test material notification
router.post('/test-material', authenticate, catchAsync(async (req, res) => {
  const { courseId, materialTitle } = req.body;
  
  await notifyStudentsMaterialUploaded(courseId, materialTitle);
  
  res.json({
    success: true,
    message: 'Material notification sent to all students!'
  });
}));

export default router;
