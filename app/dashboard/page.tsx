'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Seoul Districts (Gu)
const DISTRICTS = [
    'Gangnam-gu', 'Gangdong-gu', 'Gangbuk-gu', 'Gangseo-gu', 'Gwanak-gu',
    'Gwangjin-gu', 'Guro-gu', 'Geumcheon-gu', 'Nowon-gu', 'Dobong-gu',
    'Dongdaemun-gu', 'Dongjak-gu', 'Mapo-gu', 'Seodaemun-gu', 'Seocho-gu',
    'Seongdong-gu', 'Seongbuk-gu', 'Songpa-gu', 'Yangcheon-gu', 'Yeongdeungpo-gu',
    'Yongsan-gu', 'Eunpyeong-gu', 'Jongno-gu', 'Jung-gu', 'Jungnang-gu'
];

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [region, setRegion] = useState(DISTRICTS[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
            } else {
                setUser(user);
                fetchAlerts(user.id);
            }
            setLoading(false);
        };
        getUser();
    }, [router]);

    const fetchAlerts = async (userId: string) => {
        // Determine table - if we didn't setup policies correctly it might fail on client.
        // Assuming RLS is set up for 'alerts' table.
        const { data, error } = await supabase
            .from('alerts')
            .select('*')
            .eq('user_id', userId);

        if (data) setAlerts(data);
    };

    const addAlert = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const { data, error } = await supabase
            .from('alerts')
            .insert([
                { user_id: user.id, region, time_slot: 'All' } // Simplified time slot for MVP
            ])
            .select();

        if (error) {
            alert('Error creating alert: ' + error.message);
        } else {
            if (data) setAlerts([...alerts, ...data]);
            alert('Alert created! You will be notified when courts open in ' + region);
        }
    };

    const deleteAlert = async (id: string) => {
        const { error } = await supabase
            .from('alerts')
            .delete()
            .eq('id', id);

        if (!error) {
            setAlerts(alerts.filter(a => a.id !== id));
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen p-4">
            <div className="container py-10">
                <header className="flex justify-between items-center mb-10">
                    <Link href="/" className="text-2xl font-bold text-accent">Seoul Tennis</Link>
                    <button
                        onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
                        className="text-sm text-gray-400 hover:text-white"
                    >
                        Sign Out
                    </button>
                </header>

                <div className="grid md:grid-cols-2 gap-8">

                    {/* Create Alert Section */}
                    <div className="glass-card">
                        <h2 className="text-xl mb-6">Create New Alert</h2>
                        <form onSubmit={addAlert} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm mb-2 text-gray-400">Select Region</label>
                                <select
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-[#0a192f] border border-[#233554] text-white focus:border-[#64ffda] outline-none"
                                >
                                    {DISTRICTS.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>

                            <button className="btn-primary mt-2">
                                Create Alert
                            </button>
                        </form>
                    </div>

                    {/* Active Alerts Section */}
                    <div className="glass-card">
                        <h2 className="text-xl mb-6">Your Active Alerts</h2>
                        {alerts.length === 0 ? (
                            <p className="text-gray-500">No active alerts. Create one to get started.</p>
                        ) : (
                            <ul className="space-y-4">
                                {alerts.map(alert => (
                                    <li key={alert.id} className="flex justify-between items-center p-4 bg-[#0a192f]/50 rounded-lg border border-[#233554]">
                                        <div>
                                            <span className="font-bold text-[#64ffda]">{alert.region}</span>
                                            <span className="text-gray-400 text-sm ml-2">({alert.time_slot})</span>
                                        </div>
                                        <button
                                            onClick={() => deleteAlert(alert.id)}
                                            className="text-red-400 text-sm hover:text-red-300"
                                        >
                                            Delete
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
