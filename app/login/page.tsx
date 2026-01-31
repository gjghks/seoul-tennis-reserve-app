'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';

export default function Login() {
    const { isNeoBrutalism } = useTheme();
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
        <div className={`min-h-screen flex items-center justify-center p-4 ${isNeoBrutalism ? 'bg-nb-bg' : 'bg-gray-50'}`}>
            <div className={isNeoBrutalism
                ? 'w-full max-w-md bg-white border-[3px] border-black rounded-[5px] shadow-[8px_8px_0px_0px_#000] p-8'
                : 'w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100'
            }>
                <h1 className={`text-2xl mb-6 text-center ${isNeoBrutalism ? 'font-black text-black uppercase' : 'font-bold text-gray-900'}`}>
                    {isNeoBrutalism ? '🎾 로그인' : '로그인'}
                </h1>

                {message ? (
                    <div className={isNeoBrutalism
                        ? 'bg-[#a3e635] border-2 border-black text-black font-bold p-4 rounded-[5px] text-center'
                        : 'bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-center'
                    }>
                        {message}
                    </div>
                ) : (
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <div>
                            <label className={`block text-sm mb-2 ${isNeoBrutalism ? 'text-black font-bold uppercase' : 'text-gray-600'}`}>
                                이메일 주소
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className={isNeoBrutalism
                                    ? 'w-full p-3 border-2 border-black rounded-[5px] text-black font-medium focus:shadow-[4px_4px_0px_0px_#000] outline-none transition-all'
                                    : 'w-full p-3 rounded-lg border border-gray-200 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all'
                                }
                                style={{ fontFamily: 'inherit' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={isNeoBrutalism
                                ? 'w-full mt-2 py-3 bg-[#22c55e] text-black font-black uppercase border-2 border-black rounded-[5px] shadow-[4px_4px_0px_0px_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all disabled:opacity-50'
                                : 'w-full mt-2 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50'
                            }
                        >
                            {loading ? '전송 중...' : '매직 링크 전송'}
                        </button>

                        <p className={`text-center text-xs mt-4 ${isNeoBrutalism ? 'text-black/60 font-medium' : 'text-gray-500'}`}>
                            비밀번호 없이 이메일로 로그인합니다.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
