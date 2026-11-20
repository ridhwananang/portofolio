import { useEffect, useRef } from "react";
import type { ExperiencePalette } from "@/aan/types/experience";

interface FallingLeavesCanvasProps {
  active: boolean;
  sheddingIntensity: number; // 0..1
  palette: ExperiencePalette;
}

interface FallingLeaf {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  swayPhase: number;
  swayFreq: number;
  alpha: number;
  color: string;
}

export function FallingLeavesCanvas({
  active,
  sheddingIntensity,
  palette,
}: FallingLeavesCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intensityRef = useRef(sheddingIntensity);
  const paletteRef = useRef(palette);

  useEffect(() => {
    intensityRef.current = sheddingIntensity;
    paletteRef.current = palette;
  }, [sheddingIntensity, palette]);

  useEffect(() => {
    if (!active) {
return;
}

    const canvas = canvasRef.current;

    if (!canvas) {
return;
}

    const ctx = canvas.getContext("2d");

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

    const leaves: FallingLeaf[] = [];
    let lastSpawn = 0;
    let rafId = 0;

    const spawnLeaf = () => {
      const p = paletteRef.current;
      const colors = [
        p.petalPrimary,
        p.accentHex,
        p.petalSecondary,
        "#8E6B3A",
        "#B98E4A",
      ];
      const canopyCenterX = width * 0.5;
      const canopySpread = Math.min(width * 0.34, 240);
      leaves.push({
        x: canopyCenterX + (Math.random() - 0.5) * canopySpread * 2,
        y: height * (0.22 + Math.random() * 0.25),
        vx: -0.25 + Math.random() * 0.85,
        vy: 0.75 + Math.random() * 1.15,
        size: 6 + Math.random() * 7,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.045,
        swayPhase: Math.random() * Math.PI * 2,
        swayFreq: 0.022 + Math.random() * 0.02,
        alpha: 0.88,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    const drawLeafShape = (leaf: FallingLeaf) => {
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.rotation);
      const scaleX = 0.65 + 0.35 * Math.cos(leaf.swayPhase * 1.3);
      ctx.scale(scaleX, 1);
      ctx.globalAlpha = Math.max(0, leaf.alpha);

      ctx.beginPath();
      ctx.moveTo(0, -leaf.size);
      ctx.bezierCurveTo(
        leaf.size * 0.72,
        -leaf.size * 0.35,
        leaf.size * 0.65,
        leaf.size * 0.55,
        0,
        leaf.size
      );
      ctx.bezierCurveTo(
        -leaf.size * 0.65,
        leaf.size * 0.55,
        -leaf.size * 0.72,
        -leaf.size * 0.35,
        0,
        -leaf.size
      );
      ctx.fillStyle = leaf.color;
      ctx.fill();

      // Delicate midrib vein
      ctx.beginPath();
      ctx.moveTo(0, -leaf.size * 0.75);
      ctx.lineTo(0, leaf.size * 0.8);
      ctx.strokeStyle = "rgba(255, 248, 230, 0.28)";
      ctx.lineWidth = 0.7;
      ctx.stroke();

      ctx.restore();
    };

    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      const intensity = intensityRef.current;

      if (intensity > 0.02) {
        const spawnEveryMs = Math.max(75, 260 - intensity * 175);

        if (now - lastSpawn >= spawnEveryMs && leaves.length < 95) {
          spawnLeaf();

          if (intensity > 0.55 && Math.random() > 0.45) {
            spawnLeaf();
          }

          lastSpawn = now;
        }
      }

      for (let i = leaves.length - 1; i >= 0; i--) {
        const leaf = leaves[i];
        leaf.swayPhase += leaf.swayFreq;
        leaf.x += leaf.vx + Math.sin(leaf.swayPhase) * 0.85;
        leaf.y += leaf.vy;
        leaf.rotation += leaf.rotSpeed;

        if (leaf.y > height * 0.76) {
          leaf.alpha -= 0.015;
        }

        if (leaf.alpha <= 0.02 || leaf.y > height + 30) {
          leaves.splice(i, 1);
          continue;
        }

        drawLeafShape(leaf);
      }

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
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-30"
    />
  );
}
