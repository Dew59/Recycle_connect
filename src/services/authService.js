import Household from '../models/householdModel.js';
import Collector from '../models/collectorsModel.js';
import Admin from '../models/adminModel.js';
import AppError from '../utils/AppError.js';
import jwt from 'jsonwebtoken';

const checkEmailAvailability = async (email) => {
    const [household, collector, recycler, admin] = await Promise.all([
        Household.findOne({ email }),
        Collector.findOne({ email }),
        Recycler.findOne({ email }),
        Admin.findOne({ email })
    ]);

    if (household) {
        throw new AppError(
            'This email is already registered as a household',
            409
        );
    }

    if (collector) {
        throw new AppError(
            'This email is already registered as a collector',
            409
        );
    }

    if (admin) {
        throw new AppError(
            'This email is already registered as an admin',
            409
        );
    }

    if (recycler) {
        throw new AppError(
            'This email is already registered as a recycler', 
            409
        );
    }
};

export const registerHouseholdService = async ({
    fullName,
    email,
    phone,
    password
}) => {
    await checkEmailAvailability(email);

    const household = await Household.create({
        fullName,
        email,
        phone,
        passwordHash: password,
    });

    return household;
};

export const registerCollectorService = async ({
    fullName,
    email,
    phone,
    password,
    address,
    identificationDocument
}) => {
    await checkEmailAvailability(email);

    const collector = await Collector.create({
        fullName,
        email,
        phone,
        passwordHash: password
    ,
        address,
        identificationDocument
    });

    return collector;
};

export const registerAdminService = async ({
    fullName,
    email,
    phone,
    password,
    profilePhoto
}) => {
    await checkEmailAvailability(email);

    const admin = await Admin.create({
        fullName,
        email,
        phone,
        passwordHash: password,
        profilePhoto
    });

    return admin;
};

export const loginHouseholdService = async ({ email, password }) => {
    const household = await Household.findOne({ email }).select('+passwordHash');

    if (!household) {
        throw new AppError('Invalid email or password', 401);
    }

    if (!household.isActive) {
        throw new AppError('Household account is inactive', 403);
    }

    const isPasswordValid = await household.comparePassword(password);

    if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign(
        {
            id: household._id,
            role: 'household'
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );

    return {
        household,
        token
    };
};

export const loginCollectorService = async ({ email, password }) => {
    const collector = await Collector.findOne({ email }).select('+passwordHash');

    if (!collector) {
        throw new AppError('Invalid email or password', 401);
    }

    if (collector.approvalStatus !== 'APPROVED') {
        throw new AppError(
            'Collector account has not been approved',
            403
        );
    }

    if (!collector.isActive) {
        throw new AppError('Collector account is inactive', 403);
    }

    const isPasswordValid = await collector.comparePassword(password);

    if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign(
        {
            id: collector._id,
            role: 'collector'
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );

    return {
        collector,
        token
    };
};

export const loginAdminService = async ({ email, password }) => {
    const admin = await Admin.findOne({ email }).select('+passwordHash');

    if (!admin) {
        throw new AppError('Invalid email or password', 401);
    }

    if (!admin.isActive) {
        throw new AppError('Account is inactive', 403);
    }

    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign(
        {
            id: admin._id,
            role: 'admin'
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );

    return {
        admin,
        token
    };
};