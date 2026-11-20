import { useCallback, useEffect, useRef, useState } from "react";
import { BotanicalStage } from "@/aan/components/botanical/BotanicalStage";
import { FireworksCanvas } from "@/aan/components/canvas/FireworksCanvas";
import { NightSkyCanvas } from "@/aan/components/canvas/NightSkyCanvas";
import { NightTerrainOverlay } from "@/aan/components/canvas/NightTerrainOverlay";
import { SeranaCelestialStage } from "@/aan/components/canvas/SeranaCelestialStage";
import { SeranaTravelerCanvas } from "@/aan/components/canvas/SeranaTravelerCanvas";
import { CountdownStage } from "@/aan/components/stages/CountdownStage";
import { EntryCurtain } from "@/aan/components/stages/EntryCurtain";
import { FinalLoveOverlay } from "@/aan/components/stages/FinalLoveOverlay";
import { LyricsOverlay } from "@/aan/components/stages/LyricsOverlay";
import {
  DEFAULT_LUXURY_PALETTE,
  EXPERIENCE_TIMING,
  LYRIC_CUES,
  SERANA_LYRIC_CUES,
} from "@/aan/config/experience";
import { useAudioController } from "@/aan/hooks/useAudioController";
import { useTimelineEngine } from "@/aan/hooks/useTimelineEngine";
import type { ExperiencePalette, LyricCue } from "@/aan/types/experience";
import { unlockSoundEngine } from "@/aan/utils/soundEffects";

const STORAGE_KEY = "mahkota_synced_cues_v4";

function readSavedPrefs(): { cues: LyricCue[]; durationMs: number } {
  const fallback = {
    cues: [...LYRIC_CUES],
    durationMs: EXPERIENCE_TIMING.botanicalDurationMs,
  };

  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as {
      cues?: LyricCue[];
      durationMs?: number;
    };

    return {
      cues:
        Array.isArray(parsed.cues) && parsed.cues.length > 0
          ? parsed.cues
          : fallback.cues,
      durationMs:
        typeof parsed.durationMs === "number" &&
        Number.isFinite(parsed.durationMs) &&
        parsed.durationMs > 2000
          ? parsed.durationMs
          : fallback.durationMs,
    };
  } catch {
    return fallback;
  }
}

