import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import type { ExperiencePalette } from "@/aan/types/experience";
import { playCountdownChime } from "@/aan/utils/soundEffects";

interface CountdownStageProps {
  active: boolean;
  value: number; // 1, 2, 3
  palette: ExperiencePalette;
}

const DIAL_TICKS = Array.from({ length: 36 }, (_, i) => i * 10);

export function CountdownStage({
  active,
  value,
  palette,
}: CountdownStageProps) {
  const numberRef = useRef<HTMLDivElement | null>(null);
  const shockwaveRef = useRef<HTMLDivElement | null>(null);
  const haloRef = useRef<HTMLDivElement | null>(null);
  const outerDialRef = useRef<SVGSVGElement | null>(null);
  const innerRingRef = useRef<HTMLDivElement | null>(null);

  const orbitalSparks = useMemo(
    () => [
      { top: "14%", left: "24%", delay: "0s", size: 3 },
      { top: "22%", left: "78%", delay: "0.4s", size: 2.5 },
      { top: "76%", left: "18%", delay: "0.7s", size: 2.5 },
      { top: "80%", left: "76%", delay: "0.2s", size: 3.5 },
      { top: "50%", left: "8%", delay: "0.5s", size: 2 },
      { top: "48%", left: "92%", delay: "0.9s", size: 2 },
    ],
    []
  );

  // Continuous luxury orbital rotation while countdown is mounted
  useEffect(() => {
    if (!active) {
return;
}

    const outerTween = outerDialRef.current
      ? gsap.to(outerDialRef.current, {
          rotation: 360,
          duration: 28,
          repeat: -1,
          ease: "none",
        })
      : null;

    const innerTween = innerRingRef.current
      ? gsap.to(innerRingRef.current, {
          rotation: -360,
          duration: 18,
          repeat: -1,
          ease: "none",
        })
      : null;

    return () => {
      outerTween?.kill();
      innerTween?.kill();
    };
  }, [active]);

  // Beat-synchronized luxury choreography + chime SFX for 1 -> 2 -> 3
  useEffect(() => {
    if (!active) {
return;
}

    playCountdownChime(value);

    const ctx = gsap.context(() => {
      if (numberRef.current) {
        const tl = gsap.timeline();
        tl.fromTo(
          numberRef.current,
          {
            scale: 1.38,
            y: 22,
            opacity: 0,
            filter: "blur(18px)",
          },
          {
            scale: 1,
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.56,
            ease: "expo.out",
          }
        )
          .to(numberRef.current, {
            scale: 1.04,
            duration: 0.42,
            ease: "sine.inOut",
          })
          .to(numberRef.current, {
            scale: 0.88,
            y: -12,
            opacity: 0,
            filter: "blur(10px)",
            duration: 0.24,
            ease: "power2.in",
          });
      }

      if (shockwaveRef.current) {
        gsap.fromTo(
          shockwaveRef.current,
          { scale: 0.72, opacity: 0.85 },
          {
            scale: 1.48,
            opacity: 0,
            duration: 1.05,
            ease: "power3.out",
          }
        );
      }

      if (haloRef.current) {
        gsap.fromTo(
          haloRef.current,
          { scale: 0.8, opacity: 0.55 },
          {
            scale: 1.25,
            opacity: 0.14,
            duration: 1.1,
            ease: "power2.out",
          }
        );
      }
    });

    return () => ctx.revert();
  }, [active, value]);

  if (!active) {
return null;
}

  return (
    <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center overflow-hidden">
      {/* Ambient champagne radial glow */}
      <div
        ref={haloRef}
        className="absolute h-[28rem] w-[28rem] rounded-full blur-3xl sm:h-[38rem] sm:w-[38rem]"
        style={{
          background: `radial-gradient(circle, ${palette.accentHex}38 0%, ${palette.petalSecondary}18 45%, transparent 72%)`,
        }}
      />

      {/* Luxury Astrolabe & Numeral Stage (2x scale) */}
      <div className="relative flex h-[22rem] w-[22rem] items-center justify-center sm:h-[30rem] sm:w-[30rem] md:h-[34rem] md:w-[34rem]">
        {/* Expanding beat shockwave ring */}
        <div
          ref={shockwaveRef}
          className="absolute inset-6 rounded-full border"
          style={{
            borderColor: `${palette.glowHex}88`,
            boxShadow: `0 0 36px ${palette.accentHex}44`,
          }}
        />

        {/* Outer rotating precision SVG dial */}
        <svg
          ref={outerDialRef}
          viewBox="0 0 400 400"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <circle
            cx="200"
            cy="200"
            r="190"
            fill="none"
            stroke={palette.accentHex}
            strokeOpacity="0.28"
            strokeWidth="0.9"
          />
          <circle
            cx="200"
            cy="200"
            r="176"
            fill="none"
            stroke={palette.glowHex}
            strokeOpacity="0.14"
            strokeWidth="0.6"
            strokeDasharray="3 8"
          />
          {DIAL_TICKS.map((deg) => {
            const isCardinal = deg % 90 === 0;

            return (
              <line
                key={deg}
                x1="200"
                y1={isCardinal ? "6" : "11"}
                x2="200"
                y2={isCardinal ? "22" : "17"}
                stroke={isCardinal ? palette.glowHex : palette.accentHex}
                strokeOpacity={isCardinal ? 0.78 : 0.35}
                strokeWidth={isCardinal ? "1.6" : "0.8"}
                transform={`rotate(${deg} 200 200)`}
              />
            );
          })}
        </svg>

        {/* Counter-rotating inner luxury ring with diamond nodes */}
        <div
          ref={innerRingRef}
          className="absolute inset-10 rounded-full border border-dashed sm:inset-14"
          style={{ borderColor: `${palette.accentHex}40` }}
        >
          <span
            className="absolute -top-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45"
            style={{
              backgroundColor: palette.glowHex,
              boxShadow: `0 0 12px ${palette.accentHex}`,
            }}
          />
          <span
            className="absolute -bottom-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45"
            style={{
              backgroundColor: palette.glowHex,
              boxShadow: `0 0 12px ${palette.accentHex}`,
            }}
          />
        </div>

        {/* Subtle ambient stardust */}
        {orbitalSparks.map((sp, idx) => (
          <span
            key={idx}
            className="animate-pulse-ring absolute rounded-full"
            style={{
              top: sp.top,
              left: sp.left,
              width: `${sp.size}px`,
              height: `${sp.size}px`,
              backgroundColor: palette.glowHex,
              boxShadow: `0 0 10px ${palette.accentHex}`,
              animationDelay: sp.delay,
            }}
          />
        ))}

        {/* Soft inner radial glow behind numeral so shadow depth stands out clearly */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-16 rounded-full blur-2xl"
          style={{
            background: `radial-gradient(circle, ${palette.accentHex}32 0%, ${palette.glowHex}14 45%, transparent 72%)`,
          }}
        />

        {/* 2x Smooth Modern Geometric Numeral with Persistent Shadow & Halo */}
        <div
          className="relative"
          style={{
            filter: `drop-shadow(0 10px 18px rgba(0, 0, 0, 0.96)) drop-shadow(0 20px 36px rgba(0, 0, 0, 0.86)) drop-shadow(0 0 22px rgba(248, 231, 184, 0.5)) drop-shadow(0 0 48px ${palette.accentHex}7a)`,
          }}
        >
          <div
            ref={numberRef}
            className="font-sans gold-gradient-text relative select-none text-[11.5rem] leading-none font-medium tracking-[-0.02em] sm:text-[15rem] md:text-[17rem]"
            style={{
              fontFamily: "var(--font-sans), system-ui, -apple-system, sans-serif",
            }}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}
