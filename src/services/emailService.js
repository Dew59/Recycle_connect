import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({
    to,
    subject,
    html
}) => {
    const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to,
        subject,
        html
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

export const sendPickupCancellationEmail = async ({
    collectorName,
    collectorEmail,
    householdName,
    pickupDate,
    pickupTime,
    pickupLocation,
    materials,
    cancellationReason
}) => {
    return await sendEmail({
        to: collectorEmail,
        subject: 'Recycle Connect - Pickup Cancelled',
        html: `
            <h2>Pickup Cancelled</h2>

            <p>Hello ${collectorName},</p>

            <p>
                A household has cancelled a pickup that you previously claimed.
            </p>

            <h3>Cancelled Pickup Details</h3>

            <p>
                <strong>Household:</strong> ${householdName}
            </p>

            <p>
                <strong>Scheduled date:</strong> ${pickupDate}
            </p>

            <p>
                <strong>Scheduled time:</strong> ${pickupTime}
            </p>

            <p>
                <strong>Pickup location:</strong> ${pickupLocation}
            </p>

            <p>
                <strong>Materials:</strong> ${materials}
            </p>

            <p>
                <strong>Cancellation reason:</strong>
                ${cancellationReason}
            </p>

            <p>
                <strong>Status:</strong> CANCELLED
            </p>

            <p>
                You no longer need to proceed with this pickup.
            </p>

            <p>
                Regards,<br>
                Recycle Connect Team
            </p>
        `
    });
};