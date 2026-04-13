import prisma from '../../utils/db.js';
import { catchAsync, AppError } from '../../utils/errors.js';
import { notifyStudentsMaterialUploaded } from '../../utils/notifications.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadMaterial = catchAsync(async (req, res) => {
  const { id: courseId } = req.params;
  const { title } = req.body;

  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  if (!title) {
    throw new AppError('Material title is required', 400);
  }

  const lecturerProfile = await prisma.lecturerProfile.findUnique({
    where: { userId: req.user.userId }
  });

  const course = await prisma.course.findUnique({ where: { id: courseId } });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.lecturerId !== lecturerProfile.id) {
    throw new AppError('You do not have permission to upload materials to this course', 403);
  }

  const material = await prisma.material.create({
    data: {
      courseId,
      uploaderId: lecturerProfile.id,
      title,
      filePath: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      fileSize: req.file.size
    }
  });

  // Notify all enrolled students
  await notifyStudentsMaterialUploaded(courseId, title);

  res.status(201).json({
    success: true,
    data: material
  });
});

export const getCourseMaterials = catchAsync(async (req, res) => {
  const { id: courseId } = req.params;

  const course = await prisma.course.findUnique({ where: { id: courseId } });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Check access
  if (req.user.role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId }
    });

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: studentProfile.id
        }
      }
    });

    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new AppError('You must be enrolled in this course to view materials', 403);
    }
  } else if (req.user.role === 'LECTURER') {
    const lecturerProfile = await prisma.lecturerProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (course.lecturerId !== lecturerProfile.id) {
      throw new AppError('You do not have permission to view materials for this course', 403);
    }
  }

  const materials = await prisma.material.findMany({
    where: { courseId },
    orderBy: { uploadedAt: 'desc' }
  });

  res.json({
    success: true,
    data: materials
  });
});

export const deleteMaterial = catchAsync(async (req, res) => {
  const { id } = req.params;

  const lecturerProfile = await prisma.lecturerProfile.findUnique({
    where: { userId: req.user.userId }
  });

  const material = await prisma.material.findUnique({
    where: { id },
    include: { course: true }
  });

  if (!material) {
    throw new AppError('Material not found', 404);
  }

  if (material.course.lecturerId !== lecturerProfile.id) {
    throw new AppError('You do not have permission to delete this material', 403);
  }

  // Delete file from filesystem
  const filePath = path.join(__dirname, '../../../', material.filePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await prisma.material.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Material deleted successfully'
  });
});

export const downloadMaterial = catchAsync(async (req, res) => {
  const { id } = req.params;

  const material = await prisma.material.findUnique({
    where: { id },
    include: { course: true }
  });

  if (!material) {
    throw new AppError('Material not found', 404);
  }

  // Check access
  if (req.user.role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId }
    });

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId: material.courseId,
          studentId: studentProfile.id
        }
      }
    });

    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new AppError('You must be enrolled in this course to download materials', 403);
    }
  } else if (req.user.role === 'LECTURER') {
    const lecturerProfile = await prisma.lecturerProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (material.course.lecturerId !== lecturerProfile.id) {
      throw new AppError('You do not have permission to download this material', 403);
    }
  }

  const filePath = path.join(__dirname, '../../../', material.filePath);
  
  if (!fs.existsSync(filePath)) {
    throw new AppError('File not found on server', 404);
  }

  res.download(filePath);
});
