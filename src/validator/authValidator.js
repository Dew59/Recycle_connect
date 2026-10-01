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

export const collectorRegisterSchema = z.object({
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
        .min(3, 'Address is required')
});

export const recyclerRegisterSchema = z.object({
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
        .optional(),

    businessName: z
        .string()
        .trim()
        .min(2, 'Business name is required'),

    businessAddress: z
        .string()
        .trim()
        .min(3, 'Business address is required'),

    recyclerType: z
        .string()
        .trim()
        .min(2, 'Recycler type is required'),

    identificationDocument: z
        .string()
        .trim()
        .min(1, 'Identification document is required'),

    pickupZone: z.object({
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
    })
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

export const recyclerLoginSchema = z.object({
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