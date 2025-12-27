import { createTtsURL } from '@/photo-panel/blob.util';
import { inject, Injectable } from '@angular/core';
import { httpsCallable } from 'firebase/functions';
import { SerializedBuffer } from '../types/serialized-buffer.type';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class SpeechService  {
    private configService = inject(ConfigService);

    async generateAudio(text: string) {
      if (!this.configService.functions) {
        throw new Error('Functions not initialized');
      }

      const functions = this.configService.functions;
      const readFactFunction = httpsCallable<string, string>(functions, 'textToAudio-readFact');

      const { data: audioUri } = await readFactFunction(text);
      return audioUri;
    }

    async generateAudioStream(text: string) {
      if (!this.configService.functions) {
        throw new Error('Functions not initialized');
      }

      const functions = this.configService.functions;
      const readFactFunction = httpsCallable<string, number[] | undefined, SerializedBuffer>(
        functions, 'textToAudio-readFact'
      );

      return readFactFunction.stream(text);
    }

    async generateAudioBlobURL(text: string) {
      const { stream, data } = await this.generateAudioStream(text);

      const audioParts = [];
      for await (const audioChunk of stream) {
        if (audioChunk && audioChunk.data) {
          audioParts.push(new Uint8Array(audioChunk.data));
        }
      }

      const wavHeader = await data;
      if (wavHeader && wavHeader.length) {
        audioParts.unshift(new Uint8Array(wavHeader));
      }

      return createTtsURL(audioParts);
    }
}
