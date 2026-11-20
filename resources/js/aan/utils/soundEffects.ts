// Procedural Web Audio API sound effects for Countdown (1-2-3) and Fireworks

let sharedCtx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
let masterCompressor: DynamicsCompressorNode | null = null;
let fireworksGainNode: GainNode | null = null;
let fireworksVolumeLevel = 1;
let lastLaunchSfxMs = 0;
let lastBurstSfxMs = 0;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
return null;
}

  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioCtx) {
return null;
}

  if (!sharedCtx) {
    sharedCtx = new AudioCtx();
    masterCompressor = sharedCtx.createDynamicsCompressor();
    masterCompressor.threshold.setValueAtTime(-14, sharedCtx.currentTime);
    masterCompressor.knee.setValueAtTime(18, sharedCtx.currentTime);
    masterCompressor.ratio.setValueAtTime(6, sharedCtx.currentTime);
    masterCompressor.attack.setValueAtTime(0.004, sharedCtx.currentTime);
    masterCompressor.release.setValueAtTime(0.22, sharedCtx.currentTime);
    masterCompressor.connect(sharedCtx.destination);

    fireworksGainNode = sharedCtx.createGain();
    fireworksGainNode.gain.setValueAtTime(
      fireworksVolumeLevel,
      sharedCtx.currentTime
    );
    fireworksGainNode.connect(masterCompressor);
  }

  return sharedCtx;
}

function getMasterOutput(ctx: AudioContext): AudioNode {
  return masterCompressor ?? ctx.destination;
}

function getFireworksOutput(ctx: AudioContext): AudioNode {
  return fireworksGainNode ?? getMasterOutput(ctx);
}

/**
 * Smoothly adjusts the fireworks SFX bus level (0..1) without cutting active tails.
 */
export function setFireworksVolume(level: number): void {
  const clamped = Math.max(0, Math.min(1, level));
  fireworksVolumeLevel = clamped;

  if (sharedCtx && fireworksGainNode) {
    fireworksGainNode.gain.setTargetAtTime(
      clamped,
      sharedCtx.currentTime,
      0.08
    );
  }
}

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) {
    return noiseBuffer;
  }

  const length = ctx.sampleRate * 1.5;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // Slightly warmer pink-tinted random noise
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;

  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    data[i] = Math.max(-1, Math.min(1, (b0 + b1 + b2 + white * 0.1848) * 0.22));
  }

  noiseBuffer = buffer;

  return buffer;
}

export function unlockSoundEngine(): void {
  const ctx = getAudioContext();

  if (!ctx) {
return;
}

  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

function withRunningContext(fn: (ctx: AudioContext) => void): void {
  const ctx = getAudioContext();

  if (!ctx) {
return;
}

  if (ctx.state === "running") {
    fn(ctx);

    return;
  }

  ctx
    .resume()
    .then(() => {
      if (ctx.state === "running") {
        fn(ctx);
      }
    })
    .catch(() => {});
}

/**
 * Luxury cinematic countdown beat: deep sub-pulse + ascending golden crystal chime.
 */
export function playCountdownChime(step: number): void {
  withRunningContext((ctx) => {
    const now = ctx.currentTime;
    const output = getMasterOutput(ctx);

    // 1. Deep cinematic sub-bass pulse
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(92, now);
    subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.34);
    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.32, now + 0.018);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    subOsc.connect(subGain);
    subGain.connect(output);
    subOsc.start(now);
    subOsc.stop(now + 0.44);

    // 2. Ascending luxury crystal chime (1 -> C5, 2 -> D5, 3 -> G5)
    const noteMap: Record<number, number> = {
      1: 523.25,
      2: 587.33,
      3: 783.99,
    };
    const baseFreq = noteMap[step] ?? 523.25;

    const partials = [
      { ratio: 1, amp: 0.2, decay: 0.95 },
      { ratio: 2, amp: 0.075, decay: 0.65 },
      { ratio: 1.5, amp: step === 3 ? 0.08 : 0.03, decay: 0.8 },
    ];

    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq * p.ratio, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(p.amp, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + p.decay);

      osc.connect(gain);
      gain.connect(output);
      osc.start(now);
      osc.stop(now + p.decay + 0.03);
    });
  });
}

/**
 * Spatial ascending firework shell whistle/whoosh.
 */
export function playFireworkLaunch(pan = 0): void {
  if (fireworksVolumeLevel <= 0.015) {
return;
}

  const nowMs = performance.now();

  if (nowMs - lastLaunchSfxMs < 160) {
return;
}

  lastLaunchSfxMs = nowMs;

  withRunningContext((ctx) => {
    const now = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.setValueAtTime(3.2, now);
    filter.frequency.setValueAtTime(480, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + 0.36);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.095, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(Math.max(-0.85, Math.min(0.85, pan)), now);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(getFireworksOutput(ctx));

    noise.start(now);
    noise.stop(now + 0.44);
  });
}

/**
 * Spatial firework aerial explosion: deep boom + distant crackling sparks.
 */
export function playFireworkBurst(
  pattern: "chrysanthemum" | "willow" | "ring" | "double-peony",
  pan = 0
): void {
  if (fireworksVolumeLevel <= 0.015) {
return;
}

  const nowMs = performance.now();

  if (nowMs - lastBurstSfxMs < 110) {
return;
}

  lastBurstSfxMs = nowMs;

  withRunningContext((ctx) => {
    const now = ctx.currentTime;
    const output = getFireworksOutput(ctx);
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(Math.max(-0.85, Math.min(0.85, pan)), now);
    panner.connect(output);

    // 1. Low-end aerial pressure punch
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "triangle";
    subOsc.frequency.setValueAtTime(
      pattern === "double-peony" ? 128 : 108,
      now
    );
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.3);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.3, now + 0.01);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

    subOsc.connect(subGain);
    subGain.connect(panner);
    subOsc.start(now);
    subOsc.stop(now + 0.36);

    // 2. Reverberant explosion roar
    const boomNoise = ctx.createBufferSource();
    boomNoise.buffer = getNoiseBuffer(ctx);

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(950, now);
    lp.frequency.exponentialRampToValueAtTime(95, now + 0.72);

    const boomGain = ctx.createGain();
    boomGain.gain.setValueAtTime(0.001, now);
    boomGain.gain.linearRampToValueAtTime(0.42, now + 0.015);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.78);

    boomNoise.connect(lp);
    lp.connect(boomGain);
    boomGain.connect(panner);
    boomNoise.start(now);
    boomNoise.stop(now + 0.8);

    // 3. Staggered high-frequency sparkling crackles
    const crackleCount = pattern === "willow" ? 8 : 5;

    for (let i = 0; i < crackleCount; i++) {
      const delay = 0.09 + Math.random() * (pattern === "willow" ? 0.58 : 0.38);
      const t = now + delay;
      const pop = ctx.createBufferSource();
      pop.buffer = getNoiseBuffer(ctx);

      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.setValueAtTime(2400 + Math.random() * 1800, t);

      const popGain = ctx.createGain();
      popGain.gain.setValueAtTime(0.001, t);
      popGain.gain.linearRampToValueAtTime(0.055 + Math.random() * 0.04, t + 0.005);
      popGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.065);

      pop.connect(hp);
      hp.connect(popGain);
      popGain.connect(panner);
      pop.start(t, Math.random() * 0.5, 0.08);
    }
  });
}
