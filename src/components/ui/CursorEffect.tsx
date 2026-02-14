import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { Brain } from 'lucide-react';

export const CursorEffect = () => {
    const [isHovering, setIsHovering] = useState(false);
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Smooth spring physics for the cursor
    const springConfig = { damping: 20, stiffness: 400, mass: 0.5 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.classList.contains('cursor-hover')
            ) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleMouseOver);

        // Hide default cursor
        document.body.style.cursor = 'none';

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleMouseOver);
            document.body.style.cursor = 'auto';
        };
    }, [cursorX, cursorY]);

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center"
            style={{
                x: cursorXSpring,
                y: cursorYSpring,
                translateX: '-50%', // Center the cursor
                translateY: '-50%',
            }}
        >
            {/* Main Cursor Container */}
            <motion.div
                className="relative flex items-center justify-center p-2"
                animate={{
                    scale: isHovering ? 1.5 : 1,
                }}
                transition={{ duration: 0.2 }}
            >
                {/* Brain Icon */}
                <div className="relative z-10 text-primary drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                    <Brain size={24} strokeWidth={2} />
                </div>

                {/* AI Scanner / Orbiting Ring */}
                <motion.div
                    className="absolute inset-0 border border-t-transparent border-primary/50 rounded-full"
                    style={{ width: '100%', height: '100%' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />

                {/* Outer Pulse */}
                <motion.div
                    className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>
        </motion.div>
    );
};