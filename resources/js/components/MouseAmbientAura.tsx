import { useEffect, useRef } from 'react';

/**
 * High-performance ambient aura following the cursor.
 * Uses direct DOM manipulation via requestAnimationFrame to avoid triggering React re-renders.
 */
export default function MouseAmbientAura() {
    const auraRef = useRef<HTMLDivElement>(null);
    const rafId = useRef<number | null>(null);

    useEffect(() => {
        // Skip on mobile or touch-primary devices
        if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
            return;
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (rafId.current !== null) return;

            rafId.current = requestAnimationFrame(() => {
                if (auraRef.current) {
                    auraRef.current.style.background = `radial-gradient(700px at ${e.clientX}px ${e.clientY}px, rgba(59, 130, 246, 0.07), rgba(245, 158, 11, 0.035), transparent 70%)`;
                }
                rafId.current = null;
            });
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafId.current !== null) {
                cancelAnimationFrame(rafId.current);
            }
        };
    }, []);

    return (
        <div
            ref={auraRef}
            className="pointer-events-none fixed inset-0 z-0 hidden opacity-70 transition-opacity duration-300 md:block will-change-transform"
            aria-hidden="true"
        />
    );
}
