import prisma from '../../utils/db.js';
import { catchAsync, AppError } from '../../utils/errors.js';
import { notifyLecturerNewMessage } from '../../utils/notifications.js';

// Get all messages for a course
export const getCourseMessages = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const { userId, role } = req.user;

  // Verify user has access to this course
  const course = await prisma.course.findUnique({
    where: { id: courseId }
  });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Check access based on role
  if (role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!studentProfile) {
      throw new AppError('Student profile not found', 404);
    }

    // Check if student is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: studentProfile.id
        }
      }
    });

    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new AppError('You must be enrolled in this course to view messages', 403);
    }
  } else if (role === 'LECTURER') {
    const lecturerProfile = await prisma.lecturerProfile.findUnique({
      where: { userId }
    });

    if (!lecturerProfile || course.lecturerId !== lecturerProfile.id) {
      throw new AppError('You can only view messages for courses you teach', 403);
    }
  }

  // Get all messages for the course
  const messages = await prisma.courseMessage.findMany({
    where: { courseId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          role: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  res.json({
    success: true,
    data: messages
  });
});

// Send a message to a course
export const sendCourseMessage = catchAsync(async (req, res) => {
  const { courseId } = req.params;
  const { content } = req.body;
  const { userId, role } = req.user;

  if (!content || !content.trim()) {
    throw new AppError('Message content is required', 400);
  }

  // Verify user has access to this course
  const course = await prisma.course.findUnique({
    where: { id: courseId }
  });

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Check access based on role
  if (role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId }
    });

    if (!studentProfile) {
      throw new AppError('Student profile not found', 404);
    }

    // Check if student is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: studentProfile.id
        }
      }
    });

    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new AppError('You must be enrolled in this course to send messages', 403);
    }
  } else if (role === 'LECTURER') {
    const lecturerProfile = await prisma.lecturerProfile.findUnique({
      where: { userId }
    });

    if (!lecturerProfile || course.lecturerId !== lecturerProfile.id) {
      throw new AppError('You can only send messages to courses you teach', 403);
    }
  }

  // Create the message
  const message = await prisma.courseMessage.create({
    data: {
      courseId,
      senderId: userId,
      content: content.trim()
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          role: true
        }
      }
    }
  });

  // Notify lecturer if message is from student
  if (role === 'STUDENT') {
    await notifyLecturerNewMessage(courseId, message.sender.name);
  }

  res.status(201).json({
    success: true,
    data: message
  });
});
