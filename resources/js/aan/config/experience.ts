import type { ExperiencePalette, LyricCue } from "@/aan/types/experience";

export const EXPERIENCE_TIMING = {
  countdownStepMs: 1250,
  countdownSteps: [1, 2, 3] as const,
  fireworksDurationMs: 5_000,
  botanicalDurationMs: 44_000,
  seranaDurationMs: 156_000, // 1:29 -> 4:05 (2m 36s)
} as const;

export const AUDIO_SEGMENT = {
  youtubeVideoId: "FQT69jQp1ho",
  youtubeUrl: "https://youtu.be/FQT69jQp1ho?list=RDFQT69jQp1ho",
  startSeconds: 199, // 3:19
  endSeconds: 243, // 4:03
  durationMs: 44_000,
  /**
   * Optional local asset path. If placed in public/audio/for-revenge-segment.mp3,
   * the controller can use it directly for sample-accurate Web Audio fade & sync.
   */
  optionalLocalPath: "/audio/for-revenge-segment.mp3",
} as const;

export const SERANA_AUDIO_SEGMENT = {
  youtubeVideoId: "bGsMkd8qHWI",
  youtubeUrl: "https://youtu.be/bGsMkd8qHWI?list=RDEMJnfsU9QSRM8X2poWqGYPnQ",
  startSeconds: 89, // 1:29
  endSeconds: 245, // 4:05
  durationMs: 156_000,
} as const;

export const LYRIC_CUES: readonly LyricCue[] = [
  {
    id: 1,
    text: "Sudahlah",
    startMs: 0, // 3:19
    endMs: 3_000, // 3:22
    stanza: 1,
  },
  {
    id: 2,
    text: "Kali ini aku kalah",
    startMs: 3_000, // 3:22
    endMs: 8_000, // 3:27
    stanza: 1,
  },
  {
    id: 3,
    text: "Kehilangan mahkota",
    startMs: 8_000, // 3:27
    endMs: 13_000, // 3:32
    stanza: 1,
  },
  {
    id: 4,
    text: "Kau dan dia pemenangnya",
    startMs: 13_000, // 3:32
    endMs: 20_000, // 3:39
    stanza: 1,
  },
  {
    id: 5,
    text: "Sudahlah",
    startMs: 20_000, // 3:39
    endMs: 23_000, // 3:42
    stanza: 2,
  },
  {
    id: 6,
    text: "Kali ini ku berserah",
    startMs: 23_000, // 3:42
    endMs: 28_000, // 3:47
    stanza: 2,
  },
  {
    id: 7,
    text: "Kehilangan segalanya",
    startMs: 28_000, // 3:47
    endMs: 33_000, // 3:52
    stanza: 2,
  },
  {
    id: 8,
    text: "Kau dan dia pemenangnya",
    startMs: 33_000, // 3:52
    endMs: 37_000, // 3:56
    stanza: 2,
  },
  {
    id: 9,
    text: "Sepatutnya kau rayakan",
    startMs: 37_000, // 3:56
    endMs: 44_000, // 4:03
    stanza: 2,
  },
] as const;

