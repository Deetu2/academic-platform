import { z } from 'zod';

export const registerSchema = z.object({
  role: z.enum(['LECTURER', 'STUDENT']),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  
  // Lecturer specific (optional)
  department: z.string().optional(),
  bio: z.string().optional(),
  
  // Student specific
  matricNo: z.string()
    .regex(/^[A-Z]{3}\/\d{2}[A-Z]\/\d{5}$/, 'Invalid matric number format. Use: SOF/25A/10001')
    .optional(),
  level: z.string().optional()
}).refine((data) => {
  // Make matricNo required for students
  if (data.role === 'STUDENT' && !data.matricNo) {
    return false;
  }
  return true;
}, {
  message: 'Matric number is required for students',
  path: ['matricNo']
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});
