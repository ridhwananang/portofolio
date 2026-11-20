import { useCallback, useEffect, useRef, useState } from "react";
import { EXPERIENCE_TIMING } from "@/aan/config/experience";
import type { BotanicalStageName, ExperiencePhase } from "@/aan/types/experience";

interface TimelineOptions {
  autoStart?: boolean;
  botanicalDurationMs?: number;
  seranaDurationMs?: number;
  onEnterFireworks?: () => void;
  onEnterBotanical?: () => void;
  onBeforeSeranaCrossfade?: () => void;
  onEnterSerana?: () => void;
  onEnterEpilogue?: () => void;
  getPreciseAudioMs?: () => number | null;
}

export interface TimelineState {
  phase: ExperiencePhase;
  countdownValue: number; // 1, 2, 3
  fireworksElapsedMs: number;
  fireworksProgress: number; // 0..1
  botanicalElapsedMs: number;
  botanicalProgress: number; // 0..1
  botanicalStage: BotanicalStageName;
  seranaElapsedMs: number;
  seranaProgress: number; // 0..1
}

function resolveBotanicalStage(progress: number): BotanicalStageName {
  if (progress < 0.18) {
return "roots";
}

  if (progress < 0.38) {
return "stem";
}

  if (progress < 0.65) {
return "bloom";
}

  return "shedding";
}

const TOTAL_COUNTDOWN_MS =
  EXPERIENCE_TIMING.countdownStepMs * EXPERIENCE_TIMING.countdownSteps.length;

