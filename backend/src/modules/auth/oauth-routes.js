import express from 'express';
import passport from '../../config/passport.js';
import { authenticate } from '../../middleware/auth.js';
import {
  handleOAuthCallback,
  completeSocialSignup,
  linkSocialAccount,
  unlinkSocialAccount,
  getLinkedAccounts
} from './oauth-controller.js';

const router = express.Router();

// Google OAuth
router.get('/google', passport.authenticate('google', { session: false }));
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed` }),
  handleOAuthCallback
);

// Complete social signup (after role selection)
router.post('/social-signup', completeSocialSignup);

// Link/unlink Google account (requires authentication)
router.post('/link-google', authenticate, linkSocialAccount);
router.delete('/unlink-google', authenticate, unlinkSocialAccount);
router.get('/linked-accounts', authenticate, getLinkedAccounts);

export default router;
