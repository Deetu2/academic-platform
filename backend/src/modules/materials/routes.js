import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';
import {
  uploadMaterial,
  getCourseMaterials,
  deleteMaterial,
  downloadMaterial
} from './controller.js';

const router = express.Router();

router.post('/courses/:id/materials', authenticate, authorize('LECTURER'), upload.single('file'), uploadMaterial);
router.get('/courses/:id/materials', authenticate, getCourseMaterials);
router.delete('/materials/:id', authenticate, authorize('LECTURER'), deleteMaterial);
router.get('/materials/:id/download', authenticate, downloadMaterial);

export default router;
