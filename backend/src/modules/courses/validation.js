import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  code: z.string().min(2, 'Course code is required'),
  description: z.string().optional(),
  semester: z.string().min(1, 'Semester is required'),
  type: z.enum(['SELECTIVE', 'COMPULSORY'])
});

export const updateCourseSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  semester: z.string().optional(),
  type: z.enum(['SELECTIVE', 'COMPULSORY']).optional()
});

export const enrollSchema = z.object({
  joinCode: z.string().length(8, 'Invalid join code')
});
