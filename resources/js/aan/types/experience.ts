export type ExperiencePhase =
  | "idle"
  | "countdown"
  | "fireworks"
  | "botanical"
  | "stillness"
  | "serana"
  | "epilogue";

export type AudioSourceMode = "youtube" | "custom-file" | "silent";

export type BotanicalStageName =
  | "roots"
  | "stem"
  | "bloom"
  | "shedding";

export interface LyricCue {
  id: number;
  text: string;
  startMs: number;
  endMs: number;
  stanza: 1 | 2;
  kind?: "lyric" | "heart";
}

export interface ExperiencePalette {
  accentHex: string;
  petalPrimary: string;
  petalSecondary: string;
  glowHex: string;
  moodLabel: string;
}

export interface AiReflectionRequest {
  story: string;
  recipient?: string;
  tone: "puitis" | "elegan" | "tegar";
}

export interface AiReflectionResponse {
  title: string;
  verse: string;
  closingNote: string;
  palette: ExperiencePalette;
  provider: "gemini" | "local-synthesis";
}

export interface AiSyncLyricsResponse {
  cues: LyricCue[];
  durationMs: number;
  provider: "gemini-audio" | "needs-api-key";
  note?: string;
}

export interface AudioStatusResponse {
  available: boolean;
  localUrl?: string;
  fileName?: string;
  cachedCues?: LyricCue[];
  cachedDurationMs?: number;
  geminiConfigured?: boolean;
}

export interface AudioStatus {
  mode: AudioSourceMode;
  ready: boolean;
  playing: boolean;
  muted: boolean;
  autoplayBlocked: boolean;
  error: string | null;
  customFileName: string | null;
}
