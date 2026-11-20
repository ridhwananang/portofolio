import type { ExperiencePalette } from "@/aan/types/experience";

interface NightTerrainOverlayProps {
  active: boolean;
  showSubterraneanVeil: boolean;
  palette: ExperiencePalette;
}

/**
 * Rolling nocturnal landscape horizon starting from the fireworks phase.
 * Above the crest (~74-76vh), sky/fireworks/rose bush remain completely unobstructed.
 * Below the crest, a semi-transparent dark earth cutaway lets underground 3D roots show softly.
 */
export function NightTerrainOverlay({
  active,
  showSubterraneanVeil,
  palette,
}: NightTerrainOverlayProps) {
  if (!active) {
return null;
}

  return (
    <>
      {/* Back layer (z-10): distant misty nocturnal hill ridge behind fireworks & plant */}
      <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          className="h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="distantHillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0e1730" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#040711" stopOpacity="0.96" />
            </linearGradient>
            <linearGradient id="horizonMistGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1b2b52" stopOpacity="0" />
              <stop offset="55%" stopColor="#162344" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#050812" stopOpacity="0.82" />
            </linearGradient>
          </defs>

          {/* Soft nocturnal valley mist above the distant ridge */}
          <rect
            x="0"
            y="540"
            width="1440"
            height="360"
            fill="url(#horizonMistGrad)"
          />

          {/* Distant rolling ridge */}
          <path
            d="M 0 658 C 210 622, 410 668, 635 648 C 845 628, 1020 612, 1215 642 C 1320 658, 1390 644, 1440 634 L 1440 900 L 0 900 Z"
            fill="url(#distantHillGrad)"
          />
        </svg>
      </div>

      {/* Foreground soil layer (z-25): crest aligns with root collar (~75% height),
          semi-transparent earth below so 3D roots stay visibly translucent underground */}
      <div className="pointer-events-none fixed inset-0 z-[25] overflow-hidden">
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          className="h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="soilCutawayGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="#141824"
                stopOpacity={showSubterraneanVeil ? "0.62" : "0.94"}
              />
              <stop
                offset="32%"
                stopColor="#0c0e16"
                stopOpacity={showSubterraneanVeil ? "0.52" : "0.97"}
              />
              <stop
                offset="100%"
                stopColor="#040509"
                stopOpacity={showSubterraneanVeil ? "0.78" : "0.99"}
              />
            </linearGradient>

            <linearGradient id="crestRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#46587a" stopOpacity="0.28" />
              <stop offset="35%" stopColor="#6f87b0" stopOpacity="0.45" />
              <stop offset="50%" stopColor={palette.accentHex} stopOpacity="0.58" />
              <stop offset="65%" stopColor="#6f87b0" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#46587a" stopOpacity="0.28" />
            </linearGradient>
          </defs>

          {/* Main undulating foreground earth & soil surface */}
          <path
            d="M 0 688 C 165 656, 330 694, 515 680 C 625 671, 682 674, 720 675 C 765 676, 835 668, 965 682 C 1135 700, 1285 658, 1440 676 L 1440 900 L 0 900 Z"
            fill="url(#soilCutawayGrad)"
          />

          {/* Moonlit organic ridge highlight */}
          <path
            d="M 0 688 C 165 656, 330 694, 515 680 C 625 671, 682 674, 720 675 C 765 676, 835 668, 965 682 C 1135 700, 1285 658, 1440 676"
            fill="none"
            stroke="url(#crestRimGrad)"
            strokeWidth="2.2"
          />

          {/* Subtle grassy/mossy tufts along the foreground hill crest */}
          <g fill="#1c2c24" opacity="0.72">
            <path d="M 190 672 L 195 658 L 201 671 L 207 660 L 212 672 Z" />
            <path d="M 425 684 L 429 671 L 434 683 L 439 673 L 444 684 Z" />
            <path d="M 665 674 L 669 661 L 674 673 L 679 663 L 683 674 Z" />
            <path d="M 758 675 L 762 662 L 767 674 L 772 664 L 776 675 Z" />
            <path d="M 1015 686 L 1020 672 L 1025 685 L 1031 675 L 1036 686 Z" />
            <path d="M 1275 668 L 1280 655 L 1285 667 L 1291 657 L 1296 668 Z" />
          </g>
        </svg>
      </div>
    </>
  );
}
