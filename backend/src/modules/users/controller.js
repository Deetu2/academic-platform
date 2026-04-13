import prisma from '../../utils/db.js';
import { catchAsync, AppError } from '../../utils/errors.js';
import bcrypt from 'bcrypt';

export const getMe = catchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: {
      lecturerProfile: true,
      studentProfile: true
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const { passwordHash, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: userWithoutPassword
  });
});

export const updateMe = catchAsync(async (req, res) => {
  const { name, department, bio, level, matricNo, currentPassword, newPassword } = req.body;
  
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Handle password change
  let updateData = { name };

  if (newPassword) {
    if (!currentPassword) {
      throw new AppError('Current password is required to set new password', 400);
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    updateData.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: req.user.userId },
    data: updateData,
    include: {
      lecturerProfile: true,
      studentProfile: true
    }
  });

  // Update profile based on role
  if (user.role === 'LECTURER' && (department || bio)) {
    await prisma.lecturerProfile.update({
      where: { userId: req.user.userId },
      data: {
        ...(department && { department }),
        ...(bio && { bio })
      }
    });
  }

  if (user.role === 'STUDENT' && (level || department || matricNo)) {
    await prisma.studentProfile.update({
      where: { userId: req.user.userId },
      data: {
        ...(level && { level }),
        ...(department && { department }),
        ...(matricNo && { matricNo })
      }
    });
  }

  // Fetch updated user with profile
  const finalUser = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: {
      lecturerProfile: true,
      studentProfile: true
    }
  });

  const { passwordHash, ...userWithoutPassword } = finalUser;

  res.json({
    success: true,
    data: userWithoutPassword
  });
});

export const uploadProfilePhoto = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId }
  });

  if (user.role !== 'LECTURER') {
    throw new AppError('Only lecturers can upload profile photos', 403);
  }

  const photoUrl = `/uploads/${req.file.filename}`;

  await prisma.lecturerProfile.update({
    where: { userId: req.user.userId },
    data: { photoUrl }
  });

  res.json({
    success: true,
    data: { photoUrl }
  });
});

// Admin charts data
export const getAdminCharts = catchAsync(async (req, res) => {
  // 1. User role breakdown
  const [studentCount, lecturerCount, adminCount] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'LECTURER' } }),
    prisma.user.count({ where: { role: 'ADMIN' } })
  ]);

  const userBreakdown = [
    { name: 'Students', value: studentCount, color: '#22c55e' },
    { name: 'Lecturers', value: lecturerCount, color: '#3b82f6' },
    { name: 'Admins', value: adminCount, color: '#a855f7' }
  ];

  // 2. Submissions over last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const count = await prisma.submission.count({
      where: {
        submittedAt: { gte: date, lt: nextDate },
        isActive: true
      }
    });

    days.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      submissions: count
    });
  }

  // 3. Assignment completion per course (top 5 courses)
  const courses = await prisma.course.findMany({
    take: 5,
    include: {
      assignments: {
        include: {
          submissions: { where: { isActive: true }, include: { grade: true } }
        }
      },
      enrollments: { where: { status: 'ACTIVE' } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const completionRates = courses.map(course => {
    const totalStudents = course.enrollments.length;
    const totalAssignments = course.assignments.length;
    const totalPossible = totalStudents * totalAssignments;
    const totalSubmitted = course.assignments.reduce((sum, a) => sum + a.submissions.length, 0);
    const totalGraded = course.assignments.reduce(
      (sum, a) => sum + a.submissions.filter(s => s.grade).length, 0
    );

    return {
      course: course.code,
      submitted: totalPossible > 0 ? Math.round((totalSubmitted / totalPossible) * 100) : 0,
      graded: totalPossible > 0 ? Math.round((totalGraded / totalPossible) * 100) : 0
    };
  });

  res.json({
    success: true,
    data: { userBreakdown, submissionsOverTime: days, completionRates }
  });
});

// Admin stats - single endpoint for dashboard
export const getAdminStats = catchAsync(async (req, res) => {
  const [
    allUsers,
    totalCourses,
    totalAssignments,
    totalSubmissions,
    pendingSubmissions
  ] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true, avatarUrl: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.course.count(),
    prisma.assignment.count(),
    prisma.submission.count({ where: { isActive: true } }),
    prisma.submission.count({ where: { isActive: true, grade: null } })
  ]);

  const studentCount = allUsers.filter(u => u.role === 'STUDENT').length;
  const lecturerCount = allUsers.filter(u => u.role === 'LECTURER').length;

  res.json({
    success: true,
    data: {
      totalUsers: allUsers.length,
      studentCount,
      lecturerCount,
      totalCourses,
      totalAssignments,
      totalSubmissions,
      pendingSubmissions,
      recentUsers: allUsers.slice(0, 5)
    }
  });
});

// Admin functions
export const getAllUsers = catchAsync(async (req, res) => {
  const users = await prisma.user.findMany({
    include: {
      lecturerProfile: true,
      studentProfile: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const usersWithoutPasswords = users.map(({ passwordHash, ...user }) => user);

  res.json({
    success: true,
    data: usersWithoutPasswords
  });
});

export const updateUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['ACTIVE', 'DEACTIVATED'].includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const user = await prisma.user.update({
    where: { id },
    data: { status },
    include: {
      lecturerProfile: true,
      studentProfile: true
    }
  });

  const { passwordHash, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: userWithoutPassword
  });
});
