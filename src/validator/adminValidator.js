import { z } from 'zod';

export const rejectCollectorSchema = z.object({
    rejectionReason: z
        .string()
        .trim()
        .min(5, 'Rejection reason must be at least 5 characters')
});

export const adminRegisterRecyclerSchema = z.object({
    businessName: z
        .string()
        .trim()
        .min(2, 'Recycler/business name is required'),

    email: z
        .string()
        .trim()
        .email('Invalid email address')
        .toLowerCase(),

    phone: z
        .string()
        .trim()
        .min(7, 'Phone number is invalid'),

    businessAddress: z
        .string()
        .trim()
        .min(5, 'Address is required'),

    state: z
        .string()
        .trim()
        .min(2, 'State is required'),

    lga: z
        .string()
        .trim()
        .min(2, 'LGA is required'),

    cityTown: z
        .string()
        .trim()
        .min(2, 'City/Town is required'),

    area: z
        .string()
        .trim()
        .min(2, 'Area is required')
});

export const getAllCollectorsQuerySchema = z.object({
    cursor: z
        .string()
        .trim()
        .optional()
});

export const getAllIncentiveTransactionsQuerySchema = z.object({
    cursor: z
        .string()
        .trim()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid pagination cursor')
        .optional()
});

export const getIncentiveTransactionByIdParamsSchema = z.object({
    transactionId: z
        .string()
        .trim()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid incentive transaction ID')
});
