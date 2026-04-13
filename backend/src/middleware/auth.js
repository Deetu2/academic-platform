import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      throw new AppError('Invalid or expired token', 401);
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden - insufficient permissions', 403));
    }

    next();
  };
};
