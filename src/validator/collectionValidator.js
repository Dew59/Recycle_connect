import { z } from 'zod';

export const createCollectionParamsSchema = z.object({
    pickupId: z
        .string()
        .trim()
        .min(1, 'Pickup ID is required')
});

export const createCollectionSchema = z.object({
    materials: z
        .array(
            z.object({
                material: z
                    .string()
                    .trim()
                    .min(1, 'Material ID is required'),

                actualWeight: z
                    .number()
                    .positive('Actual weight must be greater than 0')
            })
        )
        .min(1, 'At least one material is required')
});