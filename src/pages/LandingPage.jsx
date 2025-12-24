import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Lantern = ({ delay, duration, x, scale }) => (
    <motion.div
        initial={{ y: '120vh', x, opacity: 0, scale }}
        animate={{
            y: '-20vh',
            opacity: [0, 1, 1, 0],
            x: x + (Math.random() * 50 - 25)
        }}
        transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "linear"
        }}
        className="absolute z-0 pointer-events-none"
    >
        <div className="relative w-8 h-10 md:w-12 md:h-14">
            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/80 to-amber-300/80 rounded-t-xl rounded-b-md blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-orange-500 to-amber-300 rounded-t-xl rounded-b-md opacity-80" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-amber-100/20 blur-[1px]" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-700/30 rounded-full" />
        </div>
    </motion.div>
);

const StarBackground = () => {
    const stars = useMemo(() => [...Array(100)].map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.7 + 0.3,
        duration: Math.random() * 3 + 2
    })), []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute rounded-full bg-white"
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: star.size,
                        height: star.size,
                    }}
                    animate={{
                        opacity: [star.opacity, star.opacity * 0.3, star.opacity],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};

export default function LandingPage() {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [loading, setLoading] = useState(true);

    // Initial loading and session check
    useEffect(() => {
        async function checkSession() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const { data: wallData } = await supabase
                        .from('walls')
                        .select('id')
                        .eq('owner_id', session.user.id)
                        .single();

                    if (wallData) {
                        navigate(`/${wallData.id}`);
                        return;
                    }
                }
            } catch (error) {
                console.error("Session check error:", error);
            } finally {
                setLoading(false);
            }
        }
        checkSession();
    }, [navigate]);

    // Countdown Logic
    useEffect(() => {
        const calculateCountdown = () => {
            const now = new Date();
            const targetDate = new Date('2026-01-01T00:00:00');
            const diff = targetDate - now;

            if (diff > 0) {
                setCountdown({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / (1000 * 60)) % 60),
                    seconds: Math.floor((diff / 1000) % 60)
                });
            } else {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateCountdown();
        const interval = setInterval(calculateCountdown, 1000);
        return () => clearInterval(interval);
    }, []);

    // Memoize lanterns to prevent re-renders recalculating random positions
    const lanterns = useMemo(() => [...Array(15)].map((_, i) => ({
        id: i,
        delay: Math.random() * 20,
        duration: Math.random() * 10 + 15,
        x: Math.random() * 100, // percentage
        scale: Math.random() * 0.5 + 0.5
    })), []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a2a]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#1a1c4b] via-[#0f1033] to-[#050511] text-white selection:bg-amber-500/30">
            {/* Background Elements */}
            <StarBackground />

            {/* Animated Lanterns */}
            {lanterns.map((l) => (
                <Lantern key={l.id} {...l} />
            ))}

            {/* Glowing orb at bottom for atmospheric depth */}
            <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">

                {/* Header Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl shadow-purple-900/10">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span className="text-sm font-medium text-gray-200 tracking-wide">Start your journey</span>
                    </div>
                </motion.div>

                {/* Main Hero Title */}
                <div className="text-center mb-12 relative">
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-8xl md:text-[10rem] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/70 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    >
                        2026
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="text-xl md:text-2xl text-purple-200/80 font-light mt-4 tracking-widest uppercase"
                    >
                        A new journey begins
                    </motion.p>
                </div>

                {/* Glassmorphism Countdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="grid grid-cols-4 gap-3 md:gap-6 mb-16"
                >
                    {[
                        { label: 'days', value: countdown.days },
                        { label: 'hours', value: countdown.hours },
                        { label: 'minutes', value: countdown.minutes },
                        { label: 'seconds', value: countdown.seconds }
                    ].map((stat) => (
                        <div key={stat.label} className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-2xl blur-sm group-hover:bg-white/15 transition-colors duration-500" />
                            <div className="relative bg-[#1a1b4b]/40 backdrop-blur-md rounded-2xl p-4 md:p-6 min-w-[80px] md:min-w-[120px] text-center border border-white/10 shadow-2xl">
                                <div className="text-2xl md:text-4xl font-bold text-white mb-1 tabular-nums">
                                    {String(stat.value).padStart(2, '0')}
                                </div>
                                <div className="text-[10px] md:text-xs text-purple-200/60 font-medium uppercase tracking-wider">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Call to Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="flex flex-col items-center w-full max-w-md gap-4"
                >
                    <button
                        onClick={() => navigate('/signup')}
                        className="group relative w-full overflow-hidden rounded-2xl p-[1px] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 animate-gradient-x" />
                        <div className="relative w-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl py-4 flex items-center justify-center gap-3">
                            <span className="text-lg font-semibold text-white tracking-wide">Create a wishing wall</span>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/signin')}
                        className="text-sm text-purple-200/60 hover:text-white transition-colors duration-300 py-2 border-b border-transparent hover:border-white/20"
                    >
                        I already have one
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
