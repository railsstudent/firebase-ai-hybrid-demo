import { inject, Injectable } from '@angular/core';
import { AI_MODEL } from '../constants/firebase.constant';
import { fileToGenerativePart } from '../fileToPart.util';
import { ImageAnalysis } from '../types/image-analysis.type';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService  {
    private aiModel = inject(AI_MODEL);
    
    async generateAltText(image: File): Promise<ImageAnalysis> {
        if (!image) {
            throw Error('image is required to generate texts.');
        }

        console.log(image);
        const imagePart = await fileToGenerativePart(image);
        console.log(imagePart);
        
        const altTextPrompt = `Generate an alternative text for the image provided, max 200 characters, and at least 3 tags.`;
        const result = await this.aiModel.generateContent([altTextPrompt, imagePart]);

        if (result?.response) {
          const response = result.response;
          const text = response.text();
          console.log('text', text);
          const parsed: ImageAnalysis = JSON.parse(text);
          return parsed;
        }
        throw Error('No text generated.');
    }
}
