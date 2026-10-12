import { z } from 'zod';

export const updateHouseholdProfileSchema = z.object({
    fullName: z.string()
        .trim()
        .min(1, 'Full name cannot be empty')
        .optional(),

    phone: z.string()
        .trim()
        .min(1, 'Phone number cannot be empty')
        .optional()
}).strict();

export const changeHouseholdPasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, 'Current password is required'),

    newPassword: z.string()
        .min(8, 'New password must be at least 8 characters long')
}).strict();
