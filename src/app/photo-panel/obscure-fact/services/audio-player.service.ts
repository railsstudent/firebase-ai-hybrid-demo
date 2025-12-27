import { SpeechService } from '@/ai/services/speech.service';
import { inject, Injectable, OnDestroy } from '@angular/core';

const INT16_MAX_VALUE = 32768;

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService implements OnDestroy  {
  private audioCtx = new AudioContext({ sampleRate: 24000 });
  private speechService = inject(SpeechService);

  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];

  async playStream(text: string) {
      this.stopAll();

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.nextStartTime = this.audioCtx.currentTime;

      const { data, stream } = await this.speechService.generateAudioStream(text);
      for await (const audioChunk of stream) {
        if (audioChunk && audioChunk.data) {
          this.processChunk(audioChunk.data);
        }
      }

      await data;
  }

  private stopAll() {
    this.activeSources.forEach(source => {
      try {
        source.stop();
        source.disconnect();
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

    const source = this.connectSource(buffer);

    const playTime = Math.max(this.nextStartTime, this.audioCtx.currentTime);
    console.log("playTime", playTime);
    source.start(playTime);

    this.nextStartTime = playTime + buffer.duration;
  }

  private normalizeSoundSamples(rawData: number[]) {
    const uint8 = new Uint8Array(rawData);

    if (uint8.byteLength % 2 !== 0) {
      throw new Error('Odd chunk received');
    }

    const int16Data = new Int16Array(uint8.buffer, uint8.byteOffset, uint8.byteLength / 2);
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i=i+1) {
      float32Data[i] = (int16Data[i] * 1.0) / INT16_MAX_VALUE;
    }
    return float32Data;
  }

  private connectSource(buffer: AudioBuffer) {
    const source = this.audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioCtx.destination);

    this.activeSources.push(source);

    // Cleanup: Remove from array when this specific chunk finishes playing
    source.onended = () => {
      const index = this.activeSources.indexOf(source);
      if (index >= 0) {
        this.activeSources.splice(index, 1);
      }
    };

    return source;
  }

  ngOnDestroy(): void {
    this.stopAll();
  }
}
