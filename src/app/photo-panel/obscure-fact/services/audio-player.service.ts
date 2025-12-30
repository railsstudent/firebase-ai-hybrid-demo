import { SpeechService } from '@/ai/services/speech.service';
import { inject, Injectable, OnDestroy, signal } from '@angular/core';

const INT16_MAX_VALUE = 32768;

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService implements OnDestroy  {
  private audioCtx = new AudioContext({ sampleRate: 24000 });
  private speechService = inject(SpeechService);

  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];

  playbackRate = signal(1);

  async playStream(text: string) {
      this.stopAll();

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.nextStartTime = this.audioCtx.currentTime;
      this.playbackRate.set(this.setRandomPlaybackRate());

      const { data, stream } = await this.speechService.generateAudioStream(text);
      for await (const audioChunk of stream) {
        if (audioChunk && audioChunk.data) {
          this.processChunk(audioChunk.data);
        }
      }

      await data;
  }

  private stopAll() {
    this.activeSources.forEach(sourceNode => {
      try {
        sourceNode.stop();
        sourceNode.disconnect();
      } catch (e) {
        console.log(e);
      }
    });

    this.activeSources = [];
    this.nextStartTime = 0;
  }

  private processChunk(rawData: number[]) {
    const float32Data = this.normalizeSoundSamples(rawData);

    const buffer = this.audioCtx.createBuffer(1, float32Data.length, 24000);
    buffer.copyToChannel(float32Data, 0);

    const sourceNode = this.connectSource(buffer);
    sourceNode.playbackRate.value = this.playbackRate();

    const playTime = Math.max(this.nextStartTime, this.audioCtx.currentTime);
    sourceNode.start(playTime);

    const actualDuration = buffer.duration / this.playbackRate();
    this.nextStartTime = playTime + actualDuration;
  }

  private normalizeSoundSamples(rawData: number[]) {
    let uint8 = new Uint8Array(rawData);

    if (uint8.byteLength % 2 !== 0) {
      uint8 = uint8.slice(0, uint8.byteLength - 1);
    }

    const int16Data = new Int16Array(uint8.buffer, uint8.byteOffset, uint8.byteLength / 2);
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i=i+1) {
      float32Data[i] = (int16Data[i] * 1.0) / INT16_MAX_VALUE;
    }
    return float32Data;
  }

  private setRandomPlaybackRate(min = 0.85, max = 1.3) {
    const rawRate = Math.random() * (max - min) + min;
    return Math.round(rawRate * 100) / 100;
  }

  private connectSource(buffer: AudioBuffer) {
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

  ngOnDestroy(): void {
    this.stopAll();
  }
}
