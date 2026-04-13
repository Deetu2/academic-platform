import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// Load environment variables
dotenv.config();

// Debug: Check if environment variables are loaded
console.log('🔍 Checking OAuth Environment Variables:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Loaded' : '❌ Missing');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Loaded' : '❌ Missing');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ Missing');

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const data = {
          provider: 'GOOGLE',
          providerId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          avatarUrl: profile.photos?.[0]?.value,
          accessToken,
          refreshToken
        };
        done(null, data);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

export default passport;
