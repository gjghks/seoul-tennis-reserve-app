import { NextRequest, NextResponse } from 'next/server';
import { fetchTennisAvailability } from '@/lib/seoulApi';
import { createClient } from '@supabase/supabase-js';
import { sendAlert } from '@/lib/email';

// Initialize Supabase Client (Service Role for backend operations)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
    // Validate Cron Secret
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // 1. Fetch data
        const tennisServices = await fetchTennisAvailability();

        // 2. Filter for "Available"
        const availableServices = tennisServices.filter(svc =>
            svc.SVCSTATNM === '접수중' || svc.SVCSTATNM.includes('예약가능')
        );

        if (availableServices.length === 0) {
            return NextResponse.json({ message: 'No available tennis courts found.' });
        }

        // 3. Fetch all active alerts with user email
        const { data: alerts, error } = await supabaseAdmin
            .from('alerts')
            .select('*, users(email)')
            .eq('is_active', true);

        if (error || !alerts) {
            throw new Error('Failed to fetch alerts');
        }

        // 4. Match and Send
        const notificationsSent = [];

        // Group alerts by user
        const userAlerts = alerts.reduce((acc, alert) => {
            const email = alert.users?.email;
            if (!email) return acc;

            if (!acc[email]) acc[email] = [];
            acc[email].push(alert);
            return acc;
        }, {} as Record<string, any[]>);

        for (const [email, userSpecificAlerts] of Object.entries(userAlerts)) {
            const alertsArray = userSpecificAlerts as any[];
            const regionsOfInterest = new Set(alertsArray.map((a: any) => a.region));

            const matchedCourts = availableServices.filter(court =>
                regionsOfInterest.has(court.AREANM) || regionsOfInterest.has('All')
            );

            if (matchedCourts.length > 0) {
                const sent = await sendAlert(email, matchedCourts);
                if (sent) {
                    notificationsSent.push({ email, count: matchedCourts.length });
                }
            }
        }

        return NextResponse.json({
            processed: availableServices.length,
            notifications: notificationsSent
        });

    } catch (error) {
        console.error('Cron job failed', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
