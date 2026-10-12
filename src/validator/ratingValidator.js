import { z } from 'zod';

export const createRatingSchema = z.object({
    stars: z.number()
        .int('Rating must be a whole number')
        .min(1, 'Rating must be at least 1 star')
        .max(5, 'Rating cannot exceed 5 stars'),

    comment: z.string()
        .trim()
        .max(1000, 'Comment cannot exceed 1000 characters')
        .optional()
}).strict();