import express from 'express';
import { checkEmail, register, login, refresh, logout } from './controller.js';

const router = express.Router();

router.post('/check-email', checkEmail);
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
