import { useEffect, useRef } from "react";
import type { ExperiencePalette } from "@/aan/types/experience";
import {
  playFireworkBurst,
  playFireworkLaunch,
  setFireworksVolume,
} from "@/aan/utils/soundEffects";

interface FireworksCanvasProps {
  active: boolean;
  mode: "feature" | "background";
  progress: number; // 0..1 within current phase
  remainingMs: number;
  palette: ExperiencePalette;
}

interface Shell {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  color: string;
  secondaryColor: string;
  trail: Array<{ x: number; y: number }>;
  pattern: "chrysanthemum" | "willow" | "ring" | "double-peony";
  isBackground: boolean;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  size: number;
  color: string;
  gravity: number;
  drag: number;
  twinkle: boolean;
}

interface BurstFlash {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  color: string;
}

export function FireworksCanvas({
  active,
  mode,
  progress,
  remainingMs,
  palette,
}: FireworksCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modeRef = useRef(mode);
  const progressRef = useRef(progress);
  const remainingRef = useRef(remainingMs);
  const paletteRef = useRef(palette);

  useEffect(() => {
    modeRef.current = mode;
    progressRef.current = progress;
    remainingRef.current = remainingMs;
    paletteRef.current = palette;
  }, [mode, progress, remainingMs, palette]);

  // Smoothly modulate fireworks SFX gain across feature -> background -> 3s fade-out
  useEffect(() => {
    if (!active) {
      setFireworksVolume(0);

      return;
    }

    if (mode === "feature") {
      // Soften fireworks SFX smoothly near the end of the 5s overture (progress 0.68 -> 1.0)
      if (progress < 0.68) {
        setFireworksVolume(1);
      } else {
        const ramp = (progress - 0.68) / 0.32;
        setFireworksVolume(1 - ramp * 0.84); // 1.0 -> 0.16
      }

      return;
    }

    // Background mode during the rose & song phase: stay quiet (0.14), fade to 0 in last 3s
    if (remainingMs <= 3_000) {
      const fade = Math.max(0, remainingMs / 3_000);
      setFireworksVolume(0.14 * fade);
    } else {
      setFireworksVolume(0.14);
    }
  }, [active, mode, progress, remainingMs]);

  useEffect(() => {
    if (!active) {
return;
}

    const canvas = canvasRef.current;

    if (!canvas) {
return;
}

    const ctx = canvas.getContext("2d", { alpha: true });

    if (!ctx) {
return;
}

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const shells: Shell[] = [];
    const sparks: Spark[] = [];
    const flashes: BurstFlash[] = [];
    const maxSparks = 2800;

    const getPaletteColors = () => {
      const p = paletteRef.current;

      return [
        p.accentHex,
        p.glowHex,
        "#FFF8E7",
        p.petalPrimary,
        "#F7C97E",
        p.petalSecondary,
        "#B9D6FF",
      ];
    };

    const spawnShell = (isFinale = false, laneBias?: number) => {
      const isBg = modeRef.current === "background";
      const colors = getPaletteColors();
      const color = colors[Math.floor(Math.random() * colors.length)];
      const secondaryColor =
        colors[Math.floor(Math.random() * colors.length)];

      // In background mode, frame the sides & upper sky around the central rose bush
      let startX: number;

      if (laneBias !== undefined) {
        startX = width * laneBias + (Math.random() - 0.5) * width * 0.12;
      } else if (isBg) {
        const leftSide = Math.random() > 0.5;
        startX = leftSide
          ? width * (0.08 + Math.random() * 0.28)
          : width * (0.64 + Math.random() * 0.28);
      } else {
        startX = width * (0.1 + Math.random() * 0.8);
      }

      const targetY =
        height *
        (isBg
          ? 0.12 + Math.random() * 0.3
          : isFinale
            ? 0.13 + Math.random() * 0.34
            : 0.16 + Math.random() * 0.36);

      const travelDist = height - targetY;
      const speed =
        Math.sqrt(2 * 0.28 * travelDist) * (0.98 + Math.random() * 0.08);
      const patterns: Shell["pattern"][] = [
        "chrysanthemum",
        "willow",
        "ring",
        "double-peony",
      ];
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];

      playFireworkLaunch((startX / Math.max(1, width)) * 2 - 1);

      shells.push({
        x: startX,
        y: height + 10,
        vx: (Math.random() - 0.5) * (isBg ? 1.8 : 2.6),
        vy: -speed,
        targetY,
        color,
        secondaryColor,
        trail: [],
        pattern,
        isBackground: isBg,
      });
    };

    const pushSpark = (spark: Spark) => {
      if (sparks.length >= maxSparks) {
        sparks.shift();
      }

      sparks.push(spark);
    };

    const burstShell = (shell: Shell) => {
      playFireworkBurst(
        shell.pattern,
        (shell.x / Math.max(1, width)) * 2 - 1
      );

      const bgScale = shell.isBackground ? 0.68 : 1;
      flashes.push({
        x: shell.x,
        y: shell.y,
        radius: (shell.pattern === "double-peony" ? 95 : 70) * bgScale,
        alpha: shell.isBackground ? 0.22 : 0.36,
        color: shell.color,
      });

      const baseCount =
        shell.pattern === "ring"
          ? 84
          : shell.pattern === "willow"
            ? 105
            : shell.pattern === "double-peony"
              ? 130
              : 120;
      const count = Math.round(baseCount * (shell.isBackground ? 0.65 : 1));

      for (let i = 0; i < count; i++) {
        const isInnerCore =
          shell.pattern === "double-peony" && i >= Math.floor(count * 0.65);
        const angle =
          shell.pattern === "ring"
            ? (Math.PI * 2 * i) / count
            : Math.random() * Math.PI * 2;
        const speed =
          (shell.pattern === "ring"
            ? 4.8 + Math.random() * 0.7
            : isInnerCore
              ? 1.4 + Math.random() * 1.9
              : shell.pattern === "willow"
                ? 1.8 + Math.random() * 4.8
                : 2.0 + Math.random() * 6.0) * (shell.isBackground ? 0.78 : 1);

        pushSpark({
          x: shell.x,
          y: shell.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: shell.isBackground ? 0.8 : 1,
          decay:
            shell.pattern === "willow"
              ? 0.012 + Math.random() * 0.008
              : 0.017 + Math.random() * 0.012,
          size:
            (shell.pattern === "willow"
              ? 2.2
              : isInnerCore
                ? 2.4
                : 1.7 + Math.random() * 1.6) * (shell.isBackground ? 0.84 : 1),
          color:
            isInnerCore || i % 4 === 0 ? shell.secondaryColor : shell.color,
          gravity: shell.pattern === "willow" ? 0.062 : 0.085,
          drag: shell.pattern === "willow" ? 0.966 : 0.974,
          twinkle: Math.random() > 0.38,
        });
      }
    };

    // Immediate opening salvo when starting in feature mode
    if (modeRef.current === "feature") {
      spawnShell(false, 0.22);
      spawnShell(false, 0.5);
      spawnShell(false, 0.78);
    }

    let lastSpawn = performance.now();
    let rafId = 0;

    const render = (now: number) => {
      const currentProgress = progressRef.current;
      const isBg = modeRef.current === "background";
      const remMs = remainingRef.current;

      // Fade existing fireworks trails to transparent so Milky Way sky shows through
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle =
        isBg && remMs <= 3_000
          ? "rgba(0, 0, 0, 0.26)"
          : "rgba(0, 0, 0, 0.17)";
      ctx.fillRect(0, 0, width, height);

      // Determine launch cadence
      let canLaunch = true;
      let spawnInterval = 230;
      let inFinale = false;

      if (!isBg) {
        inFinale = currentProgress >= 0.42 && currentProgress <= 0.78;
        // Ease launch rate slightly near end of feature phase as we enter botanical
        spawnInterval = inFinale ? 155 : currentProgress > 0.8 ? 360 : 230;
      } else {
        // Background mode: gentle poetic bursts, stop launching 3.4s before audio ends
        canLaunch = remMs > 3_400;
        spawnInterval = 620;
      }

      if (canLaunch && now - lastSpawn >= spawnInterval) {
        spawnShell(inFinale);

        if (!isBg && (inFinale || Math.random() > 0.35)) {
          spawnShell(inFinale);
        }

        if (!isBg && inFinale && Math.random() > 0.5) {
          spawnShell(true);
        }

        lastSpawn = now;
      }

      ctx.globalCompositeOperation = "lighter";

      // Soft radial burst illumination halos
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        const grad = ctx.createRadialGradient(
          f.x,
          f.y,
          0,
          f.x,
          f.y,
          f.radius
        );
        grad.addColorStop(0, f.color);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = f.alpha;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
        f.alpha -= 0.032;

        if (f.alpha <= 0.01) {
          flashes.splice(i, 1);
        }
      }

      // Ascending shells
      for (let i = shells.length - 1; i >= 0; i--) {
        const s = shells[i];
        s.trail.push({ x: s.x, y: s.y });

        if (s.trail.length > 9) {
s.trail.shift();
}

        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.28;

        for (let t = 0; t < s.trail.length; t++) {
          const pt = s.trail[t];
          const ratio = (t + 1) / s.trail.length;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.5 * ratio, 0, Math.PI * 2);
          ctx.fillStyle = s.color;
          ctx.globalAlpha = ratio * (s.isBackground ? 0.48 : 0.75);
          ctx.fill();
        }

        ctx.globalAlpha = s.isBackground ? 0.72 : 1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.isBackground ? 1.8 : 2.4, 0, Math.PI * 2);
        ctx.fillStyle = "#FFF8E7";
        ctx.fill();

        if (s.vy >= -0.8 || s.y <= s.targetY) {
          burstShell(s);
          shells.splice(i, 1);
        }
      }

      // Expanding sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.vx *= sp.drag;
        sp.vy *= sp.drag;
        sp.vy += sp.gravity;
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= sp.decay;

        if (sp.alpha <= 0.02) {
          sparks.splice(i, 1);
          continue;
        }

        const flicker = sp.twinkle ? 0.6 + Math.random() * 0.4 : 1;
        ctx.globalAlpha = Math.max(0, sp.alpha * flicker);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  if (!active) {
return null;
}

  const endFadeOpacity =
    mode === "background" && remainingMs <= 3_000
      ? Math.max(0, remainingMs / 3_000)
      : 1;
  const visualOpacity =
    mode === "background" ? 0.78 * endFadeOpacity : 1;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[15] transition-opacity duration-150"
      style={{ opacity: visualOpacity }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
