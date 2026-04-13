import prisma from '../../utils/db.js';
import { catchAsync, AppError } from '../../utils/errors.js';
import { notifyLecturerNewSubmission, notifyStudentAssignmentGraded } from '../../utils/notifications.js';
import path from 'path';
import fs from 'fs';

export const submitAssignment = catchAsync(async (req, res) => {
  const { id: assignmentId } = req.params;
  const { note } = req.body;

  // Validate user authentication
  if (!req.user || !req.user.userId) {
    throw new AppError('Authentication required. Please login again.', 401);
  }

  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: req.user.userId }
  });

  if (!studentProfile) {
    throw new AppError('Student profile not found. Please contact support.', 404);
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      course: true
    }
  });

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  // Check enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      courseId_studentId: {
        courseId: assignment.courseId,
        studentId: studentProfile.id
      }
    }
  });

  if (!enrollment || enrollment.status !== 'ACTIVE') {
    throw new AppError('You must be enrolled in this course to submit assignments', 403);
  }

  // Get existing submissions to determine version number
  const existingSubmissions = await prisma.submission.findMany({
    where: {
      assignmentId,
      studentId: studentProfile.id
    },
    orderBy: {
      versionNumber: 'desc'
    }
  });

  const versionNumber = existingSubmissions.length > 0 
    ? existingSubmissions[0].versionNumber + 1 
    : 1;

  // Deactivate all previous submissions
  if (existingSubmissions.length > 0) {
    await prisma.submission.updateMany({
      where: {
        assignmentId,
        studentId: studentProfile.id
      },
      data: {
        isActive: false
      }
    });
  }

  // Check if submission is late
  const isLate = new Date() > assignment.dueDate;

  // Create new submission
  const submission = await prisma.submission.create({
    data: {
      assignmentId,
      studentId: studentProfile.id,
      versionNumber,
      filePath: `/uploads/${req.file.filename}`,
      note,
      isLate,
      isActive: true
    },
    include: {
      assignment: {
        include: {
          course: {
            select: {
              title: true
            }
          }
        }
      }
    }
  });

  // Notify lecturer about new submission
  const student = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { name: true }
  });
  
  await notifyLecturerNewSubmission(assignmentId, student.name);

  res.status(201).json({
    success: true,
    data: submission,
    message: versionNumber > 1 ? `Resubmission successful (Version ${versionNumber})` : 'Submission successful'
  });
});

export const getAssignmentSubmissions = catchAsync(async (req, res) => {
  const { id: assignmentId } = req.params;

  const lecturerProfile = await prisma.lecturerProfile.findUnique({
    where: { userId: req.user.userId }
  });

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { course: true }
  });

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  if (assignment.course.lecturerId !== lecturerProfile.id) {
    throw new AppError('You do not have permission to view submissions for this assignment', 403);
  }

  // Get all active submissions
  const submissions = await prisma.submission.findMany({
    where: {
      assignmentId,
      isActive: true
    },
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
      },
      grade: true
    },
    orderBy: {
      submittedAt: 'desc'
    }
  });

  res.json({
    success: true,
    data: submissions
  });
});

export const getMySubmissions = catchAsync(async (req, res) => {
  // Validate user authentication
  if (!req.user || !req.user.userId) {
    throw new AppError('Authentication required. Please login again.', 401);
  }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: req.user.userId }
  });

  if (!studentProfile) {
    throw new AppError('Student profile not found', 404);
  }

  const submissions = await prisma.submission.findMany({
    where: {
      studentId: studentProfile.id,
      isActive: true
    },
    include: {
      assignment: {
        include: {
          course: {
            select: {
              title: true,
              code: true
            }
          }
        }
      },
      grade: true
    },
    orderBy: {
      submittedAt: 'desc'
    }
  });

  res.json({
    success: true,
    data: submissions
  });
});

export const getSubmissionHistory = catchAsync(async (req, res) => {
  const { assignmentId } = req.params;

  // Validate user authentication
  if (!req.user || !req.user.userId) {
    throw new AppError('Authentication required. Please login again.', 401);
  }

  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: req.user.userId }
  });

  if (!studentProfile) {
    throw new AppError('Student profile not found', 404);
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId }
  });

  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }

  const submissions = await prisma.submission.findMany({
    where: {
      assignmentId,
      studentId: studentProfile.id
    },
    include: {
      grade: true
    },
    orderBy: {
      versionNumber: 'desc'
    }
  });

  res.json({
    success: true,
    data: submissions
  });
});

export const gradeSubmission = catchAsync(async (req, res) => {
  const { id: submissionId } = req.params;
  const { score, feedbackText } = req.body;

  if (score === undefined || score === null) {
    throw new AppError('Score is required', 400);
  }

  const lecturerProfile = await prisma.lecturerProfile.findUnique({
    where: { userId: req.user.userId }
  });

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      assignment: {
        include: {
          course: true
        }
      },
      student: {
        include: {
          user: true
        }
      }
    }
  });

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  if (submission.assignment.course.lecturerId !== lecturerProfile.id) {
    throw new AppError('You do not have permission to grade this submission', 403);
  }

  if (!submission.isActive) {
    throw new AppError('Cannot grade inactive submission version', 400);
  }

  const gradeData = {
    submissionId,
    lecturerId: lecturerProfile.id,
    score: parseFloat(score),
    feedbackText
  };

  if (req.file) {
    gradeData.feedbackFilePath = `/uploads/${req.file.filename}`;
  }

  // Check if grade already exists
  const existingGrade = await prisma.grade.findUnique({
    where: { submissionId }
  });

  const grade = existingGrade
    ? await prisma.grade.update({
        where: { submissionId },
        data: gradeData
      })
    : await prisma.grade.create({
        data: gradeData
      });

  // Notify student about grade
  await notifyStudentAssignmentGraded(submissionId, gradeData.score);

  res.json({
    success: true,
    data: grade
  });
});

export const downloadSubmission = catchAsync(async (req, res) => {
  const { id: submissionId } = req.params;
  const { userId, role } = req.user;

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      assignment: {
        include: {
          course: {
            include: {
              lecturer: true
            }
          }
        }
      },
      student: {
        include: {
          user: true
        }
      }
    }
  });

  if (!submission) {
    throw new AppError('Submission not found', 404);
  }

  // Check permissions: student can download their own, lecturer can download from their courses
  const isStudent = role === 'STUDENT' && submission.student.userId === userId;
  const isLecturer = role === 'LECTURER' && submission.assignment.course.lecturer.userId === userId;

  if (!isStudent && !isLecturer) {
    throw new AppError('You do not have permission to download this submission', 403);
  }

  // Get the file path
  const filePath = submission.filePath;
  if (!filePath) {
    throw new AppError('No file found for this submission', 404);
  }

  // Remove leading slash if present
  const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  const fullPath = path.join(process.cwd(), cleanPath);

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    throw new AppError('File not found on server', 404);
  }

  // Send file
  res.download(fullPath, `${submission.student.user.name}_${submission.assignment.title}.${path.extname(fullPath)}`);
});
