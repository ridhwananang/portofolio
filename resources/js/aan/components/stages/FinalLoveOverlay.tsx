import gsap from "gsap";
import { useEffect, useRef } from "react";

interface FinalLoveOverlayProps {
  active: boolean;
}

export function FinalLoveOverlay({ active }: FinalLoveOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const riseRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active) {
return;
}

    const ctx = gsap.context(() => {
      if (riseRef.current) {
        // Rise very slowly & gracefully from behind the hill horizon into the heart center
        gsap.fromTo(
          riseRef.current,
          { y: "42vh", scale: 0.9 },
          {
            y: 0,
            scale: 1,
            duration: 13.5,
            delay: 1.0,
            ease: "sine.inOut",
          }
        );

        // Fade in slowly like emerging moonlight
        gsap.fromTo(
          riseRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 8.0,
            delay: 1.0,
            ease: "sine.inOut",
          }
        );
      }

      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleX: 0, opacity: 0 },
          {
            scaleX: 1,
            opacity: 0.62,
            duration: 3.2,
            delay: 9.0,
            ease: "sine.out",
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [active]);

  if (!active) {
return null;
}

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed left-1/2 z-[16] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center sm:left-[43%]"
      style={{
        top: "calc(17vh + 0.43 * min(44vw, 340px) * 0.92)",
      }}
    >
      <div
        ref={riseRef}
        className="relative flex flex-col items-center"
        style={{
          opacity: 0,
          filter:
            "drop-shadow(0 10px 24px rgba(2, 4, 13, 0.96)) drop-shadow(0 0 22px rgba(255, 244, 218, 0.56)) drop-shadow(0 0 46px rgba(186, 210, 255, 0.36))",
        }}
      >
        {/* Soft lunar atmospheric aura behind the text */}
        <div
          aria-hidden="true"
          className="absolute -inset-x-10 -inset-y-6 rounded-full opacity-35 blur-2xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 244, 218, 0.34) 0%, rgba(186, 210, 255, 0.16) 48%, rgba(0, 0, 0, 0) 75%)",
          }}
        />

        <h1
          className="font-editorial relative whitespace-nowrap pr-1.5 font-medium italic tracking-[0.14em] uppercase"
          style={{
            fontSize: "clamp(0.95rem, 3.6vw, 1.9rem)",
            background:
              "linear-gradient(160deg, #FFFDF7 0%, #EAE4D3 54%, #C6CEDF 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          I LOVE YOU
        </h1>

        <div
          ref={lineRef}
          className="mt-2.5 h-[1px] w-20 origin-center sm:w-28"
          style={{
            opacity: 0,
            background:
              "linear-gradient(90deg, transparent 0%, #EAE4D3 50%, transparent 100%)",
          }}
        />
      </div>
    </div>
  );
}
