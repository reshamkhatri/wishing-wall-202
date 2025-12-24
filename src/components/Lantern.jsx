import React from 'react';
import { motion } from 'framer-motion';

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

export default Lantern;
