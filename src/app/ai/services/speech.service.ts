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
}
