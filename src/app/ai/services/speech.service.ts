import { inject, Injectable } from '@angular/core';
import { httpsCallable } from 'firebase/functions';
import { AI_MODEL } from '../constants/firebase.constant';
import { ConfigService } from './config.service';

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
      const readFactFunction = httpsCallable<string, ArrayBuffer, ArrayBuffer>(functions, 'textToAudio-readFact');

      const audioBuffer: ArrayBuffer[] = [];
      const { stream, data } = await readFactFunction.stream(text);
      for await (const audioChunk of stream) {
        if (audioChunk) {
          audioBuffer.push(audioChunk);
        }
      }

      const finalChunk = await data;
      if (finalChunk) {
        audioBuffer.push(finalChunk);
      }

      const combined = await new Blob(audioBuffer).arrayBuffer();
      const blobUrl = URL.createObjectURL(new Blob([combined], { type: 'audio/wav' }));
      return blobUrl;
    }
}
