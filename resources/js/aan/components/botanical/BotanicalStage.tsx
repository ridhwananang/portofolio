import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  createSculptedLeafGeometry,
  createSculptedPetalGeometry,
  createTaperedTubeGeometry,
} from "@/aan/components/botanical/botanicalGeometry";
import {
  createBarkTextureSet,
  createLeafTextureSet,
  createPetalTexture,
  createSoftGlowTexture,
} from "@/aan/components/botanical/botanicalTextures";
import type { BotanicalStageName, ExperiencePalette } from "@/aan/types/experience";

interface BotanicalStageProps {
  active: boolean;
  progress: number; // 0..1 across song segment
  remainingMs?: number;
  stageName?: BotanicalStageName;
  palette: ExperiencePalette;
}

interface GrowingTube {
  mesh: THREE.Mesh;
  totalIndices: number;
  startAt: number;
  endAt: number;
}

interface AttachedLeaf {
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  baseScale: number;
  appearAt: number;
  detachAt: number | null;
  detached: boolean;
  targetRotX: number;
}

interface ThornRef {
  mesh: THREE.Mesh;
  appearAt: number;
  baseScale: number;
}

interface FallingParticle3D {
  mesh: THREE.Mesh;
  material: THREE.Material & { opacity: number };
  vx: number;
  vy: number;
  vz: number;
  spinX: number;
  spinY: number;
  spinZ: number;
  swayPhase: number;
  alpha: number;
}

interface PetalRef {
  pivot: THREE.Group;
  closedAngle: number;
  openAngle: number;
  delay: number;
}

