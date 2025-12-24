import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

const COLORS = [
    '#fff0f5', // Lavender Blush
    '#e0ffff', // Light Cyan
    '#f0fff0', // Honeydew
    '#fffacd', // Lemon Chiffon
    '#e6e6fa', // Lavender
    '#ffe4e1', // Misty Rose
    '#f0f8ff'  // Alice Blue
];

export default function CreateWishModal({ isOpen, onClose, wallId }) {
    const [text, setText] = useState('');
    const [sender, setSender] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        setSubmitting(true);
        try {
            const { error } = await supabase.from('wishes').insert([{
                wall_id: wallId,
                text,
                sender: sender.trim() || 'Anonymous',
                color: selectedColor,
                rotation: Math.random() * 10 - 5
            }]);

            if (error) throw error;

            setText('');
            setSender('');
            onClose();
        } catch (error) {
            console.error("Error submitting wish:", error);
            alert("Failed to send wish. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Glass Background */}
                <div className="absolute inset-0 bg-[#0a0a20]/90 backdrop-blur-xl border border-white/10" />

                {/* Content */}
                <div className="relative p-0 flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <h3 className="text-xl font-bold text-white tracking-wide">Make a Wish ✨</h3>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">

                        {/* Note Preview */}
                        <div className="mb-6">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                Your Note
                            </label>
                            <div
                                className="w-full aspect-[4/3] p-6 rounded-xl shadow-lg transition-colors duration-300 relative group"
                                style={{ backgroundColor: selectedColor }}
                            >
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Type your wish here..."
                                    className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-lg sm:text-xl font-hand placeholder-gray-500 text-gray-800 leading-snug"
                                    maxLength={200}
                                    autoFocus
                                />
                                <div className="absolute bottom-3 right-4 text-xs font-medium text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {text.length}/200
                                </div>
                            </div>
                        </div>

                        {/* Color Picker */}
                        <div className="mb-6">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 ml-1">
                                Pick a Color
                            </label>
                            <div className="flex flex-wrap gap-3 justify-center bg-white/5 p-3 rounded-2xl border border-white/5">
                                {COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 shadow-sm ${selectedColor === color ? 'border-indigo-400 scale-110 ring-2 ring-indigo-400/30' : 'border-transparent'}`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Sender Name */}
                        <div className="mb-8">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                From (Optional)
                            </label>
                            <input
                                type="text"
                                value={sender}
                                onChange={(e) => setSender(e.target.value)}
                                placeholder="Your Name"
                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
                                maxLength={30}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting || !text.trim()}
                            className="w-full relative group overflow-hidden rounded-xl p-[1px]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="relative px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95">
                                <span className="font-semibold text-white tracking-wide">
                                    {submitting ? "Posting..." : "Stick on Wall"}
                                </span>
                                {!submitting && <Send className="w-4 h-4 text-white" />}
                            </div>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
