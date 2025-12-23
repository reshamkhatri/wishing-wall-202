import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function ReadWishModal({ wish, onClose }) {
    if (!wish) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200"
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

                <div className="text-right">
                    <p className="text-sm uppercase tracking-widest text-gray-500 mb-1">Sent by</p>
                    <p className="font-bold text-xl text-gray-800">{wish.sender || 'Anonymous'}</p>
                </div>
            </div>
        </div>
    );
}
