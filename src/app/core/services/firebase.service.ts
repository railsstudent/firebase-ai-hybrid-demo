import { inject, Injectable } from '@angular/core';
import { GEMINI_MODEL } from '../../core/constants/firebase.constant';
import { fileToGenerativePart } from '../fileToPart.util';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService  {
    private geminiModel = inject(GEMINI_MODEL);
    
    async generateAltText(image: File): Promise<string> {
        if (!image) {
            throw Error('image is required to generate texts.');
        }

        console.log(image);
        const imagePart = await fileToGenerativePart(image);
        console.log(imagePart);
        
        const altTextPrompt = `Generate an alternative text for the image provided, max 200 characters.`;
        const result = await this.geminiModel.generateContent([altTextPrompt, imagePart]);

        if (result?.response) {
          const response = result.response;
          const text = response.text();
          console.log('text', text);
          return text;
        }
        throw Error('No text generated.');
    }

    async generateTags(image: File): Promise<string[]> {
      if (!image) {
          throw Error('image is required to generate texts.');
      }

      console.log(image);
      const imagePart = await fileToGenerativePart(image);
      console.log(imagePart);
      
      const imagePrompt = `Generate a least five tags, separated by the delimiter, |.`;
      const result = await this.geminiModel.generateContent([imagePrompt, imagePart]);

      if (result?.response) {
        const response = result.response;
        const strTags = response.text();
        console.log('strTags', strTags);
        return (strTags || '').split('|');
      }
      throw Error('No text generated.');
  }  
}
