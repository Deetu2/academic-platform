import prisma from '../../utils/db.js';
import { catchAsync, AppError } from '../../utils/errors.js';

export const createOrGetThread = catchAsync(async (req, res) => {
  const { courseId, lecturerId, studentId } = req.body;

  if (!courseId || (!lecturerId && !studentId)) {
    throw new AppError('Course ID and either lecturer or student ID required', 400);
  }

  // Determine the other party based on the requester's role
  let threadLecturerId, threadStudentId;

  if (req.user.role === 'LECTURER') {
    const lecturerProfile = await prisma.lecturerProfile.findUnique({
      where: { userId: req.user.userId }
    });
    threadLecturerId = lecturerProfile.id;
    threadStudentId = studentId;
  } else if (req.user.role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId }
    });
    threadStudentId = studentProfile.id;
    threadLecturerId = lecturerId;
  }

  if (!threadLecturerId || !threadStudentId) {
    throw new AppError('Invalid thread parameters', 400);
  }

  // Verify course access
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Verify enrollment if student
  if (req.user.role === 'STUDENT') {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: threadStudentId
        }
      }
    });

    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw new AppError('You must be enrolled in this course to message the lecturer', 403);
    }
  }

  // Verify course ownership if lecturer
  if (req.user.role === 'LECTURER' && course.lecturerId !== threadLecturerId) {
    throw new AppError('You can only message students in your own courses', 403);
  }

  // Find or create thread
  let thread = await prisma.messageThread.findUnique({
    where: {
      courseId_lecturerId_studentId: {
        courseId,
        lecturerId: threadLecturerId,
        studentId: threadStudentId
      }
    },
    include: {
      course: {
        select: {
          title: true
        }
      },
      lecturer: {
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      student: {
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });

  if (!thread) {
    thread = await prisma.messageThread.create({
      data: {
        courseId,
        lecturerId: threadLecturerId,
        studentId: threadStudentId
      },
      include: {
        course: {
          select: {
            title: true
          }
        },
        lecturer: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });
  }

  res.json({
    success: true,
    data: thread
  });
});

export const getMyThreads = catchAsync(async (req, res) => {
  let threads;

  if (req.user.role === 'LECTURER') {
    const lecturerProfile = await prisma.lecturerProfile.findUnique({
      where: { userId: req.user.userId }
    });

    threads = await prisma.messageThread.findMany({
      where: { lecturerId: lecturerProfile.id },
      include: {
        course: {
          select: {
            title: true
          }
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                seenAt: null,
                sender: {
                  role: 'STUDENT'
                }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  } else if (req.user.role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId }
    });

    threads = await prisma.messageThread.findMany({
      where: { studentId: studentProfile.id },
      include: {
        course: {
          select: {
            title: true
          }
        },
        lecturer: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                seenAt: null,
                sender: {
                  role: 'LECTURER'
                }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }

  res.json({
    success: true,
    data: threads
  });
});

export const getThreadMessages = catchAsync(async (req, res) => {
  const { id: threadId } = req.params;

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      lecturer: true,
      student: true
    }
  });

  if (!thread) {
    throw new AppError('Thread not found', 404);
  }

  // Verify access
  if (req.user.role === 'LECTURER') {
    const lecturerProfile = await prisma.lecturerProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (thread.lecturerId !== lecturerProfile.id) {
      throw new AppError('You do not have access to this thread', 403);
    }
  } else if (req.user.role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (thread.studentId !== studentProfile.id) {
      throw new AppError('You do not have access to this thread', 403);
    }
  }

  const messages = await prisma.message.findMany({
    where: { threadId },
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

export const sendMessage = catchAsync(async (req, res) => {
  const { id: threadId } = req.params;
  const { body } = req.body;

  if (!body || body.trim().length === 0) {
    throw new AppError('Message body cannot be empty', 400);
  }

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    include: {
      lecturer: true,
      student: true,
      course: {
        select: {
          title: true
        }
      }
    }
  });

  if (!thread) {
    throw new AppError('Thread not found', 404);
  }

  // Verify access
  if (req.user.role === 'LECTURER') {
    const lecturerProfile = await prisma.lecturerProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (thread.lecturerId !== lecturerProfile.id) {
      throw new AppError('You do not have access to this thread', 403);
    }
  } else if (req.user.role === 'STUDENT') {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.userId }
    });

    if (thread.studentId !== studentProfile.id) {
      throw new AppError('You do not have access to this thread', 403);
    }
  }

  const message = await prisma.message.create({
    data: {
      threadId,
      senderId: req.user.userId,
      body,
      deliveredAt: new Date()
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

  // Update thread timestamp
  await prisma.messageThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() }
  });

  // Create notification for the other party
  const recipientUserId = req.user.role === 'LECTURER' 
    ? thread.student.userId 
    : thread.lecturer.userId;

  await prisma.notification.create({
    data: {
      userId: recipientUserId,
      type: 'NEW_MESSAGE',
      title: 'New Message',
      body: `New message in ${thread.course.title}`,
      link: `/messages/${threadId}`
    }
  });

  res.status(201).json({
    success: true,
    data: message
  });
});

export const markMessageDelivered = catchAsync(async (req, res) => {
  const { id: messageId } = req.params;

  const message = await prisma.message.findUnique({
    where: { id: messageId }
  });

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: { deliveredAt: new Date() }
  });

  res.json({
    success: true,
    data: updatedMessage
  });
});

export const markMessageSeen = catchAsync(async (req, res) => {
  const { id: messageId } = req.params;

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      thread: true
    }
  });

  if (!message) {
    throw new AppError('Message not found', 404);
  }

  // Verify the requester is the recipient
  if (message.senderId === req.user.userId) {
    throw new AppError('Cannot mark your own message as seen', 400);
  }

  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: { seenAt: new Date() }
  });

  res.json({
    success: true,
    data: updatedMessage
  });
});
