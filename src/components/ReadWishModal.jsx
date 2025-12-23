import React, { useState, useEffect } from 'react';
import { X, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ReadWishModal({ wish, onClose }) {
    if (!wish) return null;

    // Simple like state persistence
    const [isLiked, setIsLiked] = useState(() => {
        return localStorage.getItem(`like_${wish.id}`) === 'true';
    });

    const handleLike = (e) => {
        e.stopPropagation();
        const newLiked = !isLiked;
        setIsLiked(newLiked);
        localStorage.setItem(`like_${wish.id}`, newLiked);

        if (newLiked) {
            confetti({
                particleCount: 30,
                spread: 50,
                origin: { x: 0.5, y: 0.7 },
                colors: ['#ef4444']
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl relative duration-200"
                style={{ backgroundColor: wish.color }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-gray-700" />
                </button>

                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/30 rotate-1 backdrop-blur-sm shadow-sm" />

                <p className="font-hand text-3xl md:text-4xl leading-relaxed text-gray-800 mb-8 break-words text-center">
                    "{wish.text}"
                </p>

                <div className="flex items-end justify-between">
                    <button
                        onClick={handleLike}
                        className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${isLiked ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-white/50 hover:bg-white text-gray-700'}`}
                    >
                        <Heart className={`w-5 h-5 transition-transform duration-300 ${isLiked ? 'fill-current scale-110' : 'group-hover:scale-110'}`} />
                        <span className="font-bold text-sm">{isLiked ? 'Loved it' : 'Love this'}</span>
                    </button>

                    <div className="text-right">
                        <p className="text-sm uppercase tracking-widest text-gray-500 mb-1">Sent by</p>
                        <p className="font-bold text-xl text-gray-800">{wish.sender || 'Anonymous'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
