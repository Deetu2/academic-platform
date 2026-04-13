import prisma from '../../utils/db.js';
import { catchAsync, AppError } from '../../utils/errors.js';
import { createAssignmentSchema } from './validation.js';
import { notifyStudentsNewAssignment } from '../../utils/notifications.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createAssignment = catchAsync(async (req, res) => {
  const { id: courseId } = req.params;
  const validatedData = createAssignmentSchema.parse(req.body);

  const lecturerProfile = await prisma.lecturerProfile.findUnique({
    where: { userId: req.user.userId }
  });

  const course = await prisma.course.findUnique({ where: { id: courseId } });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.lecturerId !== lecturerProfile.id) {
    throw new AppError('You do not have permission to create assignments for this course', 403);
  }

  const assignmentData = {
    ...validatedData,
    courseId,
    lecturerId: lecturerProfile.id,
    dueDate: new Date(validatedData.dueDate)
  };

  if (req.file) {
    assignmentData.attachmentPath = `/uploads/${req.file.filename}`;
  }

  const assignment = await prisma.assignment.create({
    data: assignmentData,
    include: {
      course: {
        select: {
          title: true,
          code: true
        }
      }
    }
  });

  // Notify all enrolled students
  await notifyStudentsNewAssignment(courseId, assignment.title);

  res.status(201).json({
    success: true,
    data: assignment
  });
});

export const getCourseAssignments = catchAsync(async (req, res) => {
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
      throw new AppError('You must be enrolled in this course to view assignments', 403);
    }
  } else if (req.user.role === 'LECTURER') {
    const lecturerProfile = await prisma.lecturerProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (course.lecturerId !== lecturerProfile.id) {
      throw new AppError('You do not have permission to view assignments for this course', 403);
    }
  }

  const assignments = await prisma.assignment.findMany({
    where: { courseId },
    include: {
      _count: {
        select: {
          submissions: {
            where: { isActive: true }
          }
        }
      }
    },
    orderBy: { dueDate: 'asc' }
  });

  res.json({
    success: true,
    data: assignments
  });
});

export const getAssignmentById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      course: true,
      lecturer: {
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      },
      _count: {
        select: {
          submissions: {
            where: { isActive: true }
          }
        }
      }
    }
  });

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  // Check access
  if (req.user.role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId }
    });

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId: assignment.courseId,
          studentId: studentProfile.id
        }
      }
    });

    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new AppError('You must be enrolled in this course to view this assignment', 403);
    }
  } else if (req.user.role === 'LECTURER') {
    const lecturerProfile = await prisma.lecturerProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (assignment.course.lecturerId !== lecturerProfile.id) {
      throw new AppError('You do not have permission to view this assignment', 403);
    }
  }

  res.json({
    success: true,
    data: assignment
  });
});
