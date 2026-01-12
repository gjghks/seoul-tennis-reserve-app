'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Login() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`,
            },
        });

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage('Check your email for the login link!');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md animate-fade-in">
                <h1 className="text-2xl font-bold mb-6 text-center">Welcome Back</h1>

                {message ? (
                    <div className="bg-green-500/10 border border-green-500 text-green-200 p-4 rounded-lg text-center">
                        {message}
                    </div>
                ) : (
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm mb-2 text-gray-400">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full p-3 rounded-lg bg-[#0a192f] border border-[#233554] text-white focus:border-[#64ffda] outline-none transition-colors"
                                style={{ fontFamily: 'inherit' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full mt-2 flex justify-center"
                        >
                            {loading ? 'Sending Link...' : 'Send Magic Link'}
                        </button>

                        <p className="text-center text-xs text-gray-500 mt-4">
                            We use magic links for a password-free experience.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
