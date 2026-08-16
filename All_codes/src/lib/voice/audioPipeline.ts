const CAPTURE_SAMPLE_RATE = 16000;
const PLAYBACK_SAMPLE_RATE = 24000;
// Batch worklet frames into ~100ms chunks before handing them off — small
// enough for low-latency streaming, large enough to keep message volume sane.
const CHUNK_SAMPLES = 1600;

function floatTo16BitPCM(samples: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }
  return buffer;
}

export interface MicCapture {
  stop: () => void;
}

/** Captures mic audio as 16kHz mono PCM16 chunks via an AudioWorklet. Throws
 * if getUserMedia / AudioWorklet aren't available or the user denies mic access. */
export async function startMicCapture(onChunk: (chunk: ArrayBuffer) => void): Promise<MicCapture> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Microphone capture is not supported in this browser.');
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
  });

  const audioContext = new AudioContext({ sampleRate: CAPTURE_SAMPLE_RATE });
  await audioContext.audioWorklet.addModule('/worklets/pcm-capture-processor.js');

  const source = audioContext.createMediaStreamSource(stream);
  const worklet = new AudioWorkletNode(audioContext, 'pcm-capture-processor');

  let pending: Float32Array = new Float32Array(0);

  worklet.port.onmessage = (event: MessageEvent<Float32Array>) => {
    const frame = event.data;
    const merged = new Float32Array(pending.length + frame.length);
    merged.set(pending);
    merged.set(frame, pending.length);

    let offset = 0;
    while (merged.length - offset >= CHUNK_SAMPLES) {
      const slice = merged.subarray(offset, offset + CHUNK_SAMPLES);
      onChunk(floatTo16BitPCM(slice));
      offset += CHUNK_SAMPLES;
    }
    pending = merged.subarray(offset);
  };

  source.connect(worklet);
  // Not connected to audioContext.destination — we only need the worklet
  // pipeline for capture, not to play the mic back out.

  return {
    stop: () => {
      worklet.port.onmessage = null;
      source.disconnect();
      worklet.disconnect();
      stream.getTracks().forEach((track) => track.stop());
      void audioContext.close();
    },
  };
}

/** Schedules incoming PCM16 audio chunks back-to-back for gapless playback. */
export class PlaybackQueue {
  private audioContext: AudioContext;
  private nextStartTime = 0;
  private activeSources = new Set<AudioBufferSourceNode>();

  constructor() {
    this.audioContext = new AudioContext({ sampleRate: PLAYBACK_SAMPLE_RATE });
  }

  enqueue(pcm16: ArrayBuffer): void {
    const view = new DataView(pcm16);
    const sampleCount = pcm16.byteLength / 2;
    const float32 = new Float32Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) {
      float32[i] = view.getInt16(i * 2, true) / 0x8000;
    }

    const buffer = this.audioContext.createBuffer(1, sampleCount, PLAYBACK_SAMPLE_RATE);
    buffer.copyToChannel(float32, 0);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);

    const startAt = Math.max(this.nextStartTime, this.audioContext.currentTime);
    source.start(startAt);
    this.nextStartTime = startAt + buffer.duration;

    this.activeSources.add(source);
    source.onended = () => this.activeSources.delete(source);
  }

  /** Stops any audio still queued — used when the user interrupts (barge-in). */
  clear(): void {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // already stopped
      }
    });
    this.activeSources.clear();
    this.nextStartTime = this.audioContext.currentTime;
  }

  close(): void {
    this.clear();
    void this.audioContext.close();
  }
}
