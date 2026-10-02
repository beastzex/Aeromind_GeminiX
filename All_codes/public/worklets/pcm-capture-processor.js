// AudioWorkletProcessor: forwards raw mic frames (Float32, mono) to the main
// thread. Resampling to the target rate happens at the AudioContext level
// (created with the desired sampleRate), so this stays a dumb passthrough.
class PcmCaptureProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    const channel = input && input[0];
    if (channel && channel.length > 0) {
      // Float32Array from the render quantum is reused by the audio thread —
      // copy it before posting, since postMessage transfer would otherwise
      // detach a buffer the engine still owns.
      this.port.postMessage(channel.slice(0));
    }
    return true;
  }
}

registerProcessor('pcm-capture-processor', PcmCaptureProcessor);
