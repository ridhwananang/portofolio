import { useEffect, useRef } from "react";
import type { ExperiencePalette } from "@/aan/types/experience";

interface SeranaCelestialStageProps {
  active: boolean;
  progress: number; // 0..1 across Serana
  palette: ExperiencePalette;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  thickness: number;
  alpha: number;
  decay: number;
  color: string;
}

interface MeteorSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

// Smooth parametric Love / Heart constellation coordinates (0..1)
const HEART_POINT_COUNT = 28;
const HEART_NODES: ReadonlyArray<{ x: number; y: number; major?: boolean; hasStar?: boolean }> =
  Array.from({ length: HEART_POINT_COUNT }, (_, idx) => {
    const t = (idx / HEART_POINT_COUNT) * Math.PI * 2;
    const rawX = 16 * Math.pow(Math.sin(t), 3);
    const rawY = -(
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t)
    );
    // Normalize into [0..1] box (rawX in [-16..16], rawY in [-12..17])
    const x = (rawX + 16) / 32;
    const y = (rawY + 12.5) / 29.5;
    // Key anchor stars at cleft (0), lobe crests (4, 24), side curves (9, 19), and bottom tip (14)
    const majorIndices = new Set([0, 4, 14, 24]);
    const hasStar = idx % 2 === 0 || majorIndices.has(idx);

    return { x, y, major: majorIndices.has(idx), hasStar };
  });

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export function SeranaCelestialStage({
  active,
  progress,
  palette,
}: SeranaCelestialStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressRef = useRef(progress);
  const paletteRef = useRef(palette);

  useEffect(() => {
    progressRef.current = progress;
    paletteRef.current = palette;
  }, [progress, palette]);

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

    // Pre-rendered textured Moon offscreen canvas
    const moonSize = 240;
    const moonCanvas = document.createElement("canvas");
    moonCanvas.width = moonSize;
    moonCanvas.height = moonSize;
    const mCtx = moonCanvas.getContext("2d")!;

    const buildMoonSprite = () => {
      const cx = moonSize / 2;
      const cy = moonSize / 2;
      const r = moonSize * 0.34;
      mCtx.clearRect(0, 0, moonSize, moonSize);

      // Soft outer lunar atmospheric aura
      const aura = mCtx.createRadialGradient(cx, cy, r * 0.85, cx, cy, moonSize * 0.5);
      aura.addColorStop(0, "rgba(255, 244, 218, 0.34)");
      aura.addColorStop(0.45, "rgba(186, 210, 255, 0.14)");
      aura.addColorStop(1, "rgba(0, 0, 0, 0)");
      mCtx.fillStyle = aura;
      mCtx.beginPath();
      mCtx.arc(cx, cy, moonSize * 0.5, 0, Math.PI * 2);
      mCtx.fill();

      // Lunar disc body
      mCtx.save();
      mCtx.beginPath();
      mCtx.arc(cx, cy, r, 0, Math.PI * 2);
      mCtx.clip();

      const discGrad = mCtx.createRadialGradient(
        cx - r * 0.28,
        cy - r * 0.28,
        r * 0.1,
        cx,
        cy,
        r * 1.1
      );
      discGrad.addColorStop(0, "#FFFDF7");
      discGrad.addColorStop(0.55, "#EAE4D3");
      discGrad.addColorStop(0.88, "#C6CEDF");
      discGrad.addColorStop(1, "#9BA6C0");
      mCtx.fillStyle = discGrad;
      mCtx.fillRect(cx - r, cy - r, r * 2, r * 2);

      // Subtle lunar maria / crater shading
      const craters = [
        { x: -0.22, y: -0.15, rad: 0.26, a: 0.08 },
        { x: 0.25, y: 0.1, rad: 0.32, a: 0.07 },
        { x: -0.05, y: 0.32, rad: 0.22, a: 0.06 },
        { x: -0.38, y: 0.18, rad: 0.14, a: 0.06 },
        { x: 0.18, y: -0.3, rad: 0.18, a: 0.05 },
      ];

      for (const cr of craters) {
        const g = mCtx.createRadialGradient(
          cx + cr.x * r,
          cy + cr.y * r,
          0,
          cx + cr.x * r,
          cy + cr.y * r,
          cr.rad * r
        );
        g.addColorStop(0, `rgba(72, 82, 108, ${cr.a})`);
        g.addColorStop(1, "rgba(72, 82, 108, 0)");
        mCtx.fillStyle = g;
        mCtx.beginPath();
        mCtx.arc(cx + cr.x * r, cy + cr.y * r, cr.rad * r, 0, Math.PI * 2);
        mCtx.fill();
      }

      mCtx.restore();
    };
    buildMoonSprite();

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

    const meteors: Meteor[] = [];
    const sparks: MeteorSpark[] = [];
    let lastMeteorMs = performance.now();
    let rafId = 0;

    const spawnMeteor = (intense = false) => {
      const fromRight = Math.random() > 0.28;
      const startX = fromRight
        ? width * (0.28 + Math.random() * 0.72)
        : width * (0.05 + Math.random() * 0.55);
      const startY = height * (0.03 + Math.random() * 0.28);
      const angle = fromRight
        ? Math.PI * (0.74 + Math.random() * 0.12)
        : Math.PI * (0.14 + Math.random() * 0.12);
      const speed = (intense ? 11 : 8.5) + Math.random() * 5.5;
      const colors = [
        "#FFF8E7",
        "#DCEBFF",
        paletteRef.current.accentHex,
        "#BBE0FF",
      ];

      meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: (intense ? 130 : 95) + Math.random() * 85,
        thickness: intense ? 2.1 : 1.5,
        alpha: 0.96,
        decay: 0.014 + Math.random() * 0.01,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    const startPerf = performance.now();

    const render = (now: number) => {
      const p = progressRef.current;
      const tSec = (now - startPerf) / 1000;

      ctx.clearRect(0, 0, width, height);

      // 1. Rising Silver-Champagne Moon
      const moonRise = clamp01(p / 0.28);
      const moonEase = 1 - Math.pow(1 - moonRise, 3);
      const moonX = width * (width < 640 ? 0.74 : 0.76);
      const moonY = height * (0.76 - moonEase * 0.52);
      const drawMoonSize = Math.min(width, height) * (width < 640 ? 0.28 : 0.24);

      ctx.save();
      ctx.globalAlpha = clamp01(p * 8);
      ctx.drawImage(
        moonCanvas,
        moonX - drawMoonSize / 2,
        moonY - drawMoonSize / 2,
        drawMoonSize,
        drawMoonSize
      );
      ctx.restore();

      // 2. Luminous Love / Heart Constellation in the Upper Left/Center Milky Way Sky
      const constAppear = clamp01((p - 0.06) / 0.18);
      const constAlpha = constAppear;

      if (constAlpha > 0.01) {
        const boxW = Math.min(width * 0.44, 340);
        const boxH = boxW * 0.92;
        const originX = width * (width < 640 ? 0.5 : 0.43) - boxW / 2;
        const originY = height * 0.17;

        const pts = HEART_NODES.map((n) => ({
          x: originX + n.x * boxW,
          y: originY + n.y * boxH,
          major: n.major,
          hasStar: n.hasStar,
        }));

        // Trace curved constellation outline progressively around the heart loop
        const edgeProgress = clamp01((p - 0.06) / 0.2);
        const totalSegments = pts.length;
        const visibleSegs = edgeProgress * totalSegments;

        ctx.save();
        // Soft outer luminous aura behind the heart thread
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 0; i < totalSegments; i++) {
          const segRatio = clamp01(visibleSegs - i);

          if (segRatio <= 0) {
continue;
}

          const a = pts[i];
          const b = pts[(i + 1) % totalSegments];
          const ex = a.x + (b.x - a.x) * segRatio;
          const ey = a.y + (b.y - a.y) * segRatio;

          const shimmer = 0.74 + 0.26 * Math.sin(tSec * 1.45 + i * 0.35);
          ctx.strokeStyle = i % 2 === 0 ? paletteRef.current.accentHex : "#F3CFD6";
          ctx.globalAlpha = constAlpha * 0.46 * shimmer;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        }

        // Draw twinkling heart star vertices
        pts.forEach((pt, idx) => {
          if (!pt.hasStar) {
return;
}

          const nodeAlpha = clamp01(visibleSegs - idx * 0.85) * constAlpha;

          if (nodeAlpha <= 0.01) {
return;
}

          const pulse = 0.72 + 0.28 * Math.sin(tSec * 2.2 + idx * 0.65);
          const r = pt.major ? 2.8 : 1.65;

          ctx.globalAlpha = nodeAlpha * pulse;
          ctx.fillStyle = pt.major ? "#FFF6E3" : "#F6DDE3";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
          ctx.fill();

          if (pt.major) {
            const spike = r * 4.4 * pulse;
            ctx.strokeStyle = paletteRef.current.accentHex;
            ctx.globalAlpha = nodeAlpha * 0.58 * pulse;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(pt.x - spike, pt.y);
            ctx.lineTo(pt.x + spike, pt.y);
            ctx.moveTo(pt.x, pt.y - spike);
            ctx.lineTo(pt.x, pt.y + spike);
            ctx.stroke();
          }
        });
        ctx.restore();
      }

      // 3. Meteor Shower Cadence (calm -> intense during choruses -> calm ambient meteors)
      const inChorusShower =
        (p >= 0.14 && p <= 0.36) || (p >= 0.52 && p <= 0.9);
      const canSpawnMeteor = p >= 0.03;
      const interval = inChorusShower ? 420 : 1250;

      if (canSpawnMeteor && now - lastMeteorMs >= interval) {
        spawnMeteor(inChorusShower);

        if (inChorusShower && Math.random() > 0.55) {
          spawnMeteor(true);
        }

        lastMeteorMs = now;
      }

      // Update meteors & trailing stardust
      ctx.save();

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.alpha -= m.decay;

        if (m.alpha <= 0.02 || m.y > height * 0.85) {
          meteors.splice(i, 1);
          continue;
        }

        const speedLen = Math.hypot(m.vx, m.vy) || 1;
        const tailX = m.x - (m.vx / speedLen) * m.length;
        const tailY = m.y - (m.vy / speedLen) * m.length;

        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 250, 238, ${m.alpha})`);
        grad.addColorStop(0.28, m.color);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.globalAlpha = m.alpha;
        ctx.strokeStyle = grad;
        ctx.lineWidth = m.thickness;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Bright meteor head
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.thickness * 1.15, 0, Math.PI * 2);
        ctx.fill();

        // Spawn tiny trailing stardust sparks
        if (Math.random() > 0.45 && sparks.length < 220) {
          sparks.push({
            x: m.x,
            y: m.y,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6 + 0.25,
            alpha: m.alpha * 0.75,
            size: 0.7 + Math.random() * 1.1,
            color: m.color,
          });
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= 0.025;

        if (sp.alpha <= 0.02) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = sp.alpha;
        ctx.fillStyle = sp.color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

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

  return (
    <div className="pointer-events-none fixed inset-0 z-[12] transition-opacity duration-200">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
