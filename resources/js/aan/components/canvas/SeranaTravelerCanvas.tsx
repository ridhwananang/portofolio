import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { ExperiencePalette } from "@/aan/types/experience";

interface SeranaTravelerCanvasProps {
  active: boolean;
  progress: number; // 0..1 across Serana (156s)
  palette: ExperiencePalette;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function smoothstep(t: number) {
  const x = clamp01(t);

  return x * x * (3 - 2 * x);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Evaluates the exact normalized screen Y [0..1] of NightTerrainOverlay's foreground hill ridge
 * for normalized screen X in [0..0.35], matching SVG viewBox 1440x900 preserveAspectRatio="none".
 */
function getForegroundHillYRatio(xRatio: number): number {
  const targetSvgX = Math.max(0, Math.min(515, xRatio * 1440));
  const x0 = 0;
  const x1 = 165;
  const x2 = 330;
  const x3 = 515;

  let lo = 0;
  let hi = 1;

  for (let i = 0; i < 10; i++) {
    const mid = (lo + hi) * 0.5;
    const inv = 1 - mid;
    const bx =
      inv * inv * inv * x0 +
      3 * inv * inv * mid * x1 +
      3 * inv * mid * mid * x2 +
      mid * mid * mid * x3;

    if (bx < targetSvgX) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const t = (lo + hi) * 0.5;
  const inv = 1 - t;
  const by =
    inv * inv * inv * 688 +
    3 * inv * inv * t * 656 +
    3 * inv * t * t * 694 +
    t * t * t * 680;

  return by / 900;
}

function createWoodPlankTexture(): THREE.CanvasTexture {
  const w = 256;
  const h = 128;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#5c3a21";
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 48; i++) {
    const y = Math.random() * h;
    const thickness = 1 + Math.random() * 2.5;
    ctx.fillStyle =
      i % 2 === 0 ? "rgba(42, 23, 12, 0.35)" : "rgba(128, 86, 52, 0.22)";
    ctx.fillRect(0, y, w, thickness);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  return tex;
}

function createGlassesFrameMesh(material: THREE.Material): THREE.Group {
  const group = new THREE.Group();

  const makeLensRim = (xOffset: number) => {
    const rimGroup = new THREE.Group();
    rimGroup.position.x = xOffset;
    const w = 0.135;
    const h = 0.095;
    const t = 0.015;

    const topBar = new THREE.Mesh(new THREE.BoxGeometry(w, t, t), material);
    topBar.position.y = h / 2;
    const botBar = new THREE.Mesh(new THREE.BoxGeometry(w, t, t), material);
    botBar.position.y = -h / 2;
    const leftBar = new THREE.Mesh(new THREE.BoxGeometry(t, h + t, t), material);
    leftBar.position.x = -w / 2;
    const rightBar = new THREE.Mesh(new THREE.BoxGeometry(t, h + t, t), material);
    rightBar.position.x = w / 2;

    rimGroup.add(topBar, botBar, leftBar, rightBar);

    return rimGroup;
  };

  group.add(makeLensRim(-0.098));
  group.add(makeLensRim(0.098));

  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(0.065, 0.016, 0.015),
    material
  );
  bridge.position.set(0, 0.018, 0);
  group.add(bridge);

  [-1, 1].forEach((side) => {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.014, 0.014, 0.3),
      material
    );
    arm.position.set(side * 0.165, 0.032, -0.15);
    group.add(arm);
  });

  return group;
}

