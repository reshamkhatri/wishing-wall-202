import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const StarryBackground = () => {
    const stars = useMemo(() => [...Array(100)].map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.7 + 0.3,
        duration: Math.random() * 3 + 2
    })), []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#1a1c4b] via-[#0f1033] to-[#050511] -z-50">
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
            {/* Glowing orb at bottom for atmospheric depth */}
            <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />
        </div>
    );
};

export default StarryBackground;
