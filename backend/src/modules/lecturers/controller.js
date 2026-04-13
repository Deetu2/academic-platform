import prisma from '../../utils/db.js';
import { catchAsync, AppError } from '../../utils/errors.js';

export const getAllLecturers = catchAsync(async (req, res) => {
  const lecturers = await prisma.lecturerProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true
        }
      },
      courses: {
        where: {
          // Only show active courses
        },
        select: {
          id: true,
          title: true,
          code: true,
          semester: true,
          type: true
        }
      }
    }
  });

  // Filter only active lecturers
  const activeLecturers = lecturers.filter(l => l.user.status === 'ACTIVE');

  res.json({
    success: true,
    data: activeLecturers
  });
});

export const getLecturerById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const lecturer = await prisma.lecturerProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true
        }
      },
      courses: {
        select: {
          id: true,
          title: true,
          code: true,
          description: true,
          semester: true,
          type: true,
          joinCode: true,
          _count: {
            select: {
              enrollments: {
                where: { status: 'ACTIVE' }
              }
            }
          }
        }
      }
    }
  });

  if (!lecturer) {
    throw new AppError('Lecturer not found', 404);
  }

  if (lecturer.user.status === 'DEACTIVATED') {
    throw new AppError('Lecturer account is deactivated', 403);
  }

  res.json({
    success: true,
    data: lecturer
  });
});

export const getMyCoursesAsLecturer = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  
  // Find lecturer profile
  const lecturer = await prisma.lecturerProfile.findUnique({
    where: { userId }
  });

  if (!lecturer) {
    throw new AppError('Lecturer profile not found', 404);
  }

  // Get lecturer's courses
  const courses = await prisma.course.findMany({
    where: {
      lecturerId: lecturer.id
    },
    include: {
      _count: {
        select: {
          enrollments: {
            where: { status: 'ACTIVE' }
          },
          materials: true,
          assignments: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json({
    success: true,
    data: courses
  });
});