import { z } from 'zod';

export const createIncentiveRateSchema = z.object({
    material: z
        .string()
        .trim()
        .min(1, 'Material is required'),

    ratePerKg: z
        .number()
        .positive('Rate per kg must be greater than zero'),

    currency: z
        .literal('NGN')
        .default('NGN')
});

export const updateIncentiveRateSchema = z.object({
    ratePerKg: z
        .number()
        .positive('Rate per kg must be greater than zero'),

    currency: z
        .literal('NGN')
        .default('NGN')
});