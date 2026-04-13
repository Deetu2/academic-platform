import bcrypt from 'bcrypt';
import prisma from '../../utils/db.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, hashToken } from '../../utils/jwt.js';
import { AppError, catchAsync } from '../../utils/errors.js';
import { registerSchema, loginSchema, refreshSchema } from './validation.js';

// Check if email exists in the system
export const checkEmail = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      status: true
    }
  });

  if (user) {
    res.json({
      success: true,
      exists: true,
      role: user.role,
      status: user.status
    });
  } else {
    res.json({
      success: true,
      exists: false
    });
  }
});

export const register = catchAsync(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);
  const { role, name, email, password, department, bio, matricNo, level } = validatedData;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user with profile
  const user = await prisma.user.create({
    data: {
      role,
      name,
      email,
      passwordHash,
      ...(role === 'LECTURER' && {
        lecturerProfile: {
          create: {
            department,
            bio
          }
        }
      }),
      ...(role === 'STUDENT' && {
        studentProfile: {
          create: {
            matricNo,
            level,
            department
          }
        }
      })
    },
    include: {
      lecturerProfile: true,
      studentProfile: true
    }
  });

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  // Store hashed refresh token
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
  });

  // Remove password from response
  const { passwordHash: _, ...userWithoutPassword } = user;

  res.status(201).json({
    success: true,
    data: {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    }
  });
});

export const login = catchAsync(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);
  const { email, password } = validatedData;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      lecturerProfile: true,
      studentProfile: true,
      socialAccounts: true
    }
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if user is active
  if (user.status === 'DEACTIVATED') {
    throw new AppError('Account has been deactivated', 403);
  }

  // Check if user has a password (not a social-only account)
  if (!user.passwordHash) {
    // User signed up with social login (Google, Facebook, etc.)
    const providers = user.socialAccounts.map(sa => sa.provider).join(', ');
    throw new AppError(`This account uses ${providers} login. Please sign in with ${providers} instead.`, 400);
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  // Store hashed refresh token
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  // Remove password from response
  const { passwordHash: _, socialAccounts: __, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    }
  });
});

export const refresh = catchAsync(async (req, res) => {
  const validatedData = refreshSchema.parse(req.body);
  const { refreshToken } = validatedData;

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // Check if token exists in database
  const tokenHash = hashToken(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!storedToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new AppError('Refresh token expired', 401);
  }

  // Generate new tokens
  const newAccessToken = generateAccessToken(storedToken.user.id, storedToken.user.role);
  const newRefreshToken = generateRefreshToken(storedToken.user.id);

  // Delete old token and store new one
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });
  
  const newTokenHash = hashToken(newRefreshToken);
  await prisma.refreshToken.create({
    data: {
      userId: storedToken.user.id,
      tokenHash: newTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  res.json({
    success: true,
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  });
});

export const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.deleteMany({
      where: { tokenHash }
    });
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});
