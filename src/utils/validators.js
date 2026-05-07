import { z } from 'zod';

export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const uploadSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(120),
    subject: z.string().min(1, 'Subject is required'),
    description: z.string().max(500).optional().or(z.literal('')),
    file: z
      .any()
      .refine((f) => f instanceof File, 'File is required')
      .refine((f) => f && ALLOWED_FILE_TYPES.includes(f.type), 'Allowed: JPG, PNG, GIF')
      .refine((f) => f && f.size <= MAX_FILE_SIZE, 'Max size 10MB'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    rotationDuration: z.coerce.number().int().positive('Must be > 0').max(3600),
  })
  .refine((d) => new Date(d.endTime) > new Date(d.startTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export const rejectSchema = z.object({
  reason: z.string().trim().min(3, 'Reason must be at least 3 characters').max(300),
});