export function ExperienceView() {
  const [palette] = useState<ExperiencePalette>(
    DEFAULT_LUXURY_PALETTE
  );
  const [cues, setCues] = useState<LyricCue[]>(() => readSavedPrefs().cues);
  const [botanicalDurationMs, setBotanicalDurationMs] = useState<number>(
    () => readSavedPrefs().durationMs
  );
  const gestureUnlockedRef = useRef(false);
  const youtubeContainerRef = useRef<HTMLDivElement | null>(null);
  const youtubeSeranaContainerRef = useRef<HTMLDivElement | null>(null);

  const persistCues = useCallback(
    (nextCues: LyricCue[], durationMs?: number) => {
      setCues(nextCues);
      const effectiveDuration =
        durationMs && durationMs > 2000 ? durationMs : botanicalDurationMs;

      if (durationMs && durationMs > 2000) {
        setBotanicalDurationMs(durationMs);
      }

      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ cues: nextCues, durationMs: effectiveDuration })
        );
      } catch {
        // Ignore storage quota errors
      }
    },
    [botanicalDurationMs]
  );

  const audio = useAudioController({
    youtubeContainerRef,
    youtubeSeranaContainerRef,
    onSyncedLyricsLoaded: persistCues,
  });

  const timeline = useTimelineEngine({
    autoStart: false,
    botanicalDurationMs,
    seranaDurationMs: EXPERIENCE_TIMING.seranaDurationMs,
    onEnterFireworks: () => {
      audio.prepareAudio();
    },
    onEnterBotanical: () => {
      audio.playSegment(0);
    },
    onBeforeSeranaCrossfade: () => {
      audio.crossfadeToAct2();
    },
    onEnterSerana: () => {
      audio.playAct2(0);
    },
    onEnterEpilogue: () => {
      audio.stopSegment();
    },
    getPreciseAudioMs: audio.getPrecisePlaybackMs,
  });

  // Any first tap/click/keypress anywhere unlocks browser audio & Web Audio SFX
  useEffect(() => {
    if (gestureUnlockedRef.current && !audio.status.autoplayBlocked) {
      return;
    }

    const handleUnlock = () => {
      gestureUnlockedRef.current = true;
      unlockSoundEngine();
      audio.unlockAndSync(timeline.phase, timeline.getLiveElapsedMs());
    };

    window.addEventListener("pointerdown", handleUnlock, { passive: true });
    window.addEventListener("keydown", handleUnlock);

    return () => {
      window.removeEventListener("pointerdown", handleUnlock);
      window.removeEventListener("keydown", handleUnlock);
    };
  }, [audio, timeline]);

  const handleStart = useCallback(() => {
    gestureUnlockedRef.current = true;
    unlockSoundEngine();
    audio.prepareAudio();
    audio.unlockAndSync("countdown", 0);
    timeline.startExperience();
  }, [audio, timeline]);

  const isRunningScene =
    timeline.phase === "countdown" ||
    timeline.phase === "fireworks" ||
    timeline.phase === "botanical" ||
    timeline.phase === "serana";

  const botanicalRemainingMs = Math.max(
    0,
    botanicalDurationMs - timeline.botanicalElapsedMs
  );

  const showLandscape =
    timeline.phase === "fireworks" ||
    timeline.phase === "botanical" ||
    timeline.phase === "serana" ||
    timeline.phase === "epilogue";

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#02040d]">
      {/* Persistent Starry Night & Milky Way Sky */}
      <NightSkyCanvas />

      {/* Rolling Nocturnal Terrain Horizon */}
      <NightTerrainOverlay
        active={showLandscape}
        showSubterraneanVeil={timeline.phase === "botanical"}
        palette={palette}
      />

      {/* Off-screen Dual YouTube IFrame Players (Sadrah + Serana for gapless crossfade) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-[9999px] top-0 h-[180px] w-[320px] opacity-0"
      >
        <div ref={youtubeContainerRef} />
        <div ref={youtubeSeranaContainerRef} />
      </div>

      {/* Subtle ambient vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 45%, #030305 100%)",
        }}
      />

      {/* Non-blocking audio warning if YouTube embed is unreachable */}
      {isRunningScene && audio.status.error && (
        <div className="fixed left-4 top-4 z-50 max-w-xs rounded-xl border border-amber-400/30 bg-[#12100b]/85 px-3.5 py-2 text-[11px] text-amber-100/90 backdrop-blur-md sm:left-6 sm:top-6">
          {audio.status.error}
        </div>
      )}

      {/* Luxury Entry Curtain ("Mulai" button unlocking automatic audio before 1-2-3 countdown) */}
      {timeline.phase === "idle" && (
        <EntryCurtain
          palette={palette}
          audioReady={audio.status.ready}
          onStart={handleStart}
        />
      )}

      {/* Stage 1: Countdown 1 -> 2 -> 3 */}
      <CountdownStage
        active={timeline.phase === "countdown"}
        value={timeline.countdownValue}
        palette={palette}
      />

      {/* Stage 2: 5-Second Luxury Fireworks -> Background through Rose Phase (fades 3s before end) */}
      <FireworksCanvas
        active={
          timeline.phase === "fireworks" || timeline.phase === "botanical"
        }
        mode={timeline.phase === "fireworks" ? "feature" : "background"}
        progress={
          timeline.phase === "fireworks"
            ? timeline.fireworksProgress
            : timeline.botanicalProgress
        }
        remainingMs={
          timeline.phase === "fireworks"
            ? Math.max(
                0,
                EXPERIENCE_TIMING.fireworksDurationMs -
                  timeline.fireworksElapsedMs
              )
            : botanicalRemainingMs
        }
        palette={palette}
      />

      {/* Stage 3: 3D Crimson Red Rose Bush + Sadrah Lyrics (fades 3s before end) */}
      <BotanicalStage
        active={timeline.phase === "botanical"}
        progress={timeline.botanicalProgress}
        remainingMs={botanicalRemainingMs}
        stageName={timeline.botanicalStage}
        palette={palette}
      />

      <LyricsOverlay
        active={timeline.phase === "botanical"}
        elapsedMs={timeline.botanicalElapsedMs}
        cues={cues}
      />

      {/* Stage 4: Act II (Serana 1:29 - 4:05) — Moonrise, Meteor Shower, Love Constellation & Seated Male Traveler */}
      <SeranaCelestialStage
        active={timeline.phase === "serana" || timeline.phase === "epilogue"}
        progress={timeline.seranaProgress}
        palette={palette}
      />

      <SeranaTravelerCanvas
        active={timeline.phase === "serana" || timeline.phase === "epilogue"}
        progress={timeline.seranaProgress}
        palette={palette}
      />

      <LyricsOverlay
        active={timeline.phase === "serana"}
        elapsedMs={timeline.seranaElapsedMs}
        cues={SERANA_LYRIC_CUES}
      />

      {/* Stage 5: Final "I LOVE YOU" Finale beneath the Love Constellation */}
      <FinalLoveOverlay
        active={
          (timeline.phase === "serana" &&
            timeline.seranaElapsedMs >= 146_000) ||
          timeline.phase === "epilogue"
        }
      />
    </main>
  );
}
