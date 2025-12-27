import { inject, Injectable } from '@angular/core';
import { httpsCallable } from 'firebase/functions';
import { AI_MODEL } from '../constants/firebase.constant';
import { ConfigService } from './config.service';
import { SerializedBuffer } from '../types/serialized-buffer.type';

@Injectable({
  providedIn: 'root'
})
export class SpeechService  {
    private aiModel = inject(AI_MODEL);
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
      const readFactFunction = httpsCallable<string, number[] | undefined, SerializedBuffer>(functions, 'textToAudio-readFact');

      const audioParts = [];
      const { stream, data } = await readFactFunction.stream(text);
      for await (const audioChunk of stream) {
        if (audioChunk && audioChunk.data) {
          audioParts.push(new Uint8Array(audioChunk.data));
        } else {
          audioParts.push(new Uint8Array(audioChunk as any));
        }
      }

      const wavHeader = await data;
      if (wavHeader && wavHeader.length) {
        audioParts.unshift(new Uint8Array(wavHeader));
      }

      const url = URL.createObjectURL(new Blob(audioParts, { type: 'audio/wav' }));
      console.log('Blob URL:', url);
      return url;
    }
}
