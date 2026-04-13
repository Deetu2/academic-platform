import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import { getAllLecturers, getLecturerById, getMyCoursesAsLecturer } from './controller.js';

const router = express.Router();

router.get('/', authenticate, getAllLecturers);
router.get('/me/courses', authenticate, getMyCoursesAsLecturer);  
router.get('/:id', authenticate, getLecturerById);

export default router; 