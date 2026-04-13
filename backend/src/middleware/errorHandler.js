import { AppError } from '../utils/errors.js';

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Prisma errors
  if (err.code === 'P2002') {
    error = new AppError('Duplicate field value entered', 400);
  }
  
  if (err.code === 'P2025') {
    error = new AppError('Record not found', 404);
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new AppError('File size exceeds limit', 400);
    } else {
      error = new AppError(err.message, 400);
    }
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    error = new AppError(message, 400);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
