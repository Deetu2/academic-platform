import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from './config/passport.js';

// Load environment variables
dotenv.config();

// Import middleware
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './modules/auth/routes.js';
import oauthRoutes from './modules/auth/oauth-routes.js';
import userRoutes from './modules/users/routes.js';
import lecturerRoutes from './modules/lecturers/routes.js';
import courseRoutes from './modules/courses/routes.js';
import materialRoutes from './modules/materials/routes.js';
import assignmentRoutes from './modules/assignments/routes.js';
import submissionRoutes from './modules/submissions/routes.js';
import messageRoutes from './modules/messages/routes.js';
import notificationRoutes from './modules/notifications/routes.js';
import notificationTestRoutes from './modules/notifications/test-routes.js';
import courseMessageRoutes from './modules/course-messages/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(requestLogger);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);
app.use('/api', userRoutes);
app.use('/api/lecturers', lecturerRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', materialRoutes);
app.use('/api', assignmentRoutes);
app.use('/api', submissionRoutes);
app.use('/api', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notifications', notificationTestRoutes);
app.use('/api/courses', courseMessageRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
