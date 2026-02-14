import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { Brain } from 'lucide-react';

export const CursorEffect = () => {
    const [isHovering, setIsHovering] = useState(false);
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Smooth spring physics for the cursor - FASTER & SNAPPIER
    const springConfig = { damping: 25, stiffness: 700, mass: 0.1 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            // Check if we are inside a "no-enlarge" zone
            if (target.closest('[data-cursor="default"]')) {
                setIsHovering(false);
                return;
            }

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
                className="relative flex items-center justify-center p-1" // Reduced padding
                animate={{
                    scale: isHovering ? 1.2 : 1, // Reduced scale factor
                }}
                transition={{ duration: 0.15 }} // Faster transition
            >
                {/* Brain Icon - SMALLER */}
                <div className="relative z-10 text-primary drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                    <Brain size={16} strokeWidth={2.5} /> {/* Reduced size from 24 to 16 */}
                </div>

                {/* AI Scanner / Orbiting Ring */}
                <motion.div
                    className="absolute inset-0 border border-t-transparent border-primary/40 rounded-full"
                    style={{ width: '100%', height: '100%' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} // Faster rotation
                />

                {/* Outer Pulse - SUBTLER */}
                <motion.div
                    className="absolute inset-0 bg-primary/10 rounded-full blur-[2px]"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>
        </motion.div>
    );
};