import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

const COLORS = [
    '#fff0f5', // Lavender Blush
    '#e0ffff', // Light Cyan
    '#f0fff0', // Honeydew
    '#fffacd', // Lemon Chiffon
    '#e6e6fa'  // Lavender
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Post a Wish</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">

                    {/* Note Preview / Input Area */}
                    <div
                        className="w-full aspect-[4/3] p-6 mb-6 rounded-lg shadow-inner transition-colors duration-300 relative group"
                        style={{ backgroundColor: selectedColor }}
                    >
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type your wish here..."
                            className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-xl font-hand placeholder-gray-400 text-gray-800 leading-snug"
                            maxLength={200}
                            autoFocus
                        />
                        <div className="absolute bottom-4 right-4 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            {text.length}/200
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div className="flex gap-3 mb-6 justify-center">
                        {COLORS.map(color => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setSelectedColor(color)}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === color ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>

                    {/* Sender Name */}
                    <input
                        type="text"
                        value={sender}
                        onChange={(e) => setSender(e.target.value)}
                        placeholder="Your Name (Optional)"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-neon-cyan focus:border-transparent mb-6 text-gray-600 bg-gray-50"
                        maxLength={30}
                    />

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting || !text.trim()}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        {submitting ? "Posting..." : (
                            <>
                                Stick it! <Send className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