export function SeranaTravelerCanvas({
  active,
  progress,
}: SeranaTravelerCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    if (!active) {
return;
}

    const container = containerRef.current;

    if (!container) {
return;
}

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const fov = 36;
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 60);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    container.appendChild(renderer.domElement);

    // Nocturnal Moonlight Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0x8aaae8, 0x0d101c, 1.0);
    scene.add(hemiLight);

    const moonKey = new THREE.DirectionalLight(0xfff1dc, 1.9);
    moonKey.position.set(5.5, 5.2, 4.2);
    scene.add(moonKey);

    const coolFill = new THREE.DirectionalLight(0x5273ad, 0.85);
    coolFill.position.set(-4.5, 2.5, 3.0);
    scene.add(coolFill);

    const rimLight = new THREE.DirectionalLight(0xd4e4ff, 1.2);
    rimLight.position.set(2.5, 3.5, -4.5);
    scene.add(rimLight);

    // Bench Materials
    const woodTex = createWoodPlankTexture();
    const woodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.72,
      metalness: 0.05,
    });
    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x161b26,
      roughness: 0.45,
      metalness: 0.6,
    });

    // Character Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xdba784,
      roughness: 0.64,
      metalness: 0.02,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x161720,
      roughness: 0.48,
      metalness: 0.08,
    });
    const glassesMat = new THREE.MeshStandardMaterial({
      color: 0x111217,
      roughness: 0.24,
      metalness: 0.35,
    });
    const eyeWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xe8ecf5,
      roughness: 0.25,
    });
    const irisMat = new THREE.MeshStandardMaterial({
      color: 0x241710,
      roughness: 0.2,
    });
    const hoodieMat = new THREE.MeshStandardMaterial({
      color: 0xd5d8df,
      roughness: 0.84,
      metalness: 0.02,
    });
    const hoodieShadeMat = new THREE.MeshStandardMaterial({
      color: 0xbcc0ca,
      roughness: 0.88,
    });
    const chinoMat = new THREE.MeshStandardMaterial({
      color: 0xb59164,
      roughness: 0.8,
      metalness: 0.02,
    });
    const chinoCuffMat = new THREE.MeshStandardMaterial({
      color: 0x9c7b51,
      roughness: 0.84,
    });
    const sneakerWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xd7dae2,
      roughness: 0.56,
    });
    const sneakerGreyMat = new THREE.MeshStandardMaterial({
      color: 0x626975,
      roughness: 0.62,
    });

    // --- 3D LONG WOODEN BENCH ON HILLTOP (facing toward background sky & Moon) ---
    const benchGroup = new THREE.Group();
    scene.add(benchGroup);

    const benchWidth = 1.85;
    const seatY = 0.46;
    const seatDepth = 0.52;

    // 3 Wooden Seat Planks
    [-0.16, 0.0, 0.16].forEach((zOff) => {
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(benchWidth, 0.045, 0.13),
        woodMat
      );
      plank.position.set(0, seatY, zOff);
      benchGroup.add(plank);
    });

    // Tilted Wooden Backrest (3 spaced horizontal slats so hoodie & hair remain visible)
    const backrestGroup = new THREE.Group();
    backrestGroup.position.set(0, seatY, -seatDepth * 0.42);
    backrestGroup.rotation.x = -0.18;
    benchGroup.add(backrestGroup);

    [0.2, 0.36, 0.52].forEach((yOff) => {
      const slat = new THREE.Mesh(
        new THREE.BoxGeometry(benchWidth, 0.095, 0.04),
        woodMat
      );
      slat.position.set(0, yOff, 0);
      backrestGroup.add(slat);
    });

    // Wrought-iron side frames, legs & armrests
    [-benchWidth * 0.44, benchWidth * 0.44].forEach((xSide) => {
      // Back support post (angled with backrest)
      const backPost = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.62, 0.045),
        ironMat
      );
      backPost.position.set(xSide, seatY + 0.28, -seatDepth * 0.46);
      backPost.rotation.x = -0.18;
      benchGroup.add(backPost);

      // Front & back legs planted slightly into the hill slope
      const frontLeg = new THREE.Mesh(
        new THREE.BoxGeometry(0.055, seatY + 0.06, 0.055),
        ironMat
      );
      frontLeg.position.set(xSide, (seatY - 0.04) * 0.5, seatDepth * 0.34);
      benchGroup.add(frontLeg);

      const backLeg = new THREE.Mesh(
        new THREE.BoxGeometry(0.055, seatY + 0.06, 0.055),
        ironMat
      );
      backLeg.position.set(xSide, (seatY - 0.04) * 0.5, -seatDepth * 0.34);
      benchGroup.add(backLeg);

      // Side seat rail
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.045, seatDepth * 0.84),
        ironMat
      );
      rail.position.set(xSide, seatY - 0.025, 0);
      benchGroup.add(rail);

      // Wooden Armrest
      const armSupport = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 0.24, 0.045),
        ironMat
      );
      armSupport.position.set(xSide, seatY + 0.12, seatDepth * 0.28);
      benchGroup.add(armSupport);

      const armTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.038, seatDepth * 0.85),
        woodMat
      );
      armTop.position.set(xSide, seatY + 0.24, -0.02);
      benchGroup.add(armTop);
    });

    // Subtle ground shadow beneath the long bench
    const benchShadowGeo = new THREE.PlaneGeometry(2.1, 0.85);
    benchShadowGeo.rotateX(-Math.PI / 2);
    const benchShadowMat = new THREE.MeshBasicMaterial({
      color: 0x02040a,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const benchShadow = new THREE.Mesh(benchShadowGeo, benchShadowMat);
    benchShadow.position.set(0, 0.004, 0);
    benchGroup.add(benchShadow);

    // --- HIERARCHICAL 3D CHARACTER RIG ---
    const characterRoot = new THREE.Group();
    scene.add(characterRoot);

    const charShadowGeo = new THREE.CircleGeometry(0.36, 20);
    charShadowGeo.rotateX(-Math.PI / 2);
    const charShadowMat = new THREE.MeshBasicMaterial({
      color: 0x02040a,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(charShadowGeo, charShadowMat);
    contactShadow.position.set(0, 0.006, 0);
    characterRoot.add(contactShadow);

    // Pelvis / Hip Pivot
    const pelvisPivot = new THREE.Group();
    characterRoot.add(pelvisPivot);

    const pelvisMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 18, 14),
      chinoMat
    );
    pelvisMesh.scale.set(1.06, 0.72, 0.86);
    pelvisPivot.add(pelvisMesh);

    // --- UPPER BODY ---
    const spinePivot = new THREE.Group();
    spinePivot.position.set(0, 0.06, 0);
    pelvisPivot.add(spinePivot);

    const waistHem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.242, 0.12, 22),
      hoodieShadeMat
    );
    waistHem.position.set(0, 0.07, 0);
    waistHem.scale.set(1.04, 1, 0.85);
    spinePivot.add(waistHem);

    const torsoMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.26, 0.42, 14, 22),
      hoodieMat
    );
    torsoMesh.position.set(0, 0.36, 0);
    torsoMesh.scale.set(1.04, 1.0, 0.84);
    spinePivot.add(torsoMesh);

    const pocketMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.258, 0.26, 0.19, 20, 1, false, -0.62, 1.24),
      hoodieShadeMat
    );
    pocketMesh.scale.set(1.02, 1.0, 0.86);
    pocketMesh.position.set(0, 0.22, 0.012);
    spinePivot.add(pocketMesh);

    const collarTorus = new THREE.Mesh(
      new THREE.TorusGeometry(0.185, 0.07, 12, 22),
      hoodieMat
    );
    collarTorus.rotation.x = Math.PI / 2 + 0.18;
    collarTorus.position.set(0, 0.68, -0.02);
    spinePivot.add(collarTorus);

    const hoodBack = new THREE.Mesh(
      new THREE.SphereGeometry(0.225, 16, 14),
      hoodieShadeMat
    );
    hoodBack.scale.set(1.02, 0.7, 0.88);
    hoodBack.position.set(0, 0.61, -0.17);
    spinePivot.add(hoodBack);

    const stringLeft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.009, 0.22, 8),
      hoodieShadeMat
    );
    stringLeft.position.set(-0.065, 0.56, 0.23);
    stringLeft.rotation.z = 0.05;
    const stringRight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.009, 0.22, 8),
      hoodieShadeMat
    );
    stringRight.position.set(0.065, 0.56, 0.23);
    stringRight.rotation.z = -0.05;
    spinePivot.add(stringLeft, stringRight);

    // --- HEAD GROUP ---
    const neckPivot = new THREE.Group();
    neckPivot.position.set(0, 0.71, 0.01);
    spinePivot.add(neckPivot);

    const neckMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.088, 0.102, 0.18, 14),
      skinMat
    );
    neckMesh.position.set(0, 0.06, 0);
    neckPivot.add(neckMesh);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.36, 0.02);
    neckPivot.add(headGroup);

    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.31, 24, 20),
      skinMat
    );
    headMesh.scale.set(0.94, 1.07, 0.96);
    headGroup.add(headMesh);

    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(
        new THREE.SphereGeometry(0.068, 12, 10),
        skinMat
      );
      ear.scale.set(0.55, 1.05, 0.8);
      ear.position.set(side * 0.285, -0.01, -0.02);
      headGroup.add(ear);
    });

    const nose = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 12, 10),
      skinMat
    );
    nose.scale.set(1.0, 0.82, 1.12);
    nose.position.set(0, -0.02, 0.298);
    headGroup.add(nose);

    [-1, 1].forEach((side) => {
      const sclera = new THREE.Mesh(
        new THREE.SphereGeometry(0.048, 12, 10),
        eyeWhiteMat
      );
      sclera.scale.set(1.0, 1.1, 0.55);
      sclera.position.set(side * 0.102, 0.05, 0.268);
      headGroup.add(sclera);

      const iris = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 12, 10),
        irisMat
      );
      iris.scale.set(1, 1.05, 0.6);
      iris.position.set(side * 0.102, 0.052, 0.287);
      headGroup.add(iris);

      const brow = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.014, 0.07, 6, 8),
        hairMat
      );
      brow.rotation.z = Math.PI / 2 - side * 0.08;
      brow.position.set(side * 0.102, 0.125, 0.278);
      headGroup.add(brow);
    });

    const mouth = new THREE.Mesh(
      new THREE.TorusGeometry(0.052, 0.008, 8, 14, Math.PI * 0.5),
      new THREE.MeshStandardMaterial({ color: 0x7a473d, roughness: 0.65 })
    );
    mouth.rotation.z = Math.PI + Math.PI * 0.25;
    mouth.position.set(0, -0.105, 0.278);
    headGroup.add(mouth);

    const glasses = createGlassesFrameMesh(glassesMat);
    glasses.position.set(0, 0.052, 0.304);
    headGroup.add(glasses);

    const hairBack = new THREE.Mesh(
      new THREE.SphereGeometry(0.325, 22, 18),
      hairMat
    );
    hairBack.scale.set(0.98, 1.03, 0.99);
    hairBack.position.set(0, 0.05, -0.055);
    headGroup.add(hairBack);

    const hairPompadour = new THREE.Mesh(
      new THREE.SphereGeometry(0.23, 18, 14),
      hairMat
    );
    hairPompadour.scale.set(1.16, 0.64, 1.08);
    hairPompadour.rotation.x = -0.22;
    hairPompadour.rotation.z = -0.1;
    hairPompadour.position.set(0.02, 0.29, 0.035);
    headGroup.add(hairPompadour);

    const hairWaveSide = new THREE.Mesh(
      new THREE.SphereGeometry(0.145, 14, 12),
      hairMat
    );
    hairWaveSide.scale.set(1.18, 0.56, 0.95);
    hairWaveSide.position.set(-0.115, 0.24, 0.11);
    headGroup.add(hairWaveSide);

    // --- ARMS ---
    const buildArm = (side: -1 | 1) => {
      const shoulderPivot = new THREE.Group();
      shoulderPivot.position.set(side * 0.285, 0.57, 0);
      spinePivot.add(shoulderPivot);

      const upperArm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.082, 0.25, 10, 14),
        hoodieMat
      );
      upperArm.position.set(0, -0.14, 0);
      shoulderPivot.add(upperArm);

      const elbowPivot = new THREE.Group();
      elbowPivot.position.set(0, -0.29, 0);
      shoulderPivot.add(elbowPivot);

      const elbowSmooth = new THREE.Mesh(
        new THREE.SphereGeometry(0.078, 12, 10),
        hoodieMat
      );
      elbowPivot.add(elbowSmooth);

      const forearm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.072, 0.22, 10, 14),
        hoodieMat
      );
      forearm.position.set(0, -0.13, 0);
      elbowPivot.add(forearm);

      const cuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.068, 0.062, 0.055, 14),
        hoodieShadeMat
      );
      cuff.position.set(0, -0.26, 0);
      elbowPivot.add(cuff);

      const hand = new THREE.Mesh(
        new THREE.SphereGeometry(0.064, 12, 10),
        skinMat
      );
      hand.scale.set(0.95, 1.15, 0.78);
      hand.position.set(0, -0.325, 0.01);
      elbowPivot.add(hand);

      return { shoulderPivot, elbowPivot };
    };

    const leftArm = buildArm(-1);
    const rightArm = buildArm(1);

    // --- LEGS ---
    const buildLeg = (side: -1 | 1) => {
      const hipPivot = new THREE.Group();
      hipPivot.position.set(side * 0.135, -0.02, 0);
      pelvisPivot.add(hipPivot);

      const thigh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.11, 0.34, 10, 16),
        chinoMat
      );
      thigh.position.set(0, -0.23, 0);
      hipPivot.add(thigh);

      const kneePivot = new THREE.Group();
      kneePivot.position.set(0, -0.46, 0);
      hipPivot.add(kneePivot);

      const kneeJoint = new THREE.Mesh(
        new THREE.SphereGeometry(0.102, 12, 10),
        chinoMat
      );
      kneePivot.add(kneeJoint);

      const shin = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.092, 0.34, 10, 16),
        chinoMat
      );
      shin.position.set(0, -0.21, 0);
      kneePivot.add(shin);

      const ankleCuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.096, 0.094, 0.055, 14),
        chinoCuffMat
      );
      ankleCuff.position.set(0, -0.4, 0);
      kneePivot.add(ankleCuff);

      const anklePivot = new THREE.Group();
      anklePivot.position.set(0, -0.45, 0);
      kneePivot.add(anklePivot);

      const sneakerSole = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.072, 0.16, 8, 12),
        sneakerWhiteMat
      );
      sneakerSole.rotation.x = Math.PI / 2;
      sneakerSole.scale.set(1.06, 1.0, 0.48);
      sneakerSole.position.set(0, -0.045, 0.055);
      anklePivot.add(sneakerSole);

      const sneakerUpper = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.074, 0.13, 8, 12),
        sneakerWhiteMat
      );
      sneakerUpper.rotation.x = Math.PI / 2;
      sneakerUpper.scale.set(1.02, 1.0, 0.78);
      sneakerUpper.position.set(0, -0.005, 0.045);
      anklePivot.add(sneakerUpper);

      const toeOverlay = new THREE.Mesh(
        new THREE.SphereGeometry(0.074, 12, 10),
        sneakerGreyMat
      );
      toeOverlay.scale.set(1.02, 0.62, 0.95);
      toeOverlay.position.set(0, -0.015, 0.135);
      anklePivot.add(toeOverlay);

      const heelOverlay = new THREE.Mesh(
        new THREE.SphereGeometry(0.073, 12, 10),
        sneakerGreyMat
      );
      heelOverlay.scale.set(1.0, 0.78, 0.75);
      heelOverlay.position.set(0, -0.005, -0.055);
      anklePivot.add(heelOverlay);

      return { hipPivot, kneePivot, anklePivot };
    };

    const leftLeg = buildLeg(-1);
    const rightLeg = buildLeg(1);

    const handleResize = () => {
      if (!container) {
return;
}

      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    const startPerf = performance.now();
    let rafId = 0;

    const animate = (now: number) => {
      const p = progressRef.current;
      const tSec = (now - startPerf) / 1000;

      const visH = 2 * camera.position.z * Math.tan((fov * Math.PI) / 360);
      const visW = visH * (width / Math.max(1, height));

      const targetHeightUnits = visH * 0.19;
      const rigScale = targetHeightUnits / 2.5;

      // Bench sits firmly on the hill crest at ~19.5% from left, facing toward the back sky & Moon
      const benchXRatio = width < 640 ? 0.24 : 0.195;
      const benchYRatio = getForegroundHillYRatio(benchXRatio);
      const benchWorldX = (benchXRatio - 0.5) * visW;
      const benchWorldY = (0.5 - benchYRatio) * visH;

      // 0.72 * PI (~130 deg): bench faces away from camera (+Z -> -Z) and slightly right (+X) toward the Moon & Love Constellation
      const benchFacingYaw = Math.PI * 0.72;
      benchGroup.scale.setScalar(rigScale);
      benchGroup.position.set(benchWorldX, benchWorldY, -0.15);
      benchGroup.rotation.y = benchFacingYaw;

      // Walk behind/alongside the bench from offscreen left (-0.06), then turn away and sit on the bench
      const walkProgress = clamp01(p / 0.125);
      const walkEase = 1 - Math.pow(1 - walkProgress, 1.45);
      const sitBlend = smoothstep((p - 0.128) / 0.048);

      // Walk-up destination slightly behind-left of bench center, easing onto the bench seat center-left
      const startWorldX = (-0.06 - 0.5) * visW;
      const approachWorldX = benchWorldX - 0.35 * rigScale;
      const approachWorldZ = 0.28 * rigScale;

      // Seat slot slightly left of bench center (leaving poignant empty space beside him on the right!)
      const seatLocalOffset = new THREE.Vector3(-0.28, 0, 0.02);
      seatLocalOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), benchFacingYaw);
      const seatedWorldX = benchWorldX + seatLocalOffset.x * rigScale;
      const seatedWorldZ = -0.15 + seatLocalOffset.z * rigScale;

      const walkWorldX = lerp(startWorldX, approachWorldX, walkEase);
      const walkXRatio = clamp01(walkWorldX / visW + 0.5);
      const walkGroundY = (0.5 - getForegroundHillYRatio(walkXRatio)) * visH;

      const curX = lerp(walkWorldX, seatedWorldX, sitBlend);
      const curY = lerp(walkGroundY, benchWorldY, sitBlend);
      const curZ = lerp(approachWorldZ, seatedWorldZ, sitBlend);

      characterRoot.scale.setScalar(rigScale);
      characterRoot.position.set(curX, curY, curZ);

      // Walk facing right (PI * 0.48), then turn toward the back-facing bench angle (benchFacingYaw) as he sits
      characterRoot.rotation.y = lerp(Math.PI * 0.48, benchFacingYaw, sitBlend);

      const stepFade = 1 - smoothstep((walkProgress - 0.84) / 0.16);
      const stride = walkEase * Math.PI * 10;
      const bob =
        (1 - sitBlend) * stepFade * Math.abs(Math.sin(stride)) * 0.06;

      // Pelvis lowers smoothly from standing (1.00) onto the wooden bench seat (0.56, resting cleanly on seatY = 0.46!)
      pelvisPivot.position.y = lerp(1.0, 0.56, sitBlend) + bob;
      pelvisPivot.rotation.y =
        (1 - sitBlend) * Math.sin(stride) * 0.08 * stepFade;

      contactShadow.material.opacity = lerp(0.45, 0.0, sitBlend);

      // Lean back comfortably against the tilted wooden backrest (-0.18 rad)
      const breath = Math.sin(tSec * 1.45) * 0.012;
      spinePivot.rotation.x = lerp(0.08 * stepFade, -0.16, sitBlend) + breath;
      spinePivot.rotation.y = (1 - sitBlend) * -Math.sin(stride) * 0.06 * stepFade;

      // Head tilts gently up & slightly right toward the Moon & Love Constellation
      const moonRise = clamp01(p / 0.28);
      const moonEase = 1 - Math.pow(1 - moonRise, 3);
      const moonY = 0.76 - moonEase * 0.52;
      const lookPitch = lerp(0.04, -0.32 - (0.35 - moonY) * 0.28, sitBlend);
      const gazeWander = sitBlend * Math.sin(tSec * 0.35) * 0.06;

      neckPivot.rotation.x = lookPitch * 0.65;
      neckPivot.rotation.y = sitBlend * -0.18 + gazeWander;
      headGroup.rotation.x = lookPitch * 0.35;

      // Leg kinematics: walk -> natural 90-degree bench sitting (thighs horizontal on seat, shins vertical down, sneakers flat on hill!)
      const swingL = Math.sin(stride) * 0.45 * stepFade;
      const swingR = -swingL;
      const walkKneeL = Math.max(
        0.05,
        -Math.cos(stride) * 0.52 * stepFade + 0.12
      );
      const walkKneeR = Math.max(
        0.05,
        Math.cos(stride) * 0.52 * stepFade + 0.12
      );

      // Seated on bench: thighs forward (-1.52 rad), knees bent 90 deg (+1.52 rad) so feet touch hill at y=0
      leftLeg.hipPivot.rotation.x = lerp(-swingL, -1.52, sitBlend);
      leftLeg.kneePivot.rotation.x = lerp(walkKneeL, 1.52, sitBlend);
      leftLeg.anklePivot.rotation.x = lerp(0, 0.0, sitBlend);

      rightLeg.hipPivot.rotation.x = lerp(-swingR, -1.48, sitBlend);
      rightLeg.kneePivot.rotation.x = lerp(walkKneeR, 1.46, sitBlend);
      rightLeg.anklePivot.rotation.x = lerp(0, 0.02, sitBlend);

      // Arm kinematics when seated on bench:
      // Left arm rests naturally on the left wooden armrest; right arm rests casually on thigh/lap
      leftArm.shoulderPivot.rotation.x = lerp(swingL * 0.65, -0.45, sitBlend);
      leftArm.shoulderPivot.rotation.z = lerp(-0.08, -0.22, sitBlend);
      leftArm.elbowPivot.rotation.x = lerp(-0.32, -0.78, sitBlend);

      rightArm.shoulderPivot.rotation.x = lerp(swingR * 0.65, -0.36, sitBlend);
      rightArm.shoulderPivot.rotation.z = lerp(0.08, 0.12, sitBlend);
      rightArm.elbowPivot.rotation.x = lerp(-0.32, -0.82, sitBlend);

      stringLeft.rotation.x = Math.sin(tSec * 2.4) * 0.07;
      stringRight.rotation.x = Math.cos(tSec * 2.1 + 0.5) * 0.07;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      woodTex.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();

          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();

      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [active]);

  if (!active) {
return null;
}

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[26] h-full w-full transition-opacity duration-200"
    />
  );
}
