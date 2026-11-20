import * as THREE from "three";

export function createLeafTextureSet() {
  const size = 256;
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext("2d")!;

  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext("2d")!;

  // Vivid glossy rose-leaf emerald gradient so leaves remain legible under night lighting
  const grad = cCtx.createLinearGradient(0, size, 0, 0);
  grad.addColorStop(0, "#1f4d28");
  grad.addColorStop(0.55, "#326f3c");
  grad.addColorStop(1, "#478f50");
  cCtx.fillStyle = grad;
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = "#808080";
  bCtx.fillRect(0, 0, size, size);

  // Subtle organic mottled cellular variation
  for (let i = 0; i < 180; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = 4 + Math.random() * 14;
    cCtx.fillStyle =
      i % 2 === 0 ? "rgba(120, 175, 110, 0.06)" : "rgba(18, 42, 22, 0.07)";
    cCtx.beginPath();
    cCtx.arc(x, y, r, 0, Math.PI * 2);
    cCtx.fill();
  }

  // Central midrib vein
  cCtx.strokeStyle = "rgba(185, 220, 155, 0.55)";
  cCtx.lineWidth = 4;
  cCtx.beginPath();
  cCtx.moveTo(size * 0.5, size);
  cCtx.lineTo(size * 0.5, 6);
  cCtx.stroke();

  bCtx.strokeStyle = "#ffffff";
  bCtx.lineWidth = 5;
  bCtx.beginPath();
  bCtx.moveTo(size * 0.5, size);
  bCtx.lineTo(size * 0.5, 6);
  bCtx.stroke();

  // Branching lateral veins
  const veinPairs = 9;

  for (let i = 1; i <= veinPairs; i++) {
    const t = i / (veinPairs + 1);
    const yStart = size * (1 - t * 0.92);
    const yEnd = yStart - size * 0.14;
    const widthFactor = Math.sin(t * Math.PI);
    const reach = size * 0.44 * widthFactor;

    [-1, 1].forEach((dir) => {
      cCtx.strokeStyle = "rgba(175, 212, 145, 0.36)";
      cCtx.lineWidth = 1.8;
      cCtx.beginPath();
      cCtx.moveTo(size * 0.5, yStart);
      cCtx.quadraticCurveTo(
        size * 0.5 + dir * reach * 0.55,
        yStart - size * 0.04,
        size * 0.5 + dir * reach,
        yEnd
      );
      cCtx.stroke();

      bCtx.strokeStyle = "#d0d0d0";
      bCtx.lineWidth = 2;
      bCtx.beginPath();
      bCtx.moveTo(size * 0.5, yStart);
      bCtx.quadraticCurveTo(
        size * 0.5 + dir * reach * 0.55,
        yStart - size * 0.04,
        size * 0.5 + dir * reach,
        yEnd
      );
      bCtx.stroke();
    });
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const bumpMap = new THREE.CanvasTexture(bumpCanvas);

  return { map, bumpMap };
}

export function createBarkTextureSet() {
  const size = 256;
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext("2d")!;

  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext("2d")!;

  cCtx.fillStyle = "#3a452d";
  cCtx.fillRect(0, 0, size, size);
  bCtx.fillStyle = "#707070";
  bCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 140; i++) {
    const x = Math.random() * size;
    const w = 1 + Math.random() * 3.5;
    cCtx.fillStyle =
      i % 3 === 0
        ? "rgba(95, 82, 52, 0.32)"
        : i % 3 === 1
          ? "rgba(28, 38, 22, 0.45)"
          : "rgba(122, 134, 88, 0.16)";
    cCtx.fillRect(x, 0, w, size);

    bCtx.fillStyle = i % 2 === 0 ? "rgba(220,220,220,0.3)" : "rgba(35,35,35,0.4)";
    bCtx.fillRect(x, 0, w, size);
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 6);
  map.colorSpace = THREE.SRGBColorSpace;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 6);

  return { map, bumpMap };
}

export function createPetalTexture(
  baseHex: string,
  midHex: string,
  edgeHex = midHex
): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const grad = ctx.createLinearGradient(0, size, 0, 0);
  grad.addColorStop(0, baseHex);
  grad.addColorStop(0.58, midHex);
  grad.addColorStop(1, edgeHex);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Delicate silky rose-petal striations radiating from base
  for (let i = 0; i < 40; i++) {
    const spread = (i / 39 - 0.5) * size * 1.1;
    ctx.strokeStyle =
      i % 2 === 0 ? "rgba(255, 195, 205, 0.08)" : "rgba(45, 4, 12, 0.1)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(size * 0.5, size);
    ctx.quadraticCurveTo(
      size * 0.5 + spread * 0.45,
      size * 0.5,
      size * 0.5 + spread,
      0
    );
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  return tex;
}

export function createSoftGlowTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  grad.addColorStop(0, "rgba(255, 248, 225, 1)");
  grad.addColorStop(0.35, "rgba(234, 212, 155, 0.65)");
  grad.addColorStop(1, "rgba(212, 175, 55, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

export function createSoilMistTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.05,
    size / 2,
    size / 2,
    size * 0.48
  );
  grad.addColorStop(0, "rgba(26, 22, 18, 0.85)");
  grad.addColorStop(0.45, "rgba(18, 22, 32, 0.52)");
  grad.addColorStop(1, "rgba(4, 6, 16, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}
