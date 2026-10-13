
import { DateTime } from 'luxon';

const getScheduledPickupDateTime = ({
    date,
    time,
    timezone
}) => {
    const scheduledDateTime = DateTime.fromISO(
        `${date}T${time}`,
        { zone: timezone }
    );

    if (!scheduledDateTime.isValid) {
        throw new Error('Invalid pickup date, time, or timezone');
    }

    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    if (
        scheduledDateTime.year !== year ||
        scheduledDateTime.month !== month ||
        scheduledDateTime.day !== day ||
        scheduledDateTime.hour !== hour ||
        scheduledDateTime.minute !== minute
    ) {
        throw new Error('This local time does not exist');
    }

    if (scheduledDateTime.getPossibleOffsets().length > 1) {
        throw new Error('This local time is ambiguous');
    }

    return scheduledDateTime;
};

const tests = [
    {
        name: 'Valid future date in Lagos',
        date: '2027-01-15',
        time: '14:30',
        timezone: 'Africa/Lagos'
    },
    {
        name: 'Valid future date in Nairobi',
        date: '2027-01-15',
        time: '14:30',
        timezone: 'Africa/Nairobi'
    },
    {
        name: 'Invalid timezone',
        date: '2027-01-15',
        time: '14:30',
        timezone: 'Invalid/Timezone'
    },
    {
        name: 'Invalid time',
        date: '2027-01-15',
        time: '25:90',
        timezone: 'Africa/Lagos'
    }
];

for (const test of tests) {
    try {
        const result = getScheduledPickupDateTime(test);

        console.log(`PASS: ${test.name} -> ${result.toISO()}`);
    } catch (error) {
        console.log(`REJECTED: ${test.name} -> ${error.message}`);
    }
}