export function useTimelineEngine(options: TimelineOptions) {
  const optionsRef = useRef(options);
  const tickRef = useRef<(now: number) => void>(() => {});

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const rafRef = useRef<number | null>(null);
  const phaseStartPerfRef = useRef<number>(0);
  const currentPhaseRef = useRef<ExperiencePhase>("idle");
  const crossfadeTriggeredRef = useRef<boolean>(false);

  const [state, setState] = useState<TimelineState>(() => ({
    phase: options.autoStart ? "countdown" : "idle",
    countdownValue: 1,
    fireworksElapsedMs: 0,
    fireworksProgress: 0,
    botanicalElapsedMs: 0,
    botanicalProgress: 0,
    botanicalStage: "roots",
    seranaElapsedMs: 0,
    seranaProgress: 0,
  }));

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const transitionTo = useCallback((next: ExperiencePhase, now: number) => {
    currentPhaseRef.current = next;
    phaseStartPerfRef.current = now;

    if (next === "fireworks") {
      optionsRef.current.onEnterFireworks?.();
    } else if (next === "botanical") {
      crossfadeTriggeredRef.current = false;
      optionsRef.current.onEnterBotanical?.();
    } else if (next === "serana") {
      optionsRef.current.onEnterSerana?.();
    } else if (next === "epilogue") {
      optionsRef.current.onEnterEpilogue?.();
    }
  }, []);

  const tick = useCallback(
    (now: number) => {
      const phase = currentPhaseRef.current;
      const elapsed = Math.max(0, now - phaseStartPerfRef.current);

      if (phase === "countdown") {
        if (elapsed >= TOTAL_COUNTDOWN_MS) {
          transitionTo("fireworks", now);
          setState((prev) => ({
            ...prev,
            phase: "fireworks",
            countdownValue: 3,
            fireworksElapsedMs: 0,
            fireworksProgress: 0,
          }));
        } else {
          const stepIndex = Math.min(
            EXPERIENCE_TIMING.countdownSteps.length - 1,
            Math.floor(elapsed / EXPERIENCE_TIMING.countdownStepMs)
          );
          const stepValue = EXPERIENCE_TIMING.countdownSteps[stepIndex];
          setState((prev) =>
            prev.phase === "countdown" && prev.countdownValue === stepValue
              ? prev
              : {
                  ...prev,
                  phase: "countdown",
                  countdownValue: stepValue,
                }
          );
        }
      } else if (phase === "fireworks") {
        const duration = EXPERIENCE_TIMING.fireworksDurationMs;

        if (elapsed >= duration) {
          transitionTo("botanical", now);
          setState((prev) => ({
            ...prev,
            phase: "botanical",
            fireworksElapsedMs: duration,
            fireworksProgress: 1,
            botanicalElapsedMs: 0,
            botanicalProgress: 0,
            botanicalStage: "roots",
          }));
        } else {
          setState((prev) => ({
            ...prev,
            phase: "fireworks",
            fireworksElapsedMs: elapsed,
            fireworksProgress: Math.min(1, elapsed / duration),
          }));
        }
      } else if (phase === "botanical") {
        const duration =
          optionsRef.current.botanicalDurationMs ??
          EXPERIENCE_TIMING.botanicalDurationMs;
        const audioMs = optionsRef.current.getPreciseAudioMs?.();

        let effectiveElapsed = elapsed;

        if (audioMs === -1 && elapsed < 5_500) {
          effectiveElapsed = Math.min(250, elapsed * 0.05);
        } else if (
          audioMs !== null &&
          audioMs !== undefined &&
          audioMs >= 0
        ) {
          effectiveElapsed = audioMs;
          phaseStartPerfRef.current = now - audioMs;
        }

        // Start crossfading Serana 1.2s before Sadrah ends so there is zero audio pause
        if (
          !crossfadeTriggeredRef.current &&
          effectiveElapsed >= duration - 1_200
        ) {
          crossfadeTriggeredRef.current = true;
          optionsRef.current.onBeforeSeranaCrossfade?.();
        }

        if (effectiveElapsed >= duration) {
          transitionTo("serana", now);
          setState((prev) => ({
            ...prev,
            phase: "serana",
            botanicalElapsedMs: duration,
            botanicalProgress: 1,
            botanicalStage: "shedding",
            seranaElapsedMs: 0,
            seranaProgress: 0,
          }));
        } else {
          const progress = Math.min(1, effectiveElapsed / duration);
          setState((prev) => ({
            ...prev,
            phase: "botanical",
            botanicalElapsedMs: effectiveElapsed,
            botanicalProgress: progress,
            botanicalStage: resolveBotanicalStage(progress),
          }));
        }
      } else if (phase === "serana") {
        const duration =
          optionsRef.current.seranaDurationMs ??
          EXPERIENCE_TIMING.seranaDurationMs;
        const audioMs = optionsRef.current.getPreciseAudioMs?.();

        let effectiveElapsed = elapsed;

        if (audioMs === -1 && elapsed < 5_500) {
          effectiveElapsed = 0;
        } else if (
          audioMs !== null &&
          audioMs !== undefined &&
          audioMs >= 0
        ) {
          effectiveElapsed = audioMs;
          phaseStartPerfRef.current = now - audioMs;
        }

        if (effectiveElapsed >= duration) {
          transitionTo("epilogue", now);
          setState((prev) => ({
            ...prev,
            phase: "epilogue",
            seranaElapsedMs: duration,
            seranaProgress: 1,
          }));
          stopLoop();

          return;
        }

        setState((prev) => ({
          ...prev,
          phase: "serana",
          seranaElapsedMs: effectiveElapsed,
          seranaProgress: Math.min(1, effectiveElapsed / duration),
        }));
      }

      if (
        currentPhaseRef.current !== "idle" &&
        currentPhaseRef.current !== "epilogue"
      ) {
        rafRef.current = requestAnimationFrame((ts) => tickRef.current(ts));
      }
    },
    [stopLoop, transitionTo]
  );

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const startExperience = useCallback(() => {
    stopLoop();
    crossfadeTriggeredRef.current = false;
    const now = performance.now();
    currentPhaseRef.current = "countdown";
    phaseStartPerfRef.current = now;
    setState({
      phase: "countdown",
      countdownValue: 1,
      fireworksElapsedMs: 0,
      fireworksProgress: 0,
      botanicalElapsedMs: 0,
      botanicalProgress: 0,
      botanicalStage: "roots",
      seranaElapsedMs: 0,
      seranaProgress: 0,
    });
    rafRef.current = requestAnimationFrame((ts) => tickRef.current(ts));
  }, [stopLoop]);

  const jumpToEpilogue = useCallback(() => {
    stopLoop();
    const now = performance.now();
    const duration =
      optionsRef.current.botanicalDurationMs ??
      EXPERIENCE_TIMING.botanicalDurationMs;
    const seranaDur =
      optionsRef.current.seranaDurationMs ??
      EXPERIENCE_TIMING.seranaDurationMs;
    transitionTo("epilogue", now);
    setState((prev) => ({
      ...prev,
      phase: "epilogue",
      botanicalElapsedMs: duration,
      botanicalProgress: 1,
      botanicalStage: "shedding",
      seranaElapsedMs: seranaDur,
      seranaProgress: 1,
    }));
  }, [stopLoop, transitionTo]);

  const getLiveElapsedMs = useCallback(() => {
    return Math.max(0, performance.now() - phaseStartPerfRef.current);
  }, []);

  useEffect(() => {
    if (optionsRef.current.autoStart) {
      startExperience();
    }

    return () => stopLoop();
  }, [startExperience, stopLoop]);

  return {
    ...state,
    startExperience,
    jumpToEpilogue,
    getLiveElapsedMs,
  };
}
