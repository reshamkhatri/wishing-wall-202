import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import StarryBackground from '../components/StarryBackground';
import Lantern from '../components/Lantern';

export default function SignUpPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            // Sign up the user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;

            // Create a wall for the user with personalized title
            const { data: wallData, error: wallError } = await supabase
                .from('walls')
                .insert([{ owner_id: authData.user.id, title: `${name}'s Wishing Wall` }])
                .select()
                .single();

            if (wallError) throw wallError;

            // Navigate to their wall
            navigate(`/${wallData.id}`);
        } catch (err) {
            console.error('Sign up error:', err);
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    // Memoize lanterns
    const lanterns = useMemo(() => [...Array(8)].map((_, i) => ({
        id: i,
        delay: Math.random() * 20,
        duration: Math.random() * 10 + 15,
        x: Math.random() * 100, // percentage
        scale: Math.random() * 0.5 + 0.5
    })), []);

    return (
        <div className="relative min-h-screen overflow-hidden text-white selection:bg-amber-500/30 font-inter">
            <StarryBackground />

            {lanterns.map((l) => (
                <Lantern key={l.id} {...l} />
            ))}

            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <div className="relative group">
                        {/* Card Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl blur-md -z-10" />

                        <div className="bg-[#131438]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">

                            {/* Detailed border highlight on top */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                            <button
                                onClick={() => navigate('/')}
                                className="group flex items-center gap-2 text-purple-200/60 hover:text-white mb-8 transition-colors text-sm font-medium"
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                <span>Back</span>
                            </button>

                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h2>
                                <p className="text-purple-200/60 text-sm">Sign up to create your wishing wall</p>
                            </div>

                            <form onSubmit={handleSignUp} className="space-y-5">
                                {/* Name */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider ml-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        required
                                        className="w-full px-4 py-3.5 bg-[#0a0a20]/60 border border-white/5 rounded-xl text-white placeholder-gray-500/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner"
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider ml-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                        className="w-full px-4 py-3.5 bg-[#0a0a20]/60 border border-white/5 rounded-xl text-white placeholder-gray-500/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner"
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider ml-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Create a password"
                                            required
                                            minLength={6}
                                            className="w-full px-4 py-3.5 bg-[#0a0a20]/60 border border-white/5 rounded-xl text-white placeholder-gray-500/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                        {error}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative group overflow-hidden rounded-xl p-[1px] mt-4"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                                        <span className="font-semibold text-white tracking-wide">
                                            {loading ? 'Creating Account...' : 'Create Account'}
                                        </span>
                                    </div>
                                </button>

                                {/* Sign In Link */}
                                <p className="text-center text-sm text-gray-400 mt-6">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => navigate('/signin')}
                                        className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium transition-colors"
                                    >
                                        Sign In
                                    </button>
                                </p>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