interface Rose3D {
  group: THREE.Group;
  petals: PetalRef[];
  stamenGroup: THREE.Group;
  baseScale: number;
  appearAt: number;
  maxOpen: number; // 1 for full bloom, 0.45 for half-open bud
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function easeOutCubic(t: number) {
  const x = clamp01(t);

  return 1 - Math.pow(1 - x, 3);
}

function segmentProgress(progress: number, start: number, end: number) {
  return easeOutCubic((progress - start) / (end - start));
}

export function BotanicalStage({
  active,
  progress,
  remainingMs,
  palette,
}: BotanicalStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
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

    const container = containerRef.current;

    if (!container) {
return;
}

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 60);
    camera.position.set(0, 1.45, 7.6);
    camera.lookAt(0, 1.38, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3-Point Luxury Moonlight + Warm Rose Rim Lighting
    const hemiLight = new THREE.HemisphereLight(0xc2d4ff, 0x1a1210, 1.1);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe8cb, 2.55);
    keyLight.position.set(3.8, 6.8, 5.2);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x9ec4ff, 1.7);
    rimLight.position.set(-4.6, 5.0, -3.5);
    scene.add(rimLight);

    const frontFill = new THREE.PointLight(0xffb5c0, 1.15, 7.5, 1.5);
    frontFill.position.set(0.4, 2.1, 3.6);
    scene.add(frontFill);

    const crownGlow = new THREE.PointLight(
      new THREE.Color(paletteRef.current.petalPrimary),
      2.4,
      9.5,
      1.4
    );
    crownGlow.position.set(0, 2.8, 2.1);
    scene.add(crownGlow);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Procedural Textures
    const leafTex = createLeafTextureSet();
    const barkTex = createBarkTextureSet();

    // Rich velvety crimson red rose petal textures
    const petalInnerTex = createPetalTexture(
      "#36030b",
      "#8c071c",
      paletteRef.current.petalPrimary
    );
    const petalMidTex = createPetalTexture(
      paletteRef.current.petalSecondary,
      paletteRef.current.petalPrimary,
      "#df2240"
    );
    const petalOuterTex = createPetalTexture(
      "#3a030c",
      "#990b22",
      paletteRef.current.petalPrimary
    );

    const glowSpriteTex = createSoftGlowTexture();

    const disposableTextures: THREE.Texture[] = [
      leafTex.map,
      leafTex.bumpMap,
      barkTex.map,
      barkTex.bumpMap,
      petalInnerTex,
      petalMidTex,
      petalOuterTex,
      glowSpriteTex,
    ];

    // Rose cane, root & calyx materials
    const caneMat = new THREE.MeshStandardMaterial({
      map: barkTex.map,
      bumpMap: barkTex.bumpMap,
      bumpScale: 0.028,
      color: 0x456b38,
      roughness: 0.62,
      metalness: 0.05,
      emissive: 0x0d1b0a,
      emissiveIntensity: 0.22,
    });

    const rootMat = new THREE.MeshStandardMaterial({
      map: barkTex.map,
      bumpMap: barkTex.bumpMap,
      bumpScale: 0.035,
      color: 0x6b4e33,
      roughness: 0.82,
      metalness: 0.06,
      emissive: 0x26170b,
      emissiveIntensity: 0.14,
      transparent: true,
      opacity: 0.72,
    });

    const thornMat = new THREE.MeshStandardMaterial({
      color: 0x63382e,
      roughness: 0.55,
      metalness: 0.08,
    });

    const sepalMat = new THREE.MeshStandardMaterial({
      map: leafTex.map,
      bumpMap: leafTex.bumpMap,
      bumpScale: 0.02,
      color: 0x3f7543,
      roughness: 0.42,
      metalness: 0.05,
      emissive: 0x102814,
      emissiveIntensity: 0.22,
      side: THREE.DoubleSide,
    });

    const fallingPetalMatBase = new THREE.MeshPhysicalMaterial({
      map: petalMidTex,
      roughness: 0.42,
      metalness: 0.04,
      sheen: 0.75,
      sheenColor: new THREE.Color(paletteRef.current.glowHex),
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });

    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [
      caneMat,
      rootMat,
      thornMat,
      sepalMat,
      fallingPetalMatBase,
    ];

    const growingTubes: GrowingTube[] = [];
    const attachedLeaves: AttachedLeaf[] = [];
    const thorns: ThornRef[] = [];
    const fallingParticles: FallingParticle3D[] = [];
    const roses: Rose3D[] = [];

    const addTube = (
      points: THREE.Vector3[],
      startR: number,
      endR: number,
      material: THREE.Material,
      startAt: number,
      endAt: number,
      tubularSegs = 36
    ) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const geo = createTaperedTubeGeometry(
        curve,
        tubularSegs,
        8,
        startR,
        endR,
        0.075
      );
      const totalIndices = geo.index ? geo.index.count : 0;
      geo.setDrawRange(0, 0);
      disposableGeometries.push(geo);

      const mesh = new THREE.Mesh(geo, material);
      rootGroup.add(mesh);
      growingTubes.push({ mesh, totalIndices, startAt, endAt });

      return curve;
    };

    // 1. Gnarled Organic 3D Root Network (y < 0)
    const rootCount = 10;

    for (let i = 0; i < rootCount; i++) {
      const baseAngle = (i / rootCount) * Math.PI * 2 + (i % 2) * 0.16;
      const reach = 1.1 + (i % 3) * 0.34;
      const depth = -(1.1 + (i % 4) * 0.2);
      const delay = (i % 5) * 0.015;
      const twist = (i % 2 === 0 ? 1 : -1) * 0.3;

      const p1 = new THREE.Vector3(
        Math.cos(baseAngle) * reach * 0.24,
        depth * 0.24,
        Math.sin(baseAngle) * reach * 0.24
      );
      const p2 = new THREE.Vector3(
        Math.cos(baseAngle + twist) * reach * 0.62,
        depth * 0.62,
        Math.sin(baseAngle + twist) * reach * 0.62
      );
      const p3 = new THREE.Vector3(
        Math.cos(baseAngle + twist * 0.45) * reach,
        depth,
        Math.sin(baseAngle + twist * 0.45) * reach
      );

      addTube(
        [new THREE.Vector3(0, 0.04, 0), p1, p2, p3],
        0.054,
        0.005,
        rootMat,
        delay,
        delay + 0.21,
        26
      );

      const subAngle = baseAngle + (i % 2 === 0 ? 0.55 : -0.55);
      const subEnd = new THREE.Vector3(
        Math.cos(subAngle) * reach * 1.15,
        depth * 0.94,
        Math.sin(subAngle) * reach * 1.15
      );
      addTube(
        [p1.clone(), p2.clone().lerp(subEnd, 0.45), subEnd],
        0.022,
        0.002,
        rootMat,
        delay + 0.06,
        delay + 0.24,
        18
      );
    }

    // 2. Multi-Cane Rose Bush Structure (1 Central Cane + 2 Sweeping Basal Canes)
    const centralCane = addTube(
      [
        new THREE.Vector3(0, -0.02, 0),
        new THREE.Vector3(-0.08, 0.78, 0.06),
        new THREE.Vector3(0.09, 1.56, -0.06),
        new THREE.Vector3(-0.04, 2.38, 0.05),
        new THREE.Vector3(0.02, 3.18, 0),
      ],
      0.082,
      0.024,
      caneMat,
      0.06,
      0.36,
      54
    );

    const leftBasalCane = addTube(
      [
        new THREE.Vector3(-0.02, 0.05, 0.02),
        new THREE.Vector3(-0.42, 0.65, 0.28),
        new THREE.Vector3(-0.82, 1.38, 0.36),
        new THREE.Vector3(-1.08, 2.08, 0.22),
      ],
      0.05,
      0.014,
      caneMat,
      0.1,
      0.38,
      40
    );

    const rightBasalCane = addTube(
      [
        new THREE.Vector3(0.02, 0.05, -0.02),
        new THREE.Vector3(0.45, 0.68, -0.22),
        new THREE.Vector3(0.88, 1.42, -0.26),
        new THREE.Vector3(1.12, 2.15, 0.06),
      ],
      0.05,
      0.014,
      caneMat,
      0.11,
      0.39,
      40
    );

    // Shared 3D Geometries
    const sharedLeafGeo = createSculptedLeafGeometry(0.48, 0.26);
    const sharedPetalGeo = createSculptedPetalGeometry(0.45, 0.35, 0.11);
    const sharedSepalGeo = createSculptedLeafGeometry(0.24, 0.09);
    const sharedThornGeo = new THREE.ConeGeometry(0.018, 0.075, 5);
    const sharedStamenGeo = new THREE.CylinderGeometry(0.004, 0.0025, 0.13, 5);
    const sharedAntherGeo = new THREE.SphereGeometry(0.014, 6, 6);
    disposableGeometries.push(
      sharedLeafGeo,
      sharedPetalGeo,
      sharedSepalGeo,
      sharedThornGeo,
      sharedStamenGeo,
      sharedAntherGeo
    );

    // Subtle 3D Rose Thorns along the main canes
    [centralCane, leftBasalCane, rightBasalCane].forEach((curve, cIdx) => {
      [0.2, 0.35, 0.52, 0.68].forEach((t, tIdx) => {
        const pt = curve.getPointAt(t);
        const thorn = new THREE.Mesh(sharedThornGeo, thornMat);
        thorn.position.copy(pt);
        const ang = (cIdx * 2 + tIdx) * 1.9;
        thorn.rotation.set(0.9, ang, 0.3);
        thorn.scale.setScalar(0.001);
        rootGroup.add(thorn);
        thorns.push({
          mesh: thorn,
          appearAt: 0.14 + t * 0.22,
          baseScale: 0.9,
        });
      });
    });

    const glossyLeafTint = new THREE.Color(0xdaeed6);
    const shedCrimsonTint = new THREE.Color(0x9e3038);
    const shedAmberTint = new THREE.Color(0xc4823b);

    let leafCounter = 0;
    const spawnSingleLeaflet = (
      pos: THREE.Vector3,
      yaw: number,
      pitch: number,
      roll: number,
      scale: number,
      appearAt: number,
      canShed: boolean
    ) => {
      leafCounter += 1;
      const mat = new THREE.MeshStandardMaterial({
        map: leafTex.map,
        bumpMap: leafTex.bumpMap,
        bumpScale: 0.025,
        color: glossyLeafTint.clone(),
        roughness: 0.34,
        metalness: 0.05,
        emissive: 0x102814,
        emissiveIntensity: 0.28,
        side: THREE.DoubleSide,
      });
      disposableMaterials.push(mat);

      const mesh = new THREE.Mesh(sharedLeafGeo, mat);
      mesh.position.copy(pos);
      mesh.rotation.set(pitch, yaw, roll);
      mesh.scale.setScalar(0.001);
      rootGroup.add(mesh);

      const detachOrder = (leafCounter % 22) / 22;
      attachedLeaves.push({
        mesh,
        material: mat,
        baseScale: scale,
        appearAt,
        // Retain ~64% of foliage for lush rose bush fullness even at the end
        detachAt: canShed ? 0.64 + detachOrder * 0.31 : null,
        detached: false,
        targetRotX: pitch,
      });
    };

    /**
     * Spawns a lush 3-leaflet compound rose leaf cluster (1 terminal + 2 lateral leaflets).
     */
    const spawnCompoundRoseLeaf = (
      pos: THREE.Vector3,
      azimuth: number,
      pitch: number,
      scale: number,
      appearAt: number,
      shedRate: "none" | "partial" | "outer"
    ) => {
      const dirX = Math.cos(azimuth);
      const dirZ = Math.sin(azimuth);
      const terminalPos = pos
        .clone()
        .add(new THREE.Vector3(dirX * 0.16 * scale, 0.03, dirZ * 0.16 * scale));

      // Terminal leaflet
      spawnSingleLeaflet(
        terminalPos,
        azimuth,
        pitch,
        0,
        scale,
        appearAt,
        shedRate === "outer"
      );
      // Left & right lateral leaflets
      spawnSingleLeaflet(
        pos.clone().add(new THREE.Vector3(dirX * 0.04, 0.01, dirZ * 0.04)),
        azimuth + 0.92,
        pitch + 0.12,
        0.18,
        scale * 0.78,
        appearAt + 0.01,
        shedRate !== "none"
      );
      spawnSingleLeaflet(
        pos.clone().add(new THREE.Vector3(dirX * 0.04, 0.01, dirZ * 0.04)),
        azimuth - 0.92,
        pitch + 0.12,
        -0.18,
        scale * 0.78,
        appearAt + 0.015,
        shedRate === "outer"
      );
    };

    // Basal lush rose foliage skirt near trunk base
    for (let i = 0; i < 6; i++) {
      const t = 0.14 + i * 0.035;
      const pos = centralCane.getPointAt(t);
      spawnCompoundRoseLeaf(
        pos,
        i * 2.39996,
        1.12,
        0.92,
        0.15 + i * 0.015,
        i % 2 === 0 ? "none" : "partial"
      );
    }

    // 3. Dense Branching Rose Canopy + Twigs
    const branchSpecs = [
      { cane: centralCane, t: 0.34, azimuth: 0.4, len: 1.05, lift: 0.42, startAt: 0.16, endAt: 0.36, bloom: "full" as const },
      { cane: centralCane, t: 0.44, azimuth: 2.55, len: 1.12, lift: 0.48, startAt: 0.18, endAt: 0.38, bloom: "full" as const },
      { cane: centralCane, t: 0.54, azimuth: 4.5, len: 1.02, lift: 0.45, startAt: 0.2, endAt: 0.4, bloom: "bud" as const },
      { cane: centralCane, t: 0.64, azimuth: 1.25, len: 0.95, lift: 0.5, startAt: 0.22, endAt: 0.42, bloom: "full" as const },
      { cane: centralCane, t: 0.74, azimuth: 3.45, len: 0.9, lift: 0.46, startAt: 0.24, endAt: 0.44, bloom: "full" as const },
      { cane: centralCane, t: 0.84, azimuth: 5.4, len: 0.72, lift: 0.42, startAt: 0.26, endAt: 0.45, bloom: "full" as const },
      { cane: centralCane, t: 0.9, azimuth: 2.05, len: 0.56, lift: 0.36, startAt: 0.28, endAt: 0.46, bloom: "bud" as const },
      { cane: leftBasalCane, t: 0.55, azimuth: 3.55, len: 0.65, lift: 0.32, startAt: 0.22, endAt: 0.4, bloom: "full" as const },
      { cane: leftBasalCane, t: 0.8, azimuth: 2.35, len: 0.52, lift: 0.35, startAt: 0.26, endAt: 0.43, bloom: "bud" as const },
      { cane: rightBasalCane, t: 0.55, azimuth: 5.85, len: 0.66, lift: 0.34, startAt: 0.23, endAt: 0.41, bloom: "full" as const },
      { cane: rightBasalCane, t: 0.8, azimuth: 0.65, len: 0.54, lift: 0.35, startAt: 0.27, endAt: 0.44, bloom: "bud" as const },
    ];

    const roseAnchors: Array<{
      pos: THREE.Vector3;
      dir: THREE.Vector3;
      appearAt: number;
      scale: number;
      maxOpen: number;
    }> = [];

    branchSpecs.forEach((bs, bIdx) => {
      const origin = bs.cane.getPointAt(bs.t);
      const dirX = Math.cos(bs.azimuth);
      const dirZ = Math.sin(bs.azimuth);
      const mid = new THREE.Vector3(
        origin.x + dirX * bs.len * 0.52,
        origin.y + bs.lift * 0.62,
        origin.z + dirZ * bs.len * 0.52
      );
      const tip = new THREE.Vector3(
        origin.x + dirX * bs.len,
        origin.y + bs.lift,
        origin.z + dirZ * bs.len
      );

      const branchCurve = addTube(
        [origin, mid, tip],
        0.028,
        0.009,
        caneMat,
        bs.startAt,
        bs.endAt,
        22
      );

      // Compound 3-leaflet rose clusters along each branch
      [0.28, 0.56, 0.84].forEach((lt, lIdx) => {
        const lp = branchCurve.getPointAt(lt);
        const sideAz = bs.azimuth + (lIdx % 2 === 0 ? 1.15 : -1.15);
        spawnCompoundRoseLeaf(
          lp,
          sideAz,
          0.95,
          0.86 - lt * 0.16,
          bs.startAt + lt * 0.14,
          lIdx === 1 ? "outer" : "partial"
        );
      });

      // Secondary leafy shoot
      const twigOrigin = branchCurve.getPointAt(0.45);
      const twigAz = bs.azimuth + (bIdx % 2 === 0 ? 0.72 : -0.72);
      const twigTip = new THREE.Vector3(
        twigOrigin.x + Math.cos(twigAz) * 0.48,
        twigOrigin.y + 0.22,
        twigOrigin.z + Math.sin(twigAz) * 0.48
      );
      const twigCurve = addTube(
        [twigOrigin, twigOrigin.clone().lerp(twigTip, 0.5), twigTip],
        0.015,
        0.004,
        caneMat,
        bs.startAt + 0.06,
        bs.endAt + 0.02,
        14
      );
      spawnCompoundRoseLeaf(
        twigCurve.getPointAt(0.65),
        twigAz + 0.4,
        0.88,
        0.74,
        bs.startAt + 0.1,
        "none"
      );
      spawnCompoundRoseLeaf(
        twigTip,
        twigAz,
        0.82,
        0.7,
        bs.startAt + 0.13,
        "partial"
      );

      // Calyx collar leaves right under the rose
      const collarPos = branchCurve.getPointAt(0.93);
      spawnCompoundRoseLeaf(
        collarPos,
        bs.azimuth + 0.8,
        1.08,
        0.66,
        bs.endAt - 0.04,
        "none"
      );

      roseAnchors.push({
        pos: tip,
        dir: new THREE.Vector3(dirX * 0.55, 0.82, dirZ * 0.55).normalize(),
        appearAt: bs.endAt - 0.04,
        scale: bs.bloom === "full" ? 0.92 + (bIdx % 2) * 0.12 : 0.62,
        maxOpen: bs.bloom === "full" ? 1.0 : 0.42,
      });
    });

    // Side basal cane apex roses
    [leftBasalCane, rightBasalCane].forEach((cane, idx) => {
      const tip = cane.getPointAt(1);
      spawnCompoundRoseLeaf(
        cane.getPointAt(0.9),
        idx === 0 ? 2.6 : 0.4,
        1.05,
        0.76,
        0.32,
        "none"
      );
      roseAnchors.push({
        pos: tip,
        dir: new THREE.Vector3(idx === 0 ? -0.4 : 0.4, 0.86, 0.3).normalize(),
        appearAt: 0.35,
        scale: 1.04,
        maxOpen: 1.0,
      });
    });

    // 4. Opulent 5-Whorl 3D Velvet Red Roses (40 Petals Each!)
    const stamenMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(paletteRef.current.accentHex),
      emissive: 0xd4af37,
      emissiveIntensity: 0.55,
      roughness: 0.3,
    });
    disposableMaterials.push(stamenMat);

    const build3DRedRose = (
      pos: THREE.Vector3,
      aimDir: THREE.Vector3,
      scale: number,
      appearAt: number,
      maxOpen: number
    ) => {
      const group = new THREE.Group();
      group.position.copy(pos);
      const up = new THREE.Vector3(0, 1, 0);
      group.quaternion.setFromUnitVectors(up, aimDir);
      group.scale.setScalar(0.001);
      rootGroup.add(group);

      // 5 green calyx sepals
      for (let s = 0; s < 5; s++) {
        const sepal = new THREE.Mesh(sharedSepalGeo, sepalMat);
        sepal.rotation.y = (s / 5) * Math.PI * 2;
        sepal.rotation.x = 1.2;
        group.add(sepal);
      }

      const petals: PetalRef[] = [];
      const whorls = [
        { count: 4, openAngle: 0.14, closedAngle: 0.04, yOff: 0.052, delay: 0.12, pScale: 0.56, tex: petalInnerTex },
        { count: 6, openAngle: 0.28, closedAngle: 0.08, yOff: 0.04, delay: 0.09, pScale: 0.74, tex: petalInnerTex },
        { count: 8, openAngle: 0.48, closedAngle: 0.14, yOff: 0.028, delay: 0.06, pScale: 0.9, tex: petalMidTex },
        { count: 10, openAngle: 0.76, closedAngle: 0.2, yOff: 0.014, delay: 0.03, pScale: 1.04, tex: petalMidTex },
        { count: 12, openAngle: 1.06, closedAngle: 0.26, yOff: 0.0, delay: 0.0, pScale: 1.16, tex: petalOuterTex },
      ];

      whorls.forEach((w, wIdx) => {
        const pMat = new THREE.MeshPhysicalMaterial({
          map: w.tex,
          roughness: 0.42,
          metalness: 0.03,
          clearcoat: 0.12,
          sheen: 0.88,
          sheenColor: new THREE.Color("#ff788a"),
          emissive: new THREE.Color("#45040f"),
          emissiveIntensity: 0.22,
          side: THREE.DoubleSide,
        });
        disposableMaterials.push(pMat);

        for (let i = 0; i < w.count; i++) {
          const ringPivot = new THREE.Group();
          ringPivot.position.y = w.yOff;
          ringPivot.rotation.y =
            (i / w.count) * Math.PI * 2 + wIdx * 0.618 + (Math.random() - 0.5) * 0.12;

          const petalPivot = new THREE.Group();
          // Organic spiral twist for classic imbricated rose center
          petalPivot.rotation.z = (wIdx < 3 ? 0.14 : 0.06) * (i % 2 === 0 ? 1 : -0.6);
          const petalMesh = new THREE.Mesh(sharedPetalGeo, pMat);
          const varW = 0.92 + Math.random() * 0.16;
          const varH = 0.94 + Math.random() * 0.14;
          petalMesh.scale.set(w.pScale * varW, w.pScale * varH, w.pScale);
          petalPivot.add(petalMesh);
          ringPivot.add(petalPivot);
          group.add(ringPivot);

          petals.push({
            pivot: petalPivot,
            closedAngle: w.closedAngle,
            openAngle: w.openAngle + (Math.random() - 0.5) * 0.08,
            delay: w.delay,
          });
        }
      });

      const stamenGroup = new THREE.Group();

      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        const r = k % 2 === 0 ? 0.038 : 0.02;
        const stPivot = new THREE.Group();
        stPivot.rotation.y = a;
        stPivot.rotation.x = 0.25;

        const fil = new THREE.Mesh(sharedStamenGeo, stamenMat);
        fil.position.set(0, 0.06, r);
        const anther = new THREE.Mesh(sharedAntherGeo, stamenMat);
        anther.position.set(0, 0.13, r);
        stPivot.add(fil, anther);
        stamenGroup.add(stPivot);
      }

      group.add(stamenGroup);

      roses.push({
        group,
        petals,
        stamenGroup,
        baseScale: scale,
        appearAt,
        maxOpen,
      });
    };

    roseAnchors.forEach((ra) => {
      build3DRedRose(ra.pos, ra.dir, ra.scale, ra.appearAt, ra.maxOpen);
    });

    // Grand Royal Crown Red Rose at Trunk Apex
    const apex = centralCane.getPointAt(1);
    build3DRedRose(
      apex,
      new THREE.Vector3(0, 0.92, 0.38).normalize(),
      1.35,
      0.34,
      1.0
    );

    // 5. Floating Golden Stardust / Pollen Fireflies
    const fireflyCount = 48;
    const fireflyPositions = new Float32Array(fireflyCount * 3);
    const fireflySeeds = Array.from({ length: fireflyCount }, () => ({
      baseX: (Math.random() - 0.5) * 3.6,
      baseY: 0.7 + Math.random() * 2.9,
      baseZ: (Math.random() - 0.5) * 2.6,
      speed: 0.55 + Math.random() * 1.0,
      phase: Math.random() * Math.PI * 2,
    }));
    const fireflyGeo = new THREE.BufferGeometry();
    fireflyGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(fireflyPositions, 3)
    );
    const fireflyMat = new THREE.PointsMaterial({
      map: glowSpriteTex,
      size: 0.13,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const fireflies = new THREE.Points(fireflyGeo, fireflyMat);
    scene.add(fireflies);
    disposableGeometries.push(fireflyGeo);
    disposableMaterials.push(fireflyMat);

    const handleResize = () => {
      if (!container) {
return;
}

      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    const spawnFallingLeaf = (sourceLeaf: AttachedLeaf) => {
      const worldPos = new THREE.Vector3();
      const worldQuat = new THREE.Quaternion();
      sourceLeaf.mesh.getWorldPosition(worldPos);
      sourceLeaf.mesh.getWorldQuaternion(worldQuat);

      const mat = new THREE.MeshStandardMaterial({
        map: leafTex.map,
        bumpMap: leafTex.bumpMap,
        bumpScale: 0.02,
        color: sourceLeaf.material.color.clone(),
        roughness: 0.38,
        metalness: 0.06,
        transparent: true,
        opacity: 0.96,
        side: THREE.DoubleSide,
      });
      disposableMaterials.push(mat);

      const mesh = new THREE.Mesh(sharedLeafGeo, mat);
      mesh.position.copy(worldPos);
      mesh.quaternion.copy(worldQuat);
      mesh.scale.copy(sourceLeaf.mesh.scale);
      scene.add(mesh);

      fallingParticles.push({
        mesh,
        material: mat,
        vx: (Math.random() - 0.35) * 0.008,
        vy: -(0.007 + Math.random() * 0.008),
        vz: (Math.random() - 0.5) * 0.007,
        spinX: (Math.random() - 0.5) * 0.04,
        spinY: (Math.random() - 0.5) * 0.05,
        spinZ: (Math.random() - 0.5) * 0.04,
        swayPhase: Math.random() * Math.PI * 2,
        alpha: 0.96,
      });
    };

    const spawnFallingRosePetal = () => {
      if (roses.length === 0) {
return;
}

      const sourceRose = roses[Math.floor(Math.random() * roses.length)];
      const worldPos = new THREE.Vector3();
      sourceRose.group.getWorldPosition(worldPos);
      worldPos.x += (Math.random() - 0.5) * 0.35;
      worldPos.z += (Math.random() - 0.5) * 0.35;

      const mat = fallingPetalMatBase.clone();
      disposableMaterials.push(mat);
      const mesh = new THREE.Mesh(sharedPetalGeo, mat);
      mesh.position.copy(worldPos);
      mesh.rotation.set(Math.random(), Math.random() * Math.PI, Math.random());
      mesh.scale.setScalar(0.65 + Math.random() * 0.35);
      scene.add(mesh);

      fallingParticles.push({
        mesh,
        material: mat,
        vx: (Math.random() - 0.3) * 0.007,
        vy: -(0.006 + Math.random() * 0.006),
        vz: (Math.random() - 0.5) * 0.006,
        spinX: (Math.random() - 0.5) * 0.035,
        spinY: (Math.random() - 0.5) * 0.045,
        spinZ: (Math.random() - 0.5) * 0.035,
        swayPhase: Math.random() * Math.PI * 2,
        alpha: 0.95,
      });
    };

    const startPerf = performance.now();
    let lastPetalFallMs = 0;
    let rafId = 0;

    const animate = (now: number) => {
      const p = progressRef.current;
      const tSec = (now - startPerf) / 1000;

      // Subtle cinematic 3D orbit & gentle wind sway
      const orbitAngle = Math.sin(tSec * 0.25) * 0.38;
      camera.position.x = Math.sin(orbitAngle) * 7.6;
      camera.position.z = Math.cos(orbitAngle) * 7.6;
      camera.position.y = 1.3 + p * 0.28;
      camera.lookAt(0, 1.38, 0);

      rootGroup.rotation.z = Math.sin(tSec * 1.05) * 0.014 * clamp01(p * 2);

      // 1. Grow 3D roots, canes & branches
      for (let i = 0; i < growingTubes.length; i++) {
        const gt = growingTubes[i];
        const gp = segmentProgress(p, gt.startAt, gt.endAt);
        const count = Math.floor(gp * gt.totalIndices);
        gt.mesh.geometry.setDrawRange(0, count - (count % 3));
      }

      // 2. Grow rose thorns
      for (let i = 0; i < thorns.length; i++) {
        const th = thorns[i];
        const tp = segmentProgress(p, th.appearAt, th.appearAt + 0.08);
        th.mesh.scale.setScalar(Math.max(0.001, th.baseScale * tp));
      }

      // 3. Grow glossy compound leaves -> partial shedding while staying lush
      const autumnBlend = clamp01((p - 0.58) / 0.32);

      for (let i = 0; i < attachedLeaves.length; i++) {
        const lf = attachedLeaves[i];
        const grow = segmentProgress(p, lf.appearAt, lf.appearAt + 0.14);

        if (lf.detachAt !== null && !lf.detached && p >= lf.detachAt) {
          lf.detached = true;
          lf.mesh.visible = false;
          spawnFallingLeaf(lf);
        }

        if (!lf.detached) {
          lf.mesh.scale.setScalar(Math.max(0.001, lf.baseScale * grow));
          lf.mesh.rotation.x =
            lf.targetRotX + Math.sin(tSec * 1.6 + i) * 0.04;

          if (lf.detachAt !== null) {
            const targetCol = i % 2 === 0 ? shedCrimsonTint : shedAmberTint;
            lf.material.color
              .copy(glossyLeafTint)
              .lerp(targetCol, autumnBlend * 0.72);
          }
        }
      }

      // 4. Bloom 5-whorl 3D Red Roses
      const wilt = clamp01((p - 0.86) / 0.14);

      for (let i = 0; i < roses.length; i++) {
        const r = roses[i];
        const budGrow = segmentProgress(p, r.appearAt, r.appearAt + 0.14);
        r.group.scale.setScalar(Math.max(0.001, r.baseScale * budGrow));

        for (let k = 0; k < r.petals.length; k++) {
          const pt = r.petals[k];
          const openP =
            segmentProgress(
              p,
              r.appearAt + 0.04 + pt.delay,
              r.appearAt + 0.25 + pt.delay
            ) * r.maxOpen;
          pt.pivot.rotation.x =
            pt.closedAngle +
            (pt.openAngle - pt.closedAngle) * openP +
            wilt * 0.1;
        }

        r.stamenGroup.scale.setScalar(
          Math.max(
            0.01,
            segmentProgress(p, r.appearAt + 0.1, r.appearAt + 0.28) * r.maxOpen
          )
        );
      }

      // 5. Gentle falling red rose petals alongside falling leaves
      if (p > 0.66 && now - lastPetalFallMs > 950 && fallingParticles.length < 70) {
        spawnFallingRosePetal();
        lastPetalFallMs = now;
      }

      for (let i = fallingParticles.length - 1; i >= 0; i--) {
        const fp = fallingParticles[i];
        fp.swayPhase += 0.038;
        fp.mesh.position.x += fp.vx + Math.sin(fp.swayPhase) * 0.01;
        fp.mesh.position.y += fp.vy;
        fp.mesh.position.z += fp.vz + Math.cos(fp.swayPhase * 0.8) * 0.007;

        fp.mesh.rotation.x += fp.spinX;
        fp.mesh.rotation.y += fp.spinY;
        fp.mesh.rotation.z += fp.spinZ;

        if (fp.mesh.position.y < -0.5) {
          fp.alpha -= 0.016;
          fp.material.opacity = Math.max(0, fp.alpha);
        }

        if (fp.alpha <= 0.02 || fp.mesh.position.y < -2.4) {
          scene.remove(fp.mesh);
          fallingParticles.splice(i, 1);
        }
      }

      // 6. Golden Pollen Fireflies
      const posAttr = fireflyGeo.getAttribute("position") as THREE.BufferAttribute;

      for (let i = 0; i < fireflyCount; i++) {
        const s = fireflySeeds[i];
        posAttr.setXYZ(
          i,
          s.baseX + Math.sin(tSec * s.speed + s.phase) * 0.3,
          s.baseY + Math.cos(tSec * s.speed * 0.8 + s.phase) * 0.24,
          s.baseZ + Math.sin(tSec * s.speed * 0.6 + s.phase) * 0.26
        );
      }

      posAttr.needsUpdate = true;
      fireflyMat.opacity = segmentProgress(p, 0.32, 0.6) * 0.8;

      crownGlow.intensity =
        1.5 + segmentProgress(p, 0.3, 0.64) * 2.1 - wilt * 0.4;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      disposableTextures.forEach((t) => t.dispose());
      renderer.dispose();

      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [active]);

  if (!active) {
return null;
}

  const fadeOpacity =
    remainingMs !== undefined && remainingMs <= 3_000
      ? Math.max(0, remainingMs / 3_000)
      : 1;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-20 h-full w-full transition-opacity duration-150"
      style={{ opacity: fadeOpacity }}
    />
  );
}
