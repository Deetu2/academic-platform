import { z } from 'zod';

export const createAssignmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }),
  type: z.enum(['ASSIGNMENT', 'PROJECT'])
});
