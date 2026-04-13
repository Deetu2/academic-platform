import prisma from '../../utils/db.js';
import { catchAsync, AppError } from '../../utils/errors.js';
import { generateTokens, hashToken } from '../../utils/jwt.js';

/**
 * Handle OAuth callback - creates/links social account and returns JWT
 */
export const handleOAuthCallback = catchAsync(async (req, res) => {
  const socialData = req.user; // From passport strategy

  console.log('📝 OAuth Callback - Social Data:', {
    provider: socialData?.provider,
    providerId: socialData?.providerId,
    email: socialData?.email,
    name: socialData?.name
  });

  if (!socialData || !socialData.providerId) {
    console.error('❌ OAuth authentication failed - missing data');
    const redirectUrl = `${process.env.FRONTEND_URL}/auth?error=oauth_failed`;
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Authentication Failed</title>
          <script>
            window.location.href = "${redirectUrl}";
          </script>
        </head>
        <body>
          <p>Authentication failed. Redirecting... If you are not redirected, <a href="${redirectUrl}">click here</a>.</p>
        </body>
      </html>
    `);
  }

  try {
    // Check if social account already exists
    let socialAccount = await prisma.socialAccount.findUnique({
      where: {
        provider_providerId: {
          provider: socialData.provider,
          providerId: socialData.providerId
        }
      },
      include: {
        user: true
      }
    });

    let user;

    if (socialAccount) {
      // Social account exists - login
      console.log('✅ Existing social account found - logging in');
      user = socialAccount.user;

      // Update social account tokens
      await prisma.socialAccount.update({
        where: { id: socialAccount.id },
        data: {
          accessToken: socialData.accessToken,
          refreshToken: socialData.refreshToken,
          name: socialData.name,
          avatarUrl: socialData.avatarUrl
        }
      });
    } else {
      // Social account doesn't exist
      // Check if user with this email already exists
      console.log('🔍 Social account not found, checking email...');
      
      if (socialData.email) {
        user = await prisma.user.findUnique({
          where: { email: socialData.email }
        });
      }

      if (user) {
        // User exists with this email but no social account - link them
        console.log('✅ User exists, linking social account');
        socialAccount = await prisma.socialAccount.create({
          data: {
            userId: user.id,
            provider: socialData.provider,
            providerId: socialData.providerId,
            email: socialData.email,
            name: socialData.name,
            avatarUrl: socialData.avatarUrl,
            accessToken: socialData.accessToken,
            refreshToken: socialData.refreshToken
          }
        });

        // Update user avatar if they don't have one
        if (!user.avatarUrl && socialData.avatarUrl) {
          await prisma.user.update({
            where: { id: user.id },
            data: { avatarUrl: socialData.avatarUrl }
          });
        }
      } else {
        // New user - redirect to signup
        console.log('➡️ New user, redirecting to social signup');
        const signupData = encodeURIComponent(JSON.stringify({
          email: socialData.email,
          name: socialData.name,
          avatarUrl: socialData.avatarUrl,
          provider: socialData.provider,
          providerId: socialData.providerId,
          accessToken: socialData.accessToken,
          refreshToken: socialData.refreshToken
        }));

        const redirectUrl = `${process.env.FRONTEND_URL}/social-signup?data=${signupData}`;
        return res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <title>Redirecting...</title>
              <script>
                window.location.href = "${redirectUrl}";
              </script>
            </head>
            <body>
              <p>Setting up your profile... If you are not redirected, <a href="${redirectUrl}">click here</a>.</p>
            </body>
          </html>
        `);
      }
    }

    // Generate JWT tokens
    console.log('🔑 Generating tokens for user:', user.id);
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token with hash
    await prisma.refreshToken.create({
      data: {
        tokenHash: hashToken(refreshToken),
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    console.log('✅ Redirecting to frontend with tokens');
    // Use HTML redirect instead of server redirect for better browser compatibility
    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
    
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Redirecting...</title>
          <script>
            window.location.href = "${redirectUrl}";
          </script>
        </head>
        <body>
          <p>Completing authentication... If you are not redirected, <a href="${redirectUrl}">click here</a>.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    const redirectUrl = `${process.env.FRONTEND_URL}/auth?error=oauth_failed`;
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Authentication Failed</title>
          <script>
            window.location.href = "${redirectUrl}";
          </script>
        </head>
        <body>
          <p>Authentication failed. Redirecting... If you are not redirected, <a href="${redirectUrl}">click here</a>.</p>
        </body>
      </html>
    `);
  }
});

/**
 * Complete social signup - create user after role selection
 */
export const completeSocialSignup = catchAsync(async (req, res) => {
  const { email, name, avatarUrl, provider, providerId, accessToken, refreshToken, role, matricNumber } = req.body;

  if (!email || !name || !provider || !providerId || !role) {
    throw new AppError('Missing required fields', 400);
  }

  if (!['STUDENT', 'LECTURER'].includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  // Validate matric number for students
  if (role === 'STUDENT') {
    if (!matricNumber) {
      throw new AppError('Matric number is required for students', 400);
    }

    const existingStudent = await prisma.studentProfile.findUnique({
      where: { matricNo: matricNumber }  // Changed from matricNumber to matricNo
    });

    if (existingStudent) {
      throw new AppError('Matric number already registered', 400);
    }
  }

  // Create user with social account in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create user (no password required for social login)
    const user = await tx.user.create({
      data: {
        email,
        name,
        role,
        avatarUrl,
        passwordHash: null // Social-only account
      }
    });

    // Create role-specific profile
    if (role === 'STUDENT') {
      await tx.studentProfile.create({
        data: {
          userId: user.id,
          matricNo: matricNumber,  // Changed from matricNumber to matricNo
          level: '100' // Default level
        }
      });
    } else if (role === 'LECTURER') {
      await tx.lecturerProfile.create({
        data: {
          userId: user.id,
          department: 'Not Specified'  // Removed staffId - doesn't exist in schema
        }
      });
    }

    // Create social account link
    await tx.socialAccount.create({
      data: {
        userId: user.id,
        provider,
        providerId,
        email,
        name,
        avatarUrl,
        accessToken,
        refreshToken
      }
    });

    return user;
  });

  // Generate JWT tokens
  const tokens = generateTokens(result);

  // Store refresh token with hash
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(tokens.refreshToken),
      userId: result.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  });

  res.json({
    success: true,
    message: 'Account created successfully',
    data: {
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
        avatarUrl: result.avatarUrl
      },
      ...tokens
    }
  });
});

/**
 * Link social account to existing user
 */
export const linkSocialAccount = catchAsync(async (req, res) => {
  const { provider, providerId, accessToken, refreshToken, email, name, avatarUrl } = req.body;
  const userId = req.user.userId; // From auth middleware

  if (!provider || !providerId) {
    throw new AppError('Missing provider information', 400);
  }

  // Check if this social account is already linked to another user
  const existingSocial = await prisma.socialAccount.findUnique({
    where: {
      provider_providerId: {
        provider,
        providerId
      }
    }
  });

  if (existingSocial) {
    if (existingSocial.userId === userId) {
      throw new AppError('This social account is already linked to your account', 400);
    } else {
      throw new AppError('This social account is already linked to another user', 400);
    }
  }

  // Link social account
  const socialAccount = await prisma.socialAccount.create({
    data: {
      userId,
      provider,
      providerId,
      email,
      name,
      avatarUrl,
      accessToken,
      refreshToken
    }
  });

  res.json({
    success: true,
    message: `${provider} account linked successfully`,
    data: socialAccount
  });
});

/**
 * Unlink social account
 */
export const unlinkSocialAccount = catchAsync(async (req, res) => {
  const { provider } = req.params;
  const userId = req.user.userId;

  // Find the social account
  const socialAccount = await prisma.socialAccount.findFirst({
    where: {
      userId,
      provider: provider.toUpperCase()
    }
  });

  if (!socialAccount) {
    throw new AppError('Social account not found', 404);
  }

  // Check if user has a password (prevent locking out)
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  const socialAccountsCount = await prisma.socialAccount.count({
    where: { userId }
  });

  if (!user.passwordHash && socialAccountsCount === 1) {
    throw new AppError('Cannot unlink the only authentication method. Please set a password first.', 400);
  }

  // Delete social account
  await prisma.socialAccount.delete({
    where: { id: socialAccount.id }
  });

  res.json({
    success: true,
    message: `${provider} account unlinked successfully`
  });
});

/**
 * Get user's linked social accounts
 */
export const getLinkedAccounts = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const socialAccounts = await prisma.socialAccount.findMany({
    where: { userId },
    select: {
      id: true,
      provider: true,
      email: true,
      name: true,
      avatarUrl: true,
      createdAt: true
    }
  });

  res.json({
    success: true,
    data: socialAccounts
  });
});
