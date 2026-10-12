import { z } from 'zod';

export const updateCollectorProfileSchema = z.object({
    phone: z.string()
        .trim()
        .min(1, 'Phone number cannot be empty')
        .optional(),

    address: z.string()
        .trim()
        .min(1, 'Address cannot be empty')
        .optional(),

    route: z.object({
        state: z.string()
            .trim()
            .min(1, 'State cannot be empty')
            .optional(),

        lga: z.string()
            .trim()
            .min(1, 'LGA cannot be empty')
            .optional(),

        area: z.string()
            .trim()
            .min(1, 'Area cannot be empty')
            .optional()
    }).optional()
}).strict();


export const changeCollectorPasswordSchema = z.object({
    currentPassword: z.string()
        .min(1, 'Current password is required'),

    newPassword: z.string()
        .min(8, 'New password must be at least 8 characters long')
}).strict();
