import { useEffect, useRef } from 'react';

/**
 * High-performance ambient aura following the cursor.
 * Uses GPU transform translate3d to avoid layout thrashing and full-screen repaints.
 */
export default function MouseAmbientAura() {
    const auraRef = useRef<HTMLDivElement>(null);
    const pos = useRef({ x: -1000, y: -1000 });
    const rafId = useRef<number | null>(null);

    useEffect(() => {
        // Skip on mobile or touch-primary devices
        if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
            return;
        }

        const handleMouseMove = (e: MouseEvent) => {
            pos.current.x = e.clientX;
            pos.current.y = e.clientY;

            if (rafId.current !== null) return;

            rafId.current = requestAnimationFrame(() => {
                if (auraRef.current) {
                    auraRef.current.style.transform = `translate3d(${pos.current.x - 300}px, ${pos.current.y - 300}px, 0)`;
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
            className="pointer-events-none fixed top-0 left-0 -z-10 size-[600px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,rgba(245,158,11,0.035)_40%,transparent_70%)] blur-2xl will-change-transform opacity-70 hidden md:block"
            style={{ transform: 'translate3d(-1000px, -1000px, 0)' }}
            aria-hidden="true"
        />
    );
}