export const SERANA_LYRIC_CUES: readonly LyricCue[] = [
  {
    id: 101,
    text: "Beri tahu aku cara melupakanmu",
    startMs: 0, // 1:29
    endMs: 6_000, // 1:35
    stanza: 1,
  },
  {
    id: 102,
    text: "Seperti kau ajarkanku dewasa",
    startMs: 6_000, // 1:35
    endMs: 14_000, // 1:43
    stanza: 1,
  },
  {
    id: 103,
    text: "Beri tahu aku cara merelakanmu",
    startMs: 14_000, // 1:43
    endMs: 21_000, // 1:50
    stanza: 1,
  },
  {
    id: 104,
    text: "Seperti kau ajarkanku bahagia",
    startMs: 21_000, // 1:50
    endMs: 32_000, // 2:01
    stanza: 1,
  },
  // 2:01 - 2:25: Isi hati yang sebenarnya (32_000 - 56_000), mulai menghilang 2:26 - 2:27 (56_000 - 58_000)
  {
    id: 105,
    text: "Terima kasih pernah menjadi rumah, meski akhirnya aku harus belajar pulang sendirian.",
    startMs: 32_000, // 2:01
    endMs: 40_000, // 2:09
    stanza: 1,
    kind: "heart",
  },
  {
    id: 106,
    text: "Bukan karena aku berhenti mencintai, tapi karena aku sadar tidak semua yang kuperjuangkan harus kumiliki.",
    startMs: 40_000, // 2:09
    endMs: 48_000, // 2:17
    stanza: 1,
    kind: "heart",
  },
  {
    id: 107,
    text: "Jika bahagiamu memang bukan bersamaku, biarlah malam ini menjadi saksi bahwa aku merelakanmu dengan utuh.",
    startMs: 48_000, // 2:17
    endMs: 58_000, // 2:27 (memudar menghilang di 2:26-2:27)
    stanza: 1,
    kind: "heart",
  },
  {
    id: 108,
    text: "Biarkan 'ku menepi",
    startMs: 59_000, // 2:28
    endMs: 62_000, // 2:31
    stanza: 2,
  },
  {
    id: 109,
    text: "Jika kau tak 'kan kembali",
    startMs: 62_000, // 2:31
    endMs: 66_000, // 2:35
    stanza: 2,
  },
  {
    id: 110,
    text: "Dan yakinkanku bahwa kau",
    startMs: 66_000, // 2:35
    endMs: 70_000, // 2:39
    stanza: 2,
  },
  {
    id: 111,
    text: "Telah temukan yang kau cari",
    startMs: 70_000, // 2:39
    endMs: 74_000, // 2:43
    stanza: 2,
  },
  {
    id: 112,
    text: "Izinkan 'ku membenci pada sang pengganti",
    startMs: 74_000, // 2:43
    endMs: 81_000, // 2:50
    stanza: 2,
  },
  {
    id: 113,
    text: "Dan yakinkanku bahwa kau",
    startMs: 81_000, // 2:50
    endMs: 84_000, // 2:53
    stanza: 2,
  },
  {
    id: 114,
    text: "Telah temukan yang kau cari",
    startMs: 84_000, // 2:53
    endMs: 88_000, // 2:57
    stanza: 2,
  },
  {
    id: 115,
    text: "Beri tahu aku cara melupakanmu",
    startMs: 88_000, // 2:57
    endMs: 95_000, // 3:04
    stanza: 2,
  },
  {
    id: 116,
    text: "Seperti kau ajarkanku dewasa",
    startMs: 95_000, // 3:04
    endMs: 103_000, // 3:12
    stanza: 2,
  },
  {
    id: 117,
    text: "Beri tahu aku cara merelakanmu",
    startMs: 103_000, // 3:12
    endMs: 110_000, // 3:19
    stanza: 2,
  },
  {
    id: 118,
    text: "Seperti kau ajarkanku bahagia",
    startMs: 110_000, // 3:19
    endMs: 118_000, // 3:27
    stanza: 2,
  },
  {
    id: 119,
    text: "Beri tahu aku cara melupakanmu",
    startMs: 118_000, // 3:27
    endMs: 125_000, // 3:34
    stanza: 2,
  },
  {
    id: 120,
    text: "Seperti kau ajarkanku dewasa",
    startMs: 125_000, // 3:34
    endMs: 133_000, // 3:42
    stanza: 2,
  },
  {
    id: 121,
    text: "Beri tahu aku cara merelakanmu",
    startMs: 133_000, // 3:42
    endMs: 139_000, // 3:48
    stanza: 2,
  },
  {
    id: 122,
    text: "Seperti kau ajarkanku",
    startMs: 139_000, // 3:48
    endMs: 143_000, // 3:52
    stanza: 2,
  },
  {
    id: 123,
    text: "Untuk selalu sempurna",
    startMs: 143_000, // 3:52
    endMs: 156_000, // 4:05
    stanza: 2,
  },
] as const;

export const DEFAULT_LUXURY_PALETTE: ExperiencePalette = {
  accentHex: "#D4AF37",
  petalPrimary: "#C81E37",
  petalSecondary: "#5A0716",
  glowHex: "#F26B7A",
  moodLabel: "Crimson Rose Nocturne",
};

export const AI_MOOD_PRESETS: Record<string, ExperiencePalette> = {
  nocturne: DEFAULT_LUXURY_PALETTE,
  crimson: {
    accentHex: "#D4AF37",
    petalPrimary: "#C95C6B",
    petalSecondary: "#6E2130",
    glowHex: "#F4B6C2",
    moodLabel: "Velvet Crimson",
  },
  ivory: {
    accentHex: "#E5C98B",
    petalPrimary: "#F5EFE6",
    petalSecondary: "#C5B49A",
    glowHex: "#FFF6E5",
    moodLabel: "Ivory Serenity",
  },
};
