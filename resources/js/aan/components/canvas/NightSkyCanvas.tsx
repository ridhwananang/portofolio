import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
  isHero: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  decay: number;
}

export function NightSkyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
return;
}

    const ctx = canvas.getContext("2d", { alpha: false });

    if (!ctx) {
return;
}

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Offscreen static backdrop (deep night gradient + Milky Way nebula)
    const backdropCanvas = document.createElement("canvas");
    const backdropCtx = backdropCanvas.getContext("2d");

    let stars: Star[] = [];
    const shootingStars: ShootingStar[] = [];

    const buildStaticSky = () => {
      if (!backdropCtx) {
return;
}

      backdropCanvas.width = Math.floor(width * dpr);
      backdropCanvas.height = Math.floor(height * dpr);
      backdropCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 1. Deep midnight-indigo sky gradient
      const skyGrad = backdropCtx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, "#02040d");
      skyGrad.addColorStop(0.45, "#060c1f");
      skyGrad.addColorStop(0.78, "#0b1530");
      skyGrad.addColorStop(1, "#080b14");
      backdropCtx.fillStyle = skyGrad;
      backdropCtx.fillRect(0, 0, width, height);

      // 2. Milky Way diagonal cosmic band (soft volumetric nebula layers)
      backdropCtx.save();
      backdropCtx.translate(width * 0.52, height * 0.44);
      backdropCtx.rotate(-0.48);

      const bandLength = Math.hypot(width, height) * 1.15;
      const bandWidth = Math.max(width, height) * 0.34;

      const outerGlow = backdropCtx.createRadialGradient(
        0,
        0,
        bandWidth * 0.08,
        0,
        0,
        bandLength * 0.52
      );
      outerGlow.addColorStop(0, "rgba(72, 95, 168, 0.22)");
      outerGlow.addColorStop(0.42, "rgba(44, 58, 122, 0.14)");
      outerGlow.addColorStop(0.75, "rgba(25, 32, 74, 0.05)");
      outerGlow.addColorStop(1, "rgba(6, 10, 26, 0)");

      backdropCtx.save();
      backdropCtx.scale(1.6, 0.45);
      backdropCtx.fillStyle = outerGlow;
      backdropCtx.beginPath();
      backdropCtx.arc(0, 0, bandLength * 0.48, 0, Math.PI * 2);
      backdropCtx.fill();
      backdropCtx.restore();

      // Warm cosmic dust pockets along the Milky Way core
      const nebulaPockets = [
        { x: -bandLength * 0.22, y: -12, r: bandWidth * 0.55, c: "rgba(114, 134, 212, 0.13)" },
        { x: 0, y: 8, r: bandWidth * 0.65, c: "rgba(168, 132, 206, 0.1)" },
        { x: bandLength * 0.2, y: -14, r: bandWidth * 0.5, c: "rgba(212, 175, 55, 0.065)" },
        { x: -bandLength * 0.08, y: 18, r: bandWidth * 0.4, c: "rgba(95, 152, 214, 0.11)" },
      ];

      for (const p of nebulaPockets) {
        const g = backdropCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, p.c);
        g.addColorStop(1, "rgba(0,0,0,0)");
        backdropCtx.fillStyle = g;
        backdropCtx.beginPath();
        backdropCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        backdropCtx.fill();
      }

      // Fine Milky Way star-dust speckles concentrated along the diagonal band
      const dustCount = Math.min(950, Math.floor((width * height) / 1400));

      for (let i = 0; i < dustCount; i++) {
        // Gaussian-like spread across band width
        const u = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
        const px = (Math.random() - 0.5) * bandLength * 0.95;
        const py = u * bandWidth * 1.15;
        const r = 0.35 + Math.random() * 0.85;
        const alpha = 0.12 + Math.random() * 0.42;
        backdropCtx.fillStyle =
          i % 7 === 0
            ? `rgba(245, 222, 179, ${alpha})`
            : `rgba(205, 222, 255, ${alpha})`;
        backdropCtx.beginPath();
        backdropCtx.arc(px, py, r, 0, Math.PI * 2);
        backdropCtx.fill();
      }

      backdropCtx.restore();

      // 3. Soft horizon atmospheric glow
      const horizonGlow = backdropCtx.createRadialGradient(
        width * 0.5,
        height * 1.05,
        height * 0.05,
        width * 0.5,
        height * 1.05,
        height * 0.6
      );
      horizonGlow.addColorStop(0, "rgba(212, 175, 55, 0.07)");
      horizonGlow.addColorStop(0.45, "rgba(32, 48, 92, 0.14)");
      horizonGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
      backdropCtx.fillStyle = horizonGlow;
      backdropCtx.fillRect(0, 0, width, height);
    };

    const buildStars = () => {
      const count = Math.min(260, Math.max(120, Math.floor((width * height) / 5500)));
      const starColors = ["#FFFFFF", "#DCE8FF", "#FFF4DC", "#B8D0FF", "#F5DFB0"];
      stars = Array.from({ length: count }, (_, idx) => {
        const isHero = idx % 19 === 0;

        return {
          x: Math.random() * width,
          y: Math.random() * height * 0.9,
          radius: isHero ? 1.5 + Math.random() * 0.8 : 0.45 + Math.random() * 1.05,
          baseAlpha: isHero ? 0.82 : 0.35 + Math.random() * 0.5,
          twinkleSpeed: 0.012 + Math.random() * 0.028,
          twinklePhase: Math.random() * Math.PI * 2,
          color: starColors[idx % starColors.length],
          isHero,
        };
      });
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStaticSky();
      buildStars();
    };

    resize();
    window.addEventListener("resize", resize);

    let lastShootingStar = performance.now();
    let rafId = 0;

    const render = (now: number) => {
      // Blit pre-rendered Milky Way backdrop
      ctx.drawImage(backdropCanvas, 0, 0, width, height);

      // Draw twinkling stars
      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];
        st.twinklePhase += st.twinkleSpeed;
        const alpha =
          st.baseAlpha * (0.62 + 0.38 * Math.sin(st.twinklePhase));

        ctx.globalAlpha = alpha;
        ctx.fillStyle = st.color;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.radius, 0, Math.PI * 2);
        ctx.fill();

        if (st.isHero) {
          // Subtle 4-point diffraction sparkle
          const spike = st.radius * 3.8;
          ctx.strokeStyle = st.color;
          ctx.lineWidth = 0.6;
          ctx.globalAlpha = alpha * 0.48;
          ctx.beginPath();
          ctx.moveTo(st.x - spike, st.y);
          ctx.lineTo(st.x + spike, st.y);
          ctx.moveTo(st.x, st.y - spike);
          ctx.lineTo(st.x, st.y + spike);
          ctx.stroke();
        }
      }

      // Occasional subtle shooting star across the night sky
      if (now - lastShootingStar > 3800 && shootingStars.length < 2) {
        if (Math.random() > 0.35) {
          shootingStars.push({
            x: width * (0.15 + Math.random() * 0.65),
            y: height * (0.06 + Math.random() * 0.28),
            vx: 6.5 + Math.random() * 4,
            vy: 2.6 + Math.random() * 2,
            length: 55 + Math.random() * 45,
            alpha: 0.9,
            decay: 0.022,
          });
        }

        lastShootingStar = now;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;

        if (s.alpha <= 0.02) {
          shootingStars.splice(i, 1);
          continue;
        }

        const grad = ctx.createLinearGradient(
          s.x,
          s.y,
          s.x - s.vx * (s.length / 8),
          s.y - s.vy * (s.length / 8)
        );
        grad.addColorStop(0, `rgba(255, 248, 230, ${s.alpha})`);
        grad.addColorStop(1, "rgba(255, 248, 230, 0)");
        ctx.globalAlpha = 1;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
          s.x - s.vx * (s.length / 8),
          s.y - s.vy * (s.length / 8)
        );
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
