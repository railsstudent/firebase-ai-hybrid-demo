import { SpeechService } from '@/ai/services/speech.service';
import { inject, Injectable, OnDestroy, signal } from '@angular/core';

// The maximum value of a 16-bit signed integer, used for normalizing audio samples.
const INT16_MAX_VALUE = 32768;

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService implements OnDestroy  {
  private audioCtx: AudioContext | undefined = undefined;
  private speechService = inject(SpeechService);

  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];

  playbackRate = signal(1);

  async playStream(text: string) {
      this.stopAll();

      this.playbackRate.set(this.setRandomPlaybackRate());

      try {
        const { stream } = await this.speechService.generateAudioStream(text);
        for await (const audioChunk of stream) {
          if (audioChunk.type === 'metadata') {
            this.initializeAudioContext(audioChunk.payload.sampleRate);
          } else if (audioChunk.type === 'data') {
            if (!this.audioCtx) {
              console.warn("Audio data received before metadata. Skipping chunk.");
              continue;
            }
            this.processChunk(audioChunk.payload.buffer.data);

          }
        }
      } catch (error) {
        console.error('Failed to play audio stream:', error);
        // Optionally, reset state or notify the user
        this.stopAll();
      }
  }

  private stopAll() {
    this.activeSources.forEach(sourceNode => {
      try {
        sourceNode.stop();
        sourceNode.disconnect();
      } catch (e) {
        // It's common for stop() to be called on a node that has already finished.
        // We can safely ignore these "InvalidStateError" exceptions.
      }
    });

    this.activeSources = [];
    this.nextStartTime = 0;
    if (this.audioCtx) {
      this.audioCtx?.close();
      this.audioCtx = undefined;
    }
  }

  private processChunk(rawData: number[]) {
    const float32Data = this.normalizeSoundSamples(rawData);
    if (float32Data.length === 0 || !this.audioCtx) {
      return;
    }

    const buffer = this.audioCtx.createBuffer(1, float32Data.length, this.audioCtx.sampleRate);
    buffer.copyToChannel(float32Data, 0);

    const sourceNode = this.connectSource(buffer);
    sourceNode.playbackRate.value = this.playbackRate();

    const playTime = Math.max(this.nextStartTime, this.audioCtx.currentTime);
    sourceNode.start(playTime);

    const actualDuration = buffer.duration / this.playbackRate();
    this.nextStartTime = playTime + actualDuration;
  }

  private normalizeSoundSamples(rawData: number[]) {
    const rawBuffer = new Uint8Array(rawData).buffer;

    // Ensure the buffer has an even number of bytes to create a valid Int16Array view.
    const byteLength = rawBuffer.byteLength % 2 === 0 ? rawBuffer.byteLength : rawBuffer.byteLength - 1;
    if (byteLength === 0) {
      return new Float32Array(0);
    }

    const int16Data = new Int16Array(rawBuffer, 0, byteLength / 2);
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
      float32Data[i] = (int16Data[i] * 1.0) / INT16_MAX_VALUE;
    }
    return float32Data;
  }

  private setRandomPlaybackRate(min = 0.85, max = 1.3) {
    const rawRate = Math.random() * (max - min) + min;
    return Math.round(rawRate * 100) / 100;
  }

  private connectSource(buffer: AudioBuffer) {
    if (!this.audioCtx) {
      throw new Error("Audio context is not initialized.");
    }

    const sourceNode = this.audioCtx.createBufferSource();
    sourceNode.buffer = buffer;
    sourceNode.connect(this.audioCtx.destination);

    this.activeSources.push(sourceNode);

    // Cleanup: Remove from array when this specific chunk finishes playing
    sourceNode.onended = () => {
      const index = this.activeSources.indexOf(sourceNode);
      if (index >= 0) {
        this.activeSources.splice(index, 1);
      }
    };

    return sourceNode;
  }

  private initializeAudioContext(sampleRate: number) {
    // Ensure any old context is closed before creating a new one.
    if (this.audioCtx) {
      this.audioCtx.close();
    }

    this.audioCtx = new AudioContext({ sampleRate });
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    this.nextStartTime = this.audioCtx.currentTime;
  }

  ngOnDestroy(): void {
    this.stopAll();
    this.audioCtx?.close();
  }
}
