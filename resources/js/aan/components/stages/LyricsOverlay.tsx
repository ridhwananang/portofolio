import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import { LYRIC_CUES } from "@/aan/config/experience";
import type { LyricCue } from "@/aan/types/experience";

interface LyricsOverlayProps {
  active: boolean;
  elapsedMs: number;
  cues?: readonly LyricCue[];
}

export function LyricsOverlay({
  active,
  elapsedMs,
  cues = LYRIC_CUES,
}: LyricsOverlayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentCue = useMemo(() => {
    if (cues.length === 0) {
return null;
}

    if (elapsedMs < cues[0].startMs) {
      return null;
    }

    const direct = cues.find(
      (cue) => elapsedMs >= cue.startMs && elapsedMs < cue.endMs
    );

    if (direct) {
return direct;
}

    // Hold previous cue briefly during tiny natural vocal breaths (< 700ms)
    for (let i = cues.length - 1; i >= 0; i--) {
      if (elapsedMs >= cues[i].endMs) {
        const gap = elapsedMs - cues[i].endMs;

        // Heart monologue (e.g. 2:26-2:27 fade) disappears completely once ended
        if (cues[i].kind === "heart") {
          return null;
        }

        if (i === cues.length - 1) {
          return gap <= 1400 ? cues[i] : null;
        }

        return gap <= 700 ? cues[i] : null;
      }
    }

    return null;
  }, [cues, elapsedMs]);

  useEffect(() => {
    if (!active || !currentCue || !containerRef.current) {
return;
}

    if (currentCue.kind === "heart") {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );

      return;
    }

    gsap.fromTo(
      containerRef.current,
      { y: 14, opacity: 0, filter: "blur(8px)" },
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.48,
        ease: "power3.out",
      }
    );
  }, [active, currentCue]);

  if (!active || !currentCue) {
return null;
}

  const isHeart = currentCue.kind === "heart";
  // Final heart line (id 107) fades smoothly away over the last 2 seconds (2:26 - 2:27)
  const heartFadeOpacity =
    isHeart && currentCue.id === 107 && elapsedMs >= currentCue.endMs - 2_000
      ? Math.max(0, (currentCue.endMs - elapsedMs) / 2_000)
      : 1;

  if (isHeart) {
    const fullText = `“${currentCue.text}”`;
    const cueElapsed = Math.max(0, elapsedMs - currentCue.startMs);
    const cueDuration = Math.max(1000, currentCue.endMs - currentCue.startMs);
    // Finish typing within ~4.2s (or 55% of cue duration) so reader has ~3.5-4s to savor each line
    const typingWindowMs = Math.min(4_200, cueDuration * 0.55);
    const typeProgress = Math.min(1, cueElapsed / typingWindowMs);
    const visibleCount = Math.max(
      1,
      Math.floor(typeProgress * fullText.length)
    );
    const typedText = fullText.slice(0, visibleCount);

    return (
      <div
        className="pointer-events-none fixed inset-x-6 top-[18%] z-40 flex justify-center sm:inset-x-auto sm:left-[9%] sm:top-[22%] sm:max-w-[46vw] sm:justify-start md:max-w-xl"
        style={{ opacity: heartFadeOpacity }}
      >
        <div ref={containerRef} className="text-center sm:text-left">
          <p
            className="font-editorial text-2xl font-normal italic leading-relaxed tracking-wide text-[#afa18a] sm:text-3xl lg:text-[2.15rem]"
            style={{
              textShadow:
                "0 0 10px rgba(175, 148, 96, 0.32), 0 0 24px rgba(130, 102, 56, 0.2), 0 4px 22px rgba(0, 0, 0, 0.96)",
            }}
          >
            {typedText}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-40 flex justify-center px-6 sm:bottom-12">
      <div ref={containerRef} className="max-w-3xl text-center">
        <p className="font-editorial text-2xl font-medium italic tracking-wide text-[#f7f1e7] drop-shadow-[0_4px_24px_rgba(0,0,0,0.92)] sm:text-4xl">
          {currentCue.text}
        </p>
      </div>
    </div>
  );
}
