/**
 * Encodes an AudioBuffer segment [startSec..endSec] into a compact mono 16-bit WAV File
 * entirely client-side using Web Audio API, so users with a full song don't need external tools.
 */
export async function sliceAudioWindowToWav(
  file: File,
  startSec: number,
  endSec: number
): Promise<File> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const audioCtx = new AudioCtx();

  try {
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);
    const sampleRate = Math.min(decoded.sampleRate, 22050);
    const clampedStart = Math.max(0, Math.min(startSec, decoded.duration - 1));
    const clampedEnd = Math.min(decoded.duration, Math.max(clampedStart + 1, endSec));
    const duration = clampedEnd - clampedStart;

    const offlineCtx = new OfflineAudioContext(
      1,
      Math.ceil(duration * sampleRate),
      sampleRate
    );
    const source = offlineCtx.createBufferSource();
    source.buffer = decoded;
    source.connect(offlineCtx.destination);
    source.start(0, clampedStart, duration);

    const rendered = await offlineCtx.startRendering();
    const samples = rendered.getChannelData(0);
    const wavBuffer = encodeMonoPcm16Wav(samples, sampleRate);

    return new File([wavBuffer], `segment-${file.name}.wav`, {
      type: "audio/wav",
    });
  } finally {
    await audioCtx.close().catch(() => {});
  }
}

function encodeMonoPcm16Wav(
  samples: Float32Array,
  sampleRate: number
): ArrayBuffer {
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}

function writeAscii(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
