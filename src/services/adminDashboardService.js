import Household from '../models/householdModel.js';
import Collector from '../models/collectorsModel.js';
import Recycler from '../models/recyclerModel.js';
import Admin from '../models/adminModel.js';
import Pickup from '../models/pickupModel.js';
import Collection from '../models/collectionModel.js';
import IncentiveTransaction from '../models/incentiveTransactionModel.js';
import { getCurrentIncentiveRatesService } from './incentiveRateService.js';


const getDashboardSummary = async () => {
    const [
        activeHouseholds,
        activeCollectors,
        pendingCollectors,
        activeRecyclers,
        activeAdmins
    ] = await Promise.all([
        Household.countDocuments({ isActive: true }),

        Collector.countDocuments({
            approvalStatus: 'APPROVED',
            isActive: true
        }),

        Collector.countDocuments({
            approvalStatus: 'PENDING'
        }),

        Recycler.countDocuments({ isActive: true }),

        Admin.countDocuments({ isActive: true })
    ]);

    return {
        activeHouseholds,
        activeCollectors,
        pendingCollectors,
        activeRecyclers,
        activeAdmins
    };
};

const hasValidCreatedAt = (record) => {
    const createdAt = new Date(record.createdAt);

    return (
        record.createdAt != null &&
        !Number.isNaN(createdAt.getTime())
    );
};

const getRecentActivityRecords = async () => {
    const [
        pickups,
        households,
        collectors,
        recyclers,
        admins,
        collections,
        incentiveTransactions
    ] = await Promise.all([
        Pickup.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),

        Household.find({})
            .select('fullName createdAt')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),

        Collector.find({})
            .select('fullName approvalStatus createdAt')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),

        Recycler.find({})
            .select('businessName createdAt')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),

        Admin.find({})
            .select('fullName createdAt')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),

        Collection.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),

        IncentiveTransaction.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
    ]);

    return {
        pickups,
        households,
        collectors,
        recyclers,
        admins,
        collections,
        incentiveTransactions
    };
};

const createActivity = ({
    type,
    id,
    title,
    description,
    createdAt,
    link
}) => ({
    type,
    id: id.toString(),
    title,
    description,
    createdAt: new Date(createdAt),
    link
});

const formatRegistrationActivities = ({
    households,
    collectors,
    recyclers,
    admins
}) => {
    const activities = [];

    for (const household of households) {
        if (!hasValidCreatedAt(household)) continue;

        activities.push(
            createActivity({
                type: 'REGISTRATION',
                id: household._id,
                title: 'Household registered',
                description: household.fullName,
                createdAt: household.createdAt,
                link: `/admin/households/${household._id}`
            })
        );
    }

    for (const collector of collectors) {
        if (!hasValidCreatedAt(collector)) continue;

        activities.push(
            createActivity({
                type: 'REGISTRATION',
                id: collector._id,
                title: 'Collector registered',
                description: `${collector.fullName} — ${collector.approvalStatus}`,
                createdAt: collector.createdAt,
                link: `/admin/collectors/${collector._id}`
            })
        );
    }

    for (const recycler of recyclers) {
        if (!hasValidCreatedAt(recycler)) continue;

        activities.push(
            createActivity({
                type: 'REGISTRATION',
                id: recycler._id,
                title: 'Recycler created',
                description: recycler.businessName,
                createdAt: recycler.createdAt,
                link: `/admin/recyclers/${recycler._id}`
            })
        );
    }

    for (const admin of admins) {
        if (!hasValidCreatedAt(admin)) continue;

        activities.push(
            createActivity({
                type: 'REGISTRATION',
                id: admin._id,
                title: 'Admin registered',
                description: admin.fullName,
                createdAt: admin.createdAt,
                link: `/admin/admins/${admin._id}`
            })
        );
    }

    return activities;
};

const formatPickupActivities = (pickups) => {
    const activities = [];

    for (const pickup of pickups) {
        if (!hasValidCreatedAt(pickup)) continue;

        const location = pickup.location;
        const locationText = location
            ? [
                location.area,
                location.city,
                location.lga,
                location.state
            ]
                .filter(Boolean)
                .join(', ')
            : '';

        activities.push(
            createActivity({
                type: 'PICKUP',
                id: pickup._id,
                title: `Pickup ${pickup.status}`,
                description: locationText || 'Pickup location unavailable',
                createdAt: pickup.createdAt,
                link: `/admin/pickups/${pickup._id}`
            })
        );
    }

    return activities;
};

const formatCollectionActivities = (collections) => {
    const activities = [];

    for (const collection of collections) {
        if (!hasValidCreatedAt(collection)) continue;

        activities.push(
            createActivity({
                type: 'COLLECTION',
                id: collection._id,
                title: 'Collection recorded',
                description: collection.pickup
                    ? `Pickup ID: ${collection.pickup}`
                    : 'Pickup reference unavailable',
                createdAt: collection.createdAt,
                link: `/admin/pickups/${collection.pickup}`
            })
        );
    }

    return activities;
};

const formatIncentiveTransactionActivities = (transactions) => {
    const activities = [];

    for (const transaction of transactions) {
        if (!hasValidCreatedAt(transaction)) continue;

        const amount = transaction.totalAmount?.toString();

        activities.push(
            createActivity({
                type: 'INCENTIVE_TRANSACTION',
                id: transaction._id,
                title: 'Incentive transaction recorded',
                description: amount
                    ? `${transaction.currency} ${amount}`
                    : 'Incentive transaction amount unavailable',
                createdAt: transaction.createdAt,
                link: `/admin/incentive-transactions/${transaction._id}`
            })
        );
    }

    return activities;
};

const getRecentActivities = (records) => {
    const registrationActivities = formatRegistrationActivities({
        households: records.households,
        collectors: records.collectors,
        recyclers: records.recyclers,
        admins: records.admins
    });

    const pickupActivities = formatPickupActivities(records.pickups);

    const collectionActivities = formatCollectionActivities(
        records.collections
    );

    const incentiveActivities =
        formatIncentiveTransactionActivities(
            records.incentiveTransactions
        );

    return [
        ...registrationActivities,
        ...pickupActivities,
        ...collectionActivities,
        ...incentiveActivities
    ]
        .sort(
            (a, b) =>
                b.createdAt.getTime() - a.createdAt.getTime()
        )
        .slice(0, 10);
};

export const getAdminDashboardService = async () => {
    const [
        summary,
        currentIncentiveRates,
        activityRecords
    ] = await Promise.all([
        getDashboardSummary(),
        getCurrentIncentiveRatesService(),
        getRecentActivityRecords()
    ]);

    const recentActivities = getRecentActivities(activityRecords);

    const formattedIncentiveRates = currentIncentiveRates.map((rate) => ({
        _id: rate._id,
        material: rate.material,
        ratePerKg: rate.ratePerKg.toString(),
        currency: rate.currency
    }));

    return {
        summary,
        currentIncentiveRates: formattedIncentiveRates,
        recentActivities
    };
};
