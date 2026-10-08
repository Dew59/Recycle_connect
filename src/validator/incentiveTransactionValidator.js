import { z } from 'zod';

export const createIncentiveTransactionParamsSchema = z.object({
    collectionId: z
        .string()
        .trim()
        .min(1, 'Collection ID is required')
});

// export const createIncentiveTransactionSchema = z.object({});