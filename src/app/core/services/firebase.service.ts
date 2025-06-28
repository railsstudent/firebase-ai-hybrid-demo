import { ImageAnalysis } from './../types/image-analysis.type';
import { inject, Injectable } from '@angular/core';
import { GEMINI_MODEL } from '../../core/constants/firebase.constant';
import { blobToGenerativePart } from '../blobToPart.util';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService  {
    private geminiModel = inject(GEMINI_MODEL);
    
    async generateTexts(image: Blob): Promise<ImageAnalysis> {
        if (!image) {
            throw Error('image is required to generate texts.');
        }

        const imagePart = await blobToGenerativePart(image);        
        const imagePrompt = `Generate a least three tags and the alternative text for the image provided.`;
        const result = await this.geminiModel.generateContent([imagePrompt, imagePart]);

        if (result?.response) {
          const response = result.response;
          const reult = response.text();
          const parsed: ImageAnalysis = JSON.parse(reult); // Validate JSON structure
          console.log(parsed);
          return parsed;
        }
        throw Error('No text generated.');
    }    
}
