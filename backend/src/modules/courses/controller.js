import prisma from '../../utils/db.js';
import { catchAsync, AppError } from '../../utils/errors.js';
import { generateJoinCode } from '../../utils/jwt.js';
import { createCourseSchema, updateCourseSchema, enrollSchema } from './validation.js';

export const createCourse = catchAsync(async (req, res) => {
  const validatedData = createCourseSchema.parse(req.body);

  // Get lecturer profile
  const lecturerProfile = await prisma.lecturerProfile.findUnique({
    where: { userId: req.user.userId }
  });

  if (!lecturerProfile) {
    throw new AppError('Lecturer profile not found', 404);
  }

  // Check if course code already exists
  const existingCourse = await prisma.course.findUnique({
    where: { code: validatedData.code }
  });

  if (existingCourse) {
    throw new AppError('Course code already exists', 400);
  }

  // Generate unique join code
  let joinCode;
  let isUnique = false;
  
  while (!isUnique) {
    joinCode = generateJoinCode();
    const existing = await prisma.course.findUnique({ where: { joinCode } });
    if (!existing) isUnique = true;
  }

  const course = await prisma.course.create({
    data: {
      ...validatedData,
      lecturerId: lecturerProfile.id,
      joinCode
    },
    include: {
      lecturer: {
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      _count: {
        select: {
          enrollments: { where: { status: 'ACTIVE' } }
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    data: course
  });
});

export const getCourses = catchAsync(async (req, res) => {
  let courses;

  if (req.user.role === 'LECTURER') {
    const lecturerProfile = await prisma.lecturerProfile.findUnique({
      where: { userId: req.user.userId }
    });

    courses = await prisma.course.findMany({
      where: { lecturerId: lecturerProfile.id },
      include: {
        _count: {
          select: {
            enrollments: { where: { status: 'ACTIVE' } },
            materials: true,
            assignments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } else if (req.user.role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId }
    });

    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: studentProfile.id,
        status: 'ACTIVE'
      },
      include: {
        course: {
          include: {
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
                materials: true,
                assignments: true
              }
            }
          }
        }
      }
    });

    courses = enrollments.map(e => e.course);
  } else if (req.user.role === 'ADMIN') {
    courses = await prisma.course.findMany({
      include: {
        lecturer: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            enrollments: { where: { status: 'ACTIVE' } },
            assignments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  res.json({
    success: true,
    data: courses
  });
});

export const getCourseById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      lecturer: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      },
      enrollments: {
        where: { status: 'ACTIVE' },
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      },
      _count: {
        select: {
          materials: true,
          assignments: true
        }
      }
    }
  });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Check access
  if (req.user.role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId }
    });

    const enrollment = course.enrollments.find(e => e.studentId === studentProfile.id);
    if (!enrollment) {
      throw new AppError('You are not enrolled in this course', 403);
    }
  } else if (req.user.role === 'LECTURER') {
    const lecturerProfile = await prisma.lecturerProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (course.lecturerId !== lecturerProfile.id) {
      throw new AppError('You do not have permission to view this course', 403);
    }
  }

  res.json({
    success: true,
    data: course
  });
});

export const updateCourse = catchAsync(async (req, res) => {
  const { id } = req.params;
  const validatedData = updateCourseSchema.parse(req.body);

  const lecturerProfile = await prisma.lecturerProfile.findUnique({
    where: { userId: req.user.userId }
  });

  const course = await prisma.course.findUnique({ where: { id } });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.lecturerId !== lecturerProfile.id) {
    throw new AppError('You do not have permission to update this course', 403);
  }

  const updatedCourse = await prisma.course.update({
    where: { id },
    data: validatedData,
    include: {
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
          enrollments: { where: { status: 'ACTIVE' } }
        }
      }
    }
  });

  res.json({
    success: true,
    data: updatedCourse
  });
});

export const regenerateJoinCode = catchAsync(async (req, res) => {
  const { id } = req.params;

  const lecturerProfile = await prisma.lecturerProfile.findUnique({
    where: { userId: req.user.userId }
  });

  const course = await prisma.course.findUnique({ where: { id } });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.lecturerId !== lecturerProfile.id) {
    throw new AppError('You do not have permission to modify this course', 403);
  }

  // Generate new unique join code
  let joinCode;
  let isUnique = false;
  
  while (!isUnique) {
    joinCode = generateJoinCode();
    const existing = await prisma.course.findUnique({ where: { joinCode } });
    if (!existing) isUnique = true;
  }

  const updatedCourse = await prisma.course.update({
    where: { id },
    data: { joinCode }
  });

  res.json({
    success: true,
    data: { joinCode: updatedCourse.joinCode }
  });
});

export const enrollInCourse = catchAsync(async (req, res) => {
  const validatedData = enrollSchema.parse(req.body);
  const { joinCode } = validatedData;

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: req.user.userId }
  });

  if (!studentProfile) {
    throw new AppError('Student profile not found', 404);
  }

  // Find course by join code
  const course = await prisma.course.findUnique({
    where: { joinCode }
  });

  if (!course) {
    throw new AppError('Invalid join code', 404);
  }

  // Check if already enrolled
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      courseId_studentId: {
        courseId: course.id,
        studentId: studentProfile.id
      }
    }
  });

  if (existingEnrollment && existingEnrollment.status === 'ACTIVE') {
    throw new AppError('Already enrolled in this course', 400);
  }

  // Create or reactivate enrollment
  const enrollment = existingEnrollment
    ? await prisma.enrollment.update({
        where: { id: existingEnrollment.id },
        data: {
          status: 'ACTIVE',
          enrolledAt: new Date(),
          droppedAt: null
        },
        include: {
          course: {
            include: {
              lecturer: {
                include: {
                  user: {
                    select: { name: true }
                  }
                }
              }
            }
          }
        }
      })
    : await prisma.enrollment.create({
        data: {
          courseId: course.id,
          studentId: studentProfile.id
        },
        include: {
          course: {
            include: {
              lecturer: {
                include: {
                  user: {
                    select: { name: true }
                  }
                }
              }
            }
          }
        }
      });

  res.status(201).json({
    success: true,
    data: enrollment
  });
});

export const dropCourse = catchAsync(async (req, res) => {
  const { id } = req.params;

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: req.user.userId }
  });

  const course = await prisma.course.findUnique({ where: { id } });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Check if course is selective
  if (course.type !== 'SELECTIVE') {
    throw new AppError('Cannot drop compulsory courses', 400);
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      courseId_studentId: {
        courseId: id,
        studentId: studentProfile.id
      }
    }
  });

  if (!enrollment || enrollment.status === 'DROPPED') {
    throw new AppError('Not enrolled in this course', 400);
  }

  const updatedEnrollment = await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      status: 'DROPPED',
      droppedAt: new Date()
    }
  });

  res.json({
    success: true,
    message: 'Successfully dropped the course',
    data: updatedEnrollment
  });
});
