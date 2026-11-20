import { useCallback, useEffect, useRef, useState  } from "react";
import type {RefObject} from "react";
import { AUDIO_SEGMENT, SERANA_AUDIO_SEGMENT } from "@/aan/config/experience";
import type {
  AiSyncLyricsResponse,
  AudioSourceMode,
  AudioStatus,
  ExperiencePhase,
  LyricCue,
} from "@/aan/types/experience";
import { sliceAudioWindowToWav } from "@/aan/utils/audioSlice";

interface UseAudioControllerOptions {
  youtubeContainerRef: RefObject<HTMLDivElement | null>;
  youtubeSeranaContainerRef: RefObject<HTMLDivElement | null>;
  onSyncedLyricsLoaded?: (cues: LyricCue[], durationMs?: number) => void;
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  cueVideoById: (options: {
    videoId: string;
    startSeconds?: number;
    endSeconds?: number;
  }) => void;
  loadVideoById: (options: {
    videoId: string;
    startSeconds?: number;
    endSeconds?: number;
  }) => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

interface YTGlobal {
  Player: new (
    elementId: string | HTMLElement,
    options: {
      height?: string | number;
      width?: string | number;
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YTPlayer }) => void;
        onStateChange?: (event: { data: number }) => void;
        onError?: () => void;
      };
    }
  ) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTGlobal;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export function useAudioController(options: UseAudioControllerOptions) {
  const { youtubeContainerRef, youtubeSeranaContainerRef } = options;
  const onSyncedLyricsRef = useRef(options.onSyncedLyricsLoaded);

  useEffect(() => {
    onSyncedLyricsRef.current = options.onSyncedLyricsLoaded;
  }, [options.onSyncedLyricsLoaded]);
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const ytSeranaPlayerRef = useRef<YTPlayer | null>(null);

  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const customObjectUrlRef = useRef<string | null>(null);
  const fadeFrameRef = useRef<number | null>(null);
  const crossfadeFrameRef = useRef<number | null>(null);
  const verifyTimerRef = useRef<number | null>(null);
  const pendingPrepareRef = useRef<boolean>(false);
  const isMutedRef = useRef(false);
  const modeRef = useRef<AudioSourceMode>("youtube");
  const customFileStartSecRef = useRef<number>(0);

  const activeActRef = useRef<"sadrah" | "serana">("sadrah");
  const yt1SampleTimeRef = useRef<number>(AUDIO_SEGMENT.startSeconds);
  const yt1SamplePerfRef = useRef<number>(0);
  const yt1ExpectPlayingRef = useRef<boolean>(false);
  const yt1IsPlayingRef = useRef<boolean>(false);

  const yt2SampleTimeRef = useRef<number>(SERANA_AUDIO_SEGMENT.startSeconds);
  const yt2SamplePerfRef = useRef<number>(0);
  const yt2ExpectPlayingRef = useRef<boolean>(false);
  const yt2IsPlayingRef = useRef<boolean>(false);
  const yt2PrewarmedRef = useRef<boolean>(false);

  const ytAutoplayBlockedRef = useRef<boolean>(false);
  const ytErrorRef = useRef<boolean>(false);

  const [status, setStatus] = useState<AudioStatus>({
    mode: "youtube",
    ready: false,
    playing: false,
    muted: false,
    autoplayBlocked: false,
    error: null,
    customFileName: null,
  });

  const cancelFade = useCallback(() => {
    if (fadeFrameRef.current !== null) {
      cancelAnimationFrame(fadeFrameRef.current);
      fadeFrameRef.current = null;
    }
  }, []);

  const cancelCrossfade = useCallback(() => {
    if (crossfadeFrameRef.current !== null) {
      cancelAnimationFrame(crossfadeFrameRef.current);
      crossfadeFrameRef.current = null;
    }
  }, []);

  const clearVerifyTimer = useCallback(() => {
    if (verifyTimerRef.current !== null) {
      window.clearTimeout(verifyTimerRef.current);
      verifyTimerRef.current = null;
    }
  }, []);

  const fadeHtmlAudio = useCallback(
    (
      audio: HTMLAudioElement,
      from: number,
      to: number,
      durationMs: number,
      onDone?: () => void
    ) => {
      cancelFade();
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / durationMs);
        audio.volume = Math.max(0, Math.min(1, from + (to - from) * progress));

        if (progress < 1) {
          fadeFrameRef.current = requestAnimationFrame(step);
        } else {
          fadeFrameRef.current = null;
          onDone?.();
        }
      };
      fadeFrameRef.current = requestAnimationFrame(step);
    },
    [cancelFade]
  );


  const warmYoutubeBuffer = useCallback(
    (player: YTPlayer, startSec: number, fromGesture = false) => {
      try {
        const curr = player.getCurrentTime();

        if (!Number.isFinite(curr) || Math.abs(curr - startSec) > 0.8) {
          player.seekTo(startSec, true);
        }

        if (fromGesture) {
          player.mute();
          player.playVideo();
          player.pauseVideo();

          if (!isMutedRef.current) {
            player.unMute();
          }
        }
      } catch {
        // Ignore
      }
    },
    []
  );

  // Mount BOTH YouTube IFrame players (Act I Sadrah + Act II Serana) for gapless crossfade
  useEffect(() => {
    if (typeof window === "undefined") {
return;
}

    let cancelled = false;

    const mountPlayers = () => {
      if (cancelled || !window.YT?.Player) {
return;
}

      if (youtubeContainerRef.current && !ytPlayerRef.current) {
        ytPlayerRef.current = new window.YT.Player(
          youtubeContainerRef.current,
          {
            height: "180",
            width: "320",
            videoId: AUDIO_SEGMENT.youtubeVideoId,
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              enablejsapi: 1,
              fs: 0,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
              start: AUDIO_SEGMENT.startSeconds,
              end: AUDIO_SEGMENT.endSeconds,
            },
            events: {
              onReady: (event) => {
                if (cancelled) {
return;
}

                ytErrorRef.current = false;
                setStatus((prev) => ({
                  ...prev,
                  ready: true,
                  error: null,
                }));

                if (pendingPrepareRef.current && modeRef.current === "youtube") {
                  pendingPrepareRef.current = false;
                  warmYoutubeBuffer(
                    event.target,
                    AUDIO_SEGMENT.startSeconds,
                    false
                  );
                }
              },
              onStateChange: (event) => {
                if (cancelled || modeRef.current !== "youtube") {
return;
}

                if (event.data === 1) {
                  yt1IsPlayingRef.current = true;
                  ytAutoplayBlockedRef.current = false;
                  clearVerifyTimer();

                  if (ytPlayerRef.current) {
                    try {
                      const t = ytPlayerRef.current.getCurrentTime();

                      if (
                        Number.isFinite(t) &&
                        t >= AUDIO_SEGMENT.startSeconds - 0.8
                      ) {
                        yt1SampleTimeRef.current = t;
                        yt1SamplePerfRef.current = performance.now();
                      }
                    } catch {
                      // Ignore
                    }
                  }

                  if (activeActRef.current === "sadrah") {
                    setStatus((prev) => ({
                      ...prev,
                      playing: true,
                      autoplayBlocked: false,
                    }));
                  }
                } else {
                  yt1IsPlayingRef.current = false;
                }
              },
              onError: () => {
                if (cancelled) {
return;
}

                ytErrorRef.current = true;
                yt1IsPlayingRef.current = false;

                if (modeRef.current === "youtube") {
                  setStatus((prev) => ({
                    ...prev,
                    error:
                      "YouTube embed tidak dapat dimuat (offline/dibatasi). Visual & lirik tetap berjalan presisi.",
                  }));
                }
              },
            },
          }
        );
      }

      if (youtubeSeranaContainerRef.current && !ytSeranaPlayerRef.current) {
        ytSeranaPlayerRef.current = new window.YT.Player(
          youtubeSeranaContainerRef.current,
          {
            height: "180",
            width: "320",
            videoId: SERANA_AUDIO_SEGMENT.youtubeVideoId,
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              enablejsapi: 1,
              fs: 0,
              modestbranding: 1,
              playsinline: 1,
              rel: 0,
              start: SERANA_AUDIO_SEGMENT.startSeconds - 1, // 1:28 pre-roll for 1.2s crossfade
              end: SERANA_AUDIO_SEGMENT.endSeconds,
            },
            events: {
              onReady: (event) => {
                if (cancelled) {
return;
}

                warmYoutubeBuffer(
                  event.target,
                  SERANA_AUDIO_SEGMENT.startSeconds - 1,
                  false
                );
              },
              onStateChange: (event) => {
                if (cancelled || modeRef.current !== "youtube") {
return;
}

                if (event.data === 1) {
                  yt2IsPlayingRef.current = true;
                  ytAutoplayBlockedRef.current = false;

                  if (ytSeranaPlayerRef.current) {
                    try {
                      const t = ytSeranaPlayerRef.current.getCurrentTime();

                      if (
                        Number.isFinite(t) &&
                        t >= SERANA_AUDIO_SEGMENT.startSeconds - 2.0
                      ) {
                        yt2SampleTimeRef.current = t;
                        yt2SamplePerfRef.current = performance.now();
                      }
                    } catch {
                      // Ignore
                    }
                  }

                  if (activeActRef.current === "serana") {
                    setStatus((prev) => ({
                      ...prev,
                      playing: true,
                      autoplayBlocked: false,
                    }));
                  }
                } else {
                  yt2IsPlayingRef.current = false;
                }
              },
            },
          }
        );
      }
    };

    if (window.YT?.Player) {
      mountPlayers();
    } else {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src="https://www.youtube.com/iframe_api"]'
      );
      const prevHandler = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prevHandler?.();
        mountPlayers();
      };

      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
    }

    return () => {
      cancelled = true;
      cancelFade();
      cancelCrossfade();
      clearVerifyTimer();

      if (customObjectUrlRef.current) {
        URL.revokeObjectURL(customObjectUrlRef.current);
        customObjectUrlRef.current = null;
      }

      ytPlayerRef.current?.destroy();
      ytPlayerRef.current = null;
      ytSeranaPlayerRef.current?.destroy();
      ytSeranaPlayerRef.current = null;
    };
  }, [cancelCrossfade, cancelFade, clearVerifyTimer, warmYoutubeBuffer, youtubeContainerRef, youtubeSeranaContainerRef]);

  const prepareAudio = useCallback(() => {
    activeActRef.current = "sadrah";
    yt2PrewarmedRef.current = false;
    cancelCrossfade();

    if (modeRef.current === "custom-file" && htmlAudioRef.current) {
      try {
        htmlAudioRef.current.currentTime = customFileStartSecRef.current;
        htmlAudioRef.current.load();
      } catch {
        // Ignore
      }

      return;
    }

    const player1 = ytPlayerRef.current;

    if (!player1) {
      pendingPrepareRef.current = true;

      return;
    }

    warmYoutubeBuffer(player1, AUDIO_SEGMENT.startSeconds, false);

    if (ytSeranaPlayerRef.current) {
      try {
        ytSeranaPlayerRef.current.pauseVideo();
        ytSeranaPlayerRef.current.seekTo(
          SERANA_AUDIO_SEGMENT.startSeconds - 1,
          true
        );
      } catch {
        // Ignore
      }
    }
  }, [cancelCrossfade, warmYoutubeBuffer]);

  const playSegment = useCallback(
    (offsetMs = 0) => {
      if (modeRef.current === "silent") {
return;
}

      clearVerifyTimer();
      cancelCrossfade();
      activeActRef.current = "sadrah";

      const offsetSec = Math.max(0, offsetMs / 1000);

      if (modeRef.current === "custom-file" && htmlAudioRef.current) {
        const audio = htmlAudioRef.current;
        audio.muted = isMutedRef.current;
        audio.currentTime = customFileStartSecRef.current + offsetSec;
        audio.volume = 0;
        audio
          .play()
          .then(() => {
            fadeHtmlAudio(audio, 0, isMutedRef.current ? 0 : 0.92, 650);
            setStatus((prev) => ({
              ...prev,
              playing: true,
              autoplayBlocked: false,
              error: null,
            }));
          })
          .catch(() => {
            setStatus((prev) => ({
              ...prev,
              playing: false,
              autoplayBlocked: true,
            }));
          });

        return;
      }

      const player = ytPlayerRef.current;

      if (!player) {
        setStatus((prev) => ({ ...prev, autoplayBlocked: true }));

        return;
      }

      try {
        yt1ExpectPlayingRef.current = true;
        ytAutoplayBlockedRef.current = false;
        const targetSec = AUDIO_SEGMENT.startSeconds + offsetSec;
        yt1SampleTimeRef.current = targetSec;
        yt1SamplePerfRef.current = performance.now();

        const curr = player.getCurrentTime();

        if (!Number.isFinite(curr) || Math.abs(curr - targetSec) > 0.6) {
          player.seekTo(targetSec, true);
        }

        if (isMutedRef.current) {
          player.mute();
        } else {
          player.unMute();
          player.setVolume(90);
        }

        player.playVideo();

        // Pre-buffer Serana silently once Sadrah is playing so transition has zero lag
        if (!yt2PrewarmedRef.current && ytSeranaPlayerRef.current) {
          yt2PrewarmedRef.current = true;
          const p2 = ytSeranaPlayerRef.current;
          window.setTimeout(() => {
            try {
              p2.mute();
              p2.seekTo(SERANA_AUDIO_SEGMENT.startSeconds - 1, true);
              p2.playVideo();
              window.setTimeout(() => {
                try {
                  if (activeActRef.current === "sadrah") {
                    p2.pauseVideo();
                    p2.seekTo(SERANA_AUDIO_SEGMENT.startSeconds - 1, true);
                  }
                } catch {
                  // Ignore
                }
              }, 350);
            } catch {
              // Ignore
            }
          }, 2500);
        }

        verifyTimerRef.current = window.setTimeout(() => {
          try {
            const state = player.getPlayerState();
            const isActive = state === 1 || state === 3;
            ytAutoplayBlockedRef.current = !isActive;
            setStatus((prev) => ({
              ...prev,
              playing: state === 1,
              autoplayBlocked: !isActive,
            }));
          } catch {
            // Ignore
          }
        }, 1600);
      } catch {
        ytAutoplayBlockedRef.current = true;
        setStatus((prev) => ({
          ...prev,
          playing: false,
          autoplayBlocked: true,
        }));
      }
    },
    [cancelCrossfade, clearVerifyTimer, fadeHtmlAudio]
  );

  /**
   * Starts Serana 1.2s before Sadrah finishes, crossfading volumes seamlessly
   * so there is zero audio pause between Sadrah (4:03) and Serana (1:29).
   */
  const crossfadeToAct2 = useCallback(() => {
    if (modeRef.current !== "youtube") {
return;
}

    const p1 = ytPlayerRef.current;
    const p2 = ytSeranaPlayerRef.current;

    if (!p2) {
return;
}

    cancelCrossfade();
    yt2ExpectPlayingRef.current = true;
    const startSec = SERANA_AUDIO_SEGMENT.startSeconds - 1.2;
    yt2SampleTimeRef.current = startSec;
    yt2SamplePerfRef.current = performance.now();

    try {
      const curr2 = p2.getCurrentTime();

      if (!Number.isFinite(curr2) || Math.abs(curr2 - startSec) > 1.0) {
        p2.seekTo(startSec, true);
      }

      if (isMutedRef.current) {
        p2.mute();
      } else {
        p2.unMute();
        p2.setVolume(0);
      }

      p2.playVideo();

      const startPerf = performance.now();
      const durationMs = 1200;
      const step = (now: number) => {
        const t = Math.min(1, (now - startPerf) / durationMs);

        if (!isMutedRef.current) {
          try {
            p1?.setVolume(Math.round(90 * (1 - t)));
            p2.setVolume(Math.round(90 * t));
          } catch {
            // Ignore
          }
        }

        if (t < 1) {
          crossfadeFrameRef.current = requestAnimationFrame(step);
        } else {
          crossfadeFrameRef.current = null;
        }
      };
      crossfadeFrameRef.current = requestAnimationFrame(step);
    } catch {
      // Ignore
    }
  }, [cancelCrossfade]);

  /**
   * Called at the exact moment Act II ("serana") phase begins.
   * Stops Act I cleanly and hands timeline sync over to Act II (already playing at 1:29).
   */
  const playAct2 = useCallback(
    (offsetMs = 0) => {
      activeActRef.current = "serana";
      yt1ExpectPlayingRef.current = false;
      yt1IsPlayingRef.current = false;

      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {
          // Ignore
        }
      }

      if (htmlAudioRef.current && !htmlAudioRef.current.paused) {
        const audio = htmlAudioRef.current;
        fadeHtmlAudio(audio, audio.volume, 0, 800, () => {
          audio.pause();
        });
      }

      const p2 = ytSeranaPlayerRef.current;

      if (!p2) {
return;
}

      yt2ExpectPlayingRef.current = true;
      const targetSec = SERANA_AUDIO_SEGMENT.startSeconds + offsetMs / 1000;

      try {
        if (isMutedRef.current) {
          p2.mute();
        } else {
          p2.unMute();
          p2.setVolume(90);
        }

        const state = p2.getPlayerState();
        const curr = p2.getCurrentTime();

        if (state !== 1 && state !== 3) {
          if (!Number.isFinite(curr) || Math.abs(curr - targetSec) > 1.5) {
            p2.seekTo(targetSec, true);
          }

          p2.playVideo();
        }
      } catch {
        // Ignore
      }
    },
    [fadeHtmlAudio]
  );

  const unlockAndSync = useCallback(
    (phase: ExperiencePhase, currentPhaseMs: number) => {
      if (phase === "countdown" || phase === "fireworks") {
        if (modeRef.current === "custom-file" && htmlAudioRef.current) {
          const audio = htmlAudioRef.current;
          const prevMuted = audio.muted;
          audio.muted = true;
          audio
            .play()
            .then(() => {
              audio.pause();
              audio.currentTime = customFileStartSecRef.current;
              audio.muted = prevMuted;
            })
            .catch(() => {
              audio.muted = prevMuted;
            });
        } else {
          if (ytPlayerRef.current) {
            warmYoutubeBuffer(
              ytPlayerRef.current,
              AUDIO_SEGMENT.startSeconds,
              true
            );
          }

          if (ytSeranaPlayerRef.current) {
            warmYoutubeBuffer(
              ytSeranaPlayerRef.current,
              SERANA_AUDIO_SEGMENT.startSeconds - 1,
              true
            );
          }
        }

        setStatus((prev) => ({ ...prev, autoplayBlocked: false }));

        return;
      }

      if (phase === "botanical") {
        if (ytSeranaPlayerRef.current && !yt2PrewarmedRef.current) {
          yt2PrewarmedRef.current = true;
          warmYoutubeBuffer(
            ytSeranaPlayerRef.current,
            SERANA_AUDIO_SEGMENT.startSeconds - 1,
            true
          );
        }

        if (modeRef.current === "youtube" && ytPlayerRef.current) {
          try {
            const state = ytPlayerRef.current.getPlayerState();

            if (state === 1) {
              if (!isMutedRef.current) {
                ytPlayerRef.current.unMute();
                ytPlayerRef.current.setVolume(90);
              }

              ytAutoplayBlockedRef.current = false;
              setStatus((prev) => ({
                ...prev,
                autoplayBlocked: false,
                playing: true,
              }));

              return;
            }
          } catch {
            // Fall through
          }
        }

        playSegment(currentPhaseMs);
      } else if (phase === "serana") {
        if (ytSeranaPlayerRef.current) {
          try {
            const state = ytSeranaPlayerRef.current.getPlayerState();

            if (state === 1) {
              if (!isMutedRef.current) {
                ytSeranaPlayerRef.current.unMute();
                ytSeranaPlayerRef.current.setVolume(90);
              }

              ytAutoplayBlockedRef.current = false;
              setStatus((prev) => ({
                ...prev,
                autoplayBlocked: false,
                playing: true,
              }));

              return;
            }
          } catch {
            // Fall through
          }
        }

        playAct2(currentPhaseMs);
      }
    },
    [playAct2, playSegment, warmYoutubeBuffer]
  );

  const stopSegment = useCallback(() => {
    yt1ExpectPlayingRef.current = false;
    yt1IsPlayingRef.current = false;
    yt2ExpectPlayingRef.current = false;
    yt2IsPlayingRef.current = false;
    ytAutoplayBlockedRef.current = false;
    clearVerifyTimer();
    cancelCrossfade();

    if (htmlAudioRef.current && !htmlAudioRef.current.paused) {
      const audio = htmlAudioRef.current;
      fadeHtmlAudio(audio, audio.volume, 0, 900, () => {
        audio.pause();
        audio.currentTime = customFileStartSecRef.current;
      });
    }

    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {
        // Ignore
      }
    }

    if (ytSeranaPlayerRef.current) {
      try {
        ytSeranaPlayerRef.current.pauseVideo();
      } catch {
        // Ignore
      }
    }

    setStatus((prev) => ({
      ...prev,
      playing: false,
      autoplayBlocked: false,
    }));
  }, [cancelCrossfade, clearVerifyTimer, fadeHtmlAudio]);

  const toggleMute = useCallback(() => {
    const nextMuted = !isMutedRef.current;
    isMutedRef.current = nextMuted;

    if (htmlAudioRef.current) {
      htmlAudioRef.current.muted = nextMuted;
    }

    [ytPlayerRef.current, ytSeranaPlayerRef.current].forEach((p) => {
      if (!p) {
return;
}

      try {
        if (nextMuted) {
          p.mute();
        } else {
          p.unMute();
          p.setVolume(90);
        }
      } catch {
        // Ignore
      }
    });
    setStatus((prev) => ({ ...prev, muted: nextMuted }));
  }, []);

  const setCustomAudioFile = useCallback((file: File, startAt100s = false) => {
    if (customObjectUrlRef.current) {
      URL.revokeObjectURL(customObjectUrlRef.current);
    }

    const url = URL.createObjectURL(file);
    customObjectUrlRef.current = url;

    const audio = new Audio(url);
    audio.preload = "auto";
    htmlAudioRef.current = audio;
    customFileStartSecRef.current = startAt100s ? AUDIO_SEGMENT.startSeconds : 0;
    modeRef.current = "custom-file";

    setStatus((prev) => ({
      ...prev,
      mode: "custom-file",
      ready: true,
      autoplayBlocked: false,
      error: null,
      customFileName: file.name,
    }));
  }, []);

  const useYoutubeMode = useCallback(() => {
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
    }

    modeRef.current = "youtube";
    setStatus((prev) => ({
      ...prev,
      mode: "youtube",
      customFileName: null,
      error: null,
    }));
  }, []);

  const getPrecisePlaybackMs = useCallback((): number | null => {
    if (
      activeActRef.current === "sadrah" &&
      modeRef.current === "custom-file" &&
      htmlAudioRef.current &&
      !htmlAudioRef.current.paused
    ) {
      const elapsed =
        (htmlAudioRef.current.currentTime - customFileStartSecRef.current) *
        1000;

      if (Number.isFinite(elapsed) && elapsed >= 0) {
        return elapsed;
      }
    }

    if (
      activeActRef.current === "sadrah" &&
      modeRef.current === "youtube" &&
      ytPlayerRef.current &&
      yt1ExpectPlayingRef.current &&
      !ytErrorRef.current &&
      !ytAutoplayBlockedRef.current
    ) {
      try {
        const player = ytPlayerRef.current;
        const playerState = player.getPlayerState();
        const rawTime = player.getCurrentTime();

        if (
          yt1IsPlayingRef.current &&
          playerState === 1 &&
          Number.isFinite(rawTime) &&
          rawTime >= AUDIO_SEGMENT.startSeconds - 0.8
        ) {
          const now = performance.now();

          if (Math.abs(rawTime - yt1SampleTimeRef.current) > 0.01) {
            yt1SampleTimeRef.current = rawTime;
            yt1SamplePerfRef.current = now;
          }

          const interpolatedSec =
            yt1SampleTimeRef.current +
            Math.min(0.32, (now - yt1SamplePerfRef.current) / 1000);

          return Math.max(
            0,
            (interpolatedSec - AUDIO_SEGMENT.startSeconds) * 1000
          );
        }

        return -1;
      } catch {
        return null;
      }
    }

    if (
      activeActRef.current === "serana" &&
      ytSeranaPlayerRef.current &&
      yt2ExpectPlayingRef.current &&
      !ytAutoplayBlockedRef.current
    ) {
      try {
        const player = ytSeranaPlayerRef.current;
        const playerState = player.getPlayerState();
        const rawTime = player.getCurrentTime();

        if (
          yt2IsPlayingRef.current &&
          playerState === 1 &&
          Number.isFinite(rawTime) &&
          rawTime >= SERANA_AUDIO_SEGMENT.startSeconds - 1.8
        ) {
          const now = performance.now();

          if (Math.abs(rawTime - yt2SampleTimeRef.current) > 0.01) {
            yt2SampleTimeRef.current = rawTime;
            yt2SamplePerfRef.current = now;
          }

          const interpolatedSec =
            yt2SampleTimeRef.current +
            Math.min(0.32, (now - yt2SamplePerfRef.current) / 1000);

          return Math.max(
            0,
            (interpolatedSec - SERANA_AUDIO_SEGMENT.startSeconds) * 1000
          );
        }

        return -1;
      } catch {
        return null;
      }
    }

    return null;
  }, []);

  const syncAudioWithAi = useCallback(
    async (
      file?: File,
      referenceLyrics?: string,
      sliceFullSong = false
    ): Promise<AiSyncLyricsResponse> => {
      let processedFile = file;

      if (file && sliceFullSong) {
        processedFile = await sliceAudioWindowToWav(
          file,
          AUDIO_SEGMENT.startSeconds,
          AUDIO_SEGMENT.endSeconds
        );
      }

      const fd = new FormData();

      if (processedFile) {
        fd.append("file", processedFile);
      } else {
        fd.append("useLocalFile", "true");
        fd.append("saveCache", "true");
      }

      if (referenceLyrics?.trim()) {
        fd.append("referenceLyrics", referenceLyrics.trim());
      }

      const res = await fetch("/api/ai/sync-lyrics", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as AiSyncLyricsResponse & {
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Gagal menyinkronkan audio dengan AI.");
      }

      if (processedFile) {
        setCustomAudioFile(processedFile, false);
      }

      if (data.provider === "gemini-audio" && data.cues.length > 0) {
        onSyncedLyricsRef.current?.(data.cues, data.durationMs);
      }

      return data;
    },
    [setCustomAudioFile]
  );

  return {
    status,
    prepareAudio,
    playSegment,
    crossfadeToAct2,
    playAct2,
    unlockAndSync,
    stopSegment,
    toggleMute,
    setCustomAudioFile,
    useYoutubeMode,
    getPrecisePlaybackMs,
    syncAudioWithAi,
  };
}
