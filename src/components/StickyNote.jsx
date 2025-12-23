import React from 'react';
import { motion } from 'framer-motion';

export default function StickyNote({ text, color = '#a7f3d0', sender, rotation = 0, onClick }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-full cursor-pointer group"
            onClick={onClick}
        >
            {/* Pin/Tack */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                <div className="w-4 h-4 rounded-full bg-gray-700 shadow-md" />
            </div>

            {/* Sticky Note */}
            <div
                className="w-full h-full rounded-lg p-4 flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                style={{
                    backgroundColor: color,
                    transform: `rotate(${rotation}deg)`,
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                }}
            >
                {/* Empty - just colored square */}
            </div>
        </motion.div>
    );
}
