import * as THREE from "three";

/**
 * Generates a tapered 3D organic tube along a CatmullRomCurve3.
 * Vertex indices are ordered monotonically along the curve so setDrawRange()
 * animates natural tip-to-tip 3D growth cleanly.
 */
export function createTaperedTubeGeometry(
  curve: THREE.CatmullRomCurve3,
  tubularSegments: number,
  radialSegments: number,
  startRadius: number,
  endRadius: number,
  organicWobble = 0.08
): THREE.BufferGeometry {
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const vertex = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let i = 0; i <= tubularSegments; i++) {
    const u = i / tubularSegments;
    const p = curve.getPointAt(u);
    const N = frames.normals[i];
    const B = frames.binormals[i];

    // Smooth non-linear organic taper
    const radius =
      endRadius + (startRadius - endRadius) * Math.pow(1 - u, 0.72);

    for (let j = 0; j <= radialSegments; j++) {
      const v = (j / radialSegments) * Math.PI * 2;
      const sin = Math.sin(v);
      const cos = -Math.cos(v);

      // Subtle bark/ridge asymmetry
      const ridge =
        1 +
        organicWobble *
          Math.sin(v * 3 + u * 9) *
          (1 - u * 0.6);

      normal.x = cos * N.x + sin * B.x;
      normal.y = cos * N.y + sin * B.y;
      normal.z = cos * N.z + sin * B.z;
      normal.normalize();

      const r = radius * ridge;
      vertex.x = p.x + r * normal.x;
      vertex.y = p.y + r * normal.y;
      vertex.z = p.z + r * normal.z;

      positions.push(vertex.x, vertex.y, vertex.z);
      normals.push(normal.x, normal.y, normal.z);
      uvs.push(j / radialSegments, u);
    }
  }

  const stride = radialSegments + 1;

  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));

  return geometry;
}

/**
 * Generates a realistic 3D serrated rose leaf with V-folded midrib and arched droop.
 * Base rests at (0, 0, 0) and tip extends along +Y.
 */
export function createSculptedLeafGeometry(
  length = 0.55,
  maxWidth = 0.24
): THREE.BufferGeometry {
  const lengthSegs = 16;
  const widthSegs = 6;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= lengthSegs; i++) {
    const v = i / lengthSegs; // 0 = stem base, 1 = pointed tip
    // Ovate rose-leaflet silhouette with delicate serrated margin teeth
    const baseProfile =
      Math.sin(Math.pow(v, 0.68) * Math.PI) * (1 - 0.14 * v);
    const serration =
      v > 0.14 && v < 0.94
        ? 1 + 0.065 * Math.sin(v * Math.PI * 16)
        : 1;
    const halfW = maxWidth * 0.5 * baseProfile * serration;

    // Gentle natural arch along leaf length
    const archZ =
      Math.sin(v * Math.PI * 0.85) * length * 0.16 -
      Math.pow(v, 2.3) * length * 0.22;

    for (let j = 0; j <= widthSegs; j++) {
      const uNorm = (j / widthSegs) * 2 - 1; // -1..1 across leaf width
      const x = uNorm * halfW;
      const y = v * length;
      const crease = Math.abs(uNorm) * 0.048 * baseProfile;
      const z = archZ + crease;

      positions.push(x, y, z);
      uvs.push(j / widthSegs, v);
    }
  }

  const stride = widthSegs + 1;

  for (let i = 0; i < lengthSegs; i++) {
    for (let j = 0; j < widthSegs; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Generates a realistic velvety 3D rose petal (broad rounded top lobe with curled outer lip).
 */
export function createSculptedPetalGeometry(
  length = 0.44,
  maxWidth = 0.36,
  cupDepth = 0.11
): THREE.BufferGeometry {
  const lengthSegs = 14;
  const widthSegs = 10;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= lengthSegs; i++) {
    const v = i / lengthSegs;
    // Classic obovate / softly rounded rose petal silhouette (full top lobe, no sharp points)
    const widthProfile =
      v < 0.18
        ? 0.18 + (v / 0.18) * 0.54
        : Math.sin(Math.pow((v - 0.04) / 0.96, 0.68) * Math.PI * 0.94);
    const halfW = maxWidth * 0.5 * Math.max(0.05, widthProfile);

    // Concave belly + classic rolled outward rose-petal scroll at upper lip (v > 0.72)
    const bellyZ = Math.sin(v * Math.PI * 0.88) * cupDepth;
    const lipCurl = Math.pow(Math.max(0, v - 0.72) / 0.28, 2) * length * 0.18;

    for (let j = 0; j <= widthSegs; j++) {
      const uNorm = (j / widthSegs) * 2 - 1;
      const x = uNorm * halfW;
      // Subtle heart-shaped notch dip at top center + rounded shoulders
      const shoulderLift =
        v > 0.8 ? (1 - Math.abs(uNorm)) * -0.015 * length : 0;
      const y = v * length + shoulderLift;

      // Bowl cup across width + rolled rim edge curl
      const cupZ = (1 - uNorm * uNorm) * cupDepth * 0.72 * Math.sin(v * Math.PI);
      const edgeWave =
        v > 0.7 ? Math.sin(uNorm * Math.PI * 1.5) * 0.012 * (v - 0.7) * 3 : 0;
      const z = bellyZ + cupZ - lipCurl + edgeWave;

      positions.push(x, y, z);
      uvs.push(j / widthSegs, v);
    }
  }

  const stride = widthSegs + 1;

  for (let i = 0; i < lengthSegs; i++) {
    for (let j = 0; j < widthSegs; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + (j + 1);
      const d = i * stride + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();

  return geometry;
}
