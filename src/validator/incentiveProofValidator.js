import { z } from 'zod';

export const uploadIncentiveProofParamsSchema = z.object({
    collectionId: z
        .string()
        .trim()
        .min(1, 'Collection ID is required')
});