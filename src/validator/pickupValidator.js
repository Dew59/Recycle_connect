import { z } from 'zod';

const materialsSchema = z
    .array(
        z.string().trim().min(1, 'Material ID is required')
    )
    .min(1, 'At least one material is required');

const locationSchema = z.object({
    street: z
        .string()
        .trim()
        .min(1, 'Street is required'),

    area: z
        .string()
        .trim()
        .min(1, 'Area is required'),

    city: z
        .string()
        .trim()
        .min(1, 'City is required'),

    lga: z
        .string()
        .trim()
        .min(1, 'LGA is required'),

    state: z
        .string()
        .trim()
        .min(1, 'State is required')
});

export const createPickupSchema = z
    .object({
        materials: z.string().min(1, 'Materials are required'),

        location: z
            .string()
            .trim()
            .min(1, 'Location is required'),

        note: z
            .string()
            .trim()
            .optional(),

        date: z
            .string()
            .trim()
            .min(1, 'Pickup date is required'),

        time: z
            .string()
            .trim()
            .min(1, 'Pickup time is required')
    })
    .transform((data, ctx) => {
        let materials;
        let location;

        try {
            materials = JSON.parse(data.materials);
        } catch {
            ctx.addIssue({
                code: 'custom',
                path: ['materials'],
                message: 'Materials must be a valid JSON array'
            });
        }

        const locationParts = data.location
            .split(',')
            .map((part) => part.trim());

        if (locationParts.length !== 5) {
            ctx.addIssue({
                code: 'custom',
                path: ['location'],
                message:
                    'Location must contain street, area, city, LGA, and state separated by commas'
            });
        } else {
            location = {
                street: locationParts[0],
                area: locationParts[1],
                city: locationParts[2],
                lga: locationParts[3],
                state: locationParts[4]
            };
        }

        if (!materials || !location) {
            return z.NEVER;
        }

        const materialsResult = materialsSchema.safeParse(materials);

        if (!materialsResult.success) {
            for (const issue of materialsResult.error.issues) {
                ctx.addIssue({
                    ...issue,
                    path: ['materials', ...issue.path]
                });
            }
        }

        const locationResult = locationSchema.safeParse(location);

        if (!locationResult.success) {
            for (const issue of locationResult.error.issues) {
                ctx.addIssue({
                    ...issue,
                    path: ['location', ...issue.path]
                });
            }
        }

        if (
            !materialsResult.success ||
            !locationResult.success
        ) {
            return z.NEVER;
        }

        return {
            ...data,
            materials: materialsResult.data,
            location: locationResult.data
        };
    });

export const getHouseholdPickupsSchema = z.object({
    cursor: z
        .string()
        .trim()
        .optional()
});

export const getPendingPickupsSchema = z.object({
    cursor: z
        .string()
        .trim()
        .optional()
});

export const getPickupDetailsSchema = z.object({
    pickupId: z
        .string()
        .trim()
        .min(1, 'Pickup ID is required')
});

export const claimPickupSchema = z.object({
    pickupId: z
        .string()
        .trim()
        .min(1, 'Pickup ID is required')
});

export const deletePickupSchema = z.object({
    pickupId: z
        .string()
        .trim()
        .min(1, 'Pickup ID is required')
});

export const cancelPickupSchema = z.object({
    cancellationReason: z
        .string()
        .trim()
        .min(
            5,
            'Cancellation reason must be at least 5 characters'
        )
        .max(
            500,
            'Cancellation reason cannot exceed 500 characters'
        )
});