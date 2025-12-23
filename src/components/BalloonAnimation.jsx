import React, { useEffect, useState } from 'react';

const EMOJIS = ['🎈', '✨', '🎉', '🎊', '💖', '🌟'];

export default function BalloonAnimation({ trigger }) {
    const [balloons, setBalloons] = useState([]);

    useEffect(() => {
        if (trigger) {
            const newBalloons = Array.from({ length: 15 }).map((_, i) => ({
                id: Date.now() + i,
                emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
                left: Math.random() * 100, // Random horizontal position
                animationDuration: 3 + Math.random() * 2, // Random duration
                delay: Math.random() * 0.5
            }));
            setBalloons(prev => [...prev, ...newBalloons]);

            // Cleanup after animation
            setTimeout(() => {
                setBalloons([]);
            }, 5000);
        }
    }, [trigger]);

    if (balloons.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {balloons.map(b => (
                <div
                    key={b.id}
                    className="absolute bottom-0 text-4xl animate-float-up opacity-0"
                    style={{
                        left: `${b.left}%`,
                        animation: `float-up ${b.animationDuration}s ease-out forwards`,
                        animationDelay: `${b.delay}s`
                    }}
                >
                    {b.emoji}
                </div>
            ))}
            <style>{`
        @keyframes float-up {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) rotate(20deg); opacity: 0; }
        }
      `}</style>
        </div>
    );
}
