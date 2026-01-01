import { constructBlobURL } from '@/photo-panel/blob.util';
import { inject, Injectable } from '@angular/core';
import { Functions, httpsCallable } from 'firebase/functions';
import { SerializedBuffer } from '../types/serialized-buffer.type';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class SpeechService  {
    private configService = inject(ConfigService);

    private get functions(): Functions {
      if (!this.configService.functions) {
        throw new Error('Firebase Functions has not been initialized.');
      }
      return this.configService.functions;
    }

    async generateAudio(text: string) {
      const readFactFunction = httpsCallable<string, string>(
        this.functions, 'textToAudio-readFact'
      );

      const { data: audioUri } = await readFactFunction(text);
      return audioUri;
    }

    async generateAudioStream(text: string) {
      const readFactStreamFunction = httpsCallable<string, number[] | undefined, SerializedBuffer>(
        this.functions, 'textToAudio-readFact'
      );

      return readFactStreamFunction.stream(text);
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

      return constructBlobURL(audioParts);
    }
}
