import { inject, Injectable } from '@angular/core';
import { GEMINI_MODEL } from '../../core/constants/firebase.constant';
import { blobToGenerativePart } from '../blobToPart.util';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService  {
    geminiModel = inject(GEMINI_MODEL);
    
    async generateTexts(image: Blob) {
        if (!image) {
            throw Error('image is required to generate texts.');
        }

        const imagePart = await blobToGenerativePart(image);        
        const imagePrompt = `Generate a least three tags and the alternative text for the image provided.`;
        const result = await this.geminiModel.generateContent([imagePrompt, imagePart]);

        if (result?.response) {
          const response = result.response;
          const reult = response.text();
          console.log(reult);
          return reult;
        }
        throw Error('No text generated.');
    }    
}
