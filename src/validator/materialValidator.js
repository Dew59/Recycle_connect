import { z } from 'zod';

export const createMaterialSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Material name is required'),

    description: z
        .string()
        .trim()
        .min(1, 'Material description is required')
});