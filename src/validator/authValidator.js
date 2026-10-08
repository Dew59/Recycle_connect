import { z } from 'zod';

export const householdRegisterSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, 'Enter your full name'),

    email: z
        .string()
        .trim()
        .email('Invalid email address')
        .toLowerCase(),

    phone: z
        .string()
        .trim()
        .min(7, 'Phone number is invalid'),

    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
});

export const collectorRegisterSchema = z
    .object({
        fullName: z
            .string()
            .trim()
            .min(2, 'Enter your full name'),

        email: z
            .string()
            .trim()
            .email('Invalid email address')
            .toLowerCase(),

        phone: z
            .string()
            .trim()
            .min(7, 'Phone number is invalid'),

        password: z
            .string()
            .min(8, 'Password must be at least 8 characters'),

        address: z
            .string()
            .trim()
            .min(3, 'Address is required'),

        route: z
            .string()
            .trim()
            .min(1, 'Route is required')
    })
    .transform((data, ctx) => {
        const routeParts = data.route
            .split(',')
            .map((part) => part.trim());

        if (routeParts.length !== 3) {
            ctx.addIssue({
                code: 'custom',
                path: ['route'],
                message:
                    'Route must contain area, LGA, and state separated by commas'
            });

            return z.NEVER;
        }

        const [area, lga, state] = routeParts;

        if (!area || !lga || !state) {
            ctx.addIssue({
                code: 'custom',
                path: ['route'],
                message:
                    'Area, LGA, and state are required'
            });

            return z.NEVER;
        }

        return {
            ...data,
            route: {
                area,
                lga,
                state
            }
        };
    });

export const adminRegisterSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, 'Enter your full name'),

    email: z
        .string()
        .trim()
        .email('Invalid email address')
        .toLowerCase(),

    phone: z
        .string()
        .trim()
        .min(7, 'Phone number is invalid'),

    password: z
        .string()
        .min(8, 'Password must be at least 8 characters'),

    profilePhoto: z
        .string()
        .trim()
        .optional()
});

export const householdLoginSchema = z.object({
    email: z
        .string()
        .trim()
        .email('Invalid email address')
        .toLowerCase(),

    password: z
        .string()
        .min(1, 'Password is required')
});

export const collectorLoginSchema = z.object({
    email: z
        .string()
        .trim()
        .email('Invalid email address')
        .toLowerCase(),

    password: z
        .string()
        .min(1, 'Password is required')
});

export const adminLoginSchema = z.object({
    email: z
        .string()
        .trim()
        .email('Invalid email address')
        .toLowerCase(),

    password: z
        .string()
        .min(1, 'Password is required')
});