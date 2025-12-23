import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // Real countdown to New Year 2026
    useEffect(() => {
        const calculateCountdown = () => {
            const now = new Date();
            const newYear = new Date('2026-01-01T00:00:00');
            const diff = newYear - now;

            if (diff > 0) {
                setCountdown({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / (1000 * 60)) % 60),
                    seconds: Math.floor((diff / 1000) % 60)
                });
            }
        };

        calculateCountdown();
        const interval = setInterval(calculateCountdown, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <div className="w-full max-w-md">
                {/* Year Badge */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                        <Sparkles className="w-4 h-4 text-accent-green" />
                        <span className="text-sm font-medium text-gray-400">Start your journey</span>
                    </div>

                    {/* Animated Year Transition */}
                    <div className="relative h-32 mb-4 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-7xl md:text-8xl font-bold text-white/30 animate-[fadeOut_2s_ease-in-out_infinite]">
                                202<span className="inline-block">5</span>
                            </span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-7xl md:text-8xl font-bold text-white">
                                202<span className="inline-block animate-[slideDown_2s_ease-in-out_infinite]">6</span>
                            </span>
                        </div>
                    </div>

                    <p className="text-lg text-gray-400 font-light">
                        A new journey begins
                    </p>
                </div>

                {/* Real Countdown */}
                <div className="grid grid-cols-4 gap-3 mb-8">
                    {[
                        { label: 'days', value: countdown.days },
                        { label: 'hours', value: countdown.hours },
                        { label: 'minutes', value: countdown.minutes },
                        { label: 'seconds', value: countdown.seconds }
                    ].map((stat) => (
                        <div key={stat.label} className="glass-card rounded-2xl p-4 text-center">
                            <div className="text-2xl font-bold text-white mb-1">
                                {String(stat.value).padStart(2, '0')}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/signup')}
                        className="w-full btn-primary text-white font-semibold py-4 rounded-2xl transition-all duration-300"
                    >
                        Create a wishing wall
                    </button>

                    <button
                        onClick={() => navigate('/signin')}
                        className="w-full text-gray-400 hover:text-white font-medium py-2 transition-colors text-sm"
                    >
                        I already have one
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeOut {
                    0%, 40% { opacity: 1; transform: translateY(0); }
                    60%, 100% { opacity: 0; transform: translateY(10px); }
                }
                @keyframes slideDown {
                    0%, 40% { opacity: 0; transform: translateY(-30px); }
                    60%, 100% { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
