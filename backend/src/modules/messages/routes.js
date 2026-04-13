import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import {
  createOrGetThread,
  getMyThreads,
  getThreadMessages,
  sendMessage,
  markMessageDelivered,
  markMessageSeen
} from './controller.js';

const router = express.Router();

router.post('/threads', authenticate, authorize('LECTURER', 'STUDENT'), createOrGetThread);
router.get('/threads', authenticate, authorize('LECTURER', 'STUDENT'), getMyThreads);
router.get('/threads/:id/messages', authenticate, authorize('LECTURER', 'STUDENT'), getThreadMessages);
router.post('/threads/:id/messages', authenticate, authorize('LECTURER', 'STUDENT'), sendMessage);
router.post('/messages/:id/delivered', authenticate, markMessageDelivered);
router.post('/messages/:id/seen', authenticate, markMessageSeen);

export default router;
