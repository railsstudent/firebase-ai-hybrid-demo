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

        const altTextPrompt = `
You are asked to perform three tasks:
Task 1: Generate an alternative text for the image provided, max 125 characters.
Task 2: Generate at least 3 tags to describe the image.
Task 3: Based on the alternative text and tags, provide some suggestions to make the image more interestin and the reason to support them.
`
;
        const result = await this.aiModel.generateContent([altTextPrompt, imagePart]);

        if (result?.response) {
          const response = result.response;
          const thought = response.thoughtSummary()
          const text = response.text();
          console.log('text', text);
          console.log('thought', thought);
          const parsed: ImageAnalysis = JSON.parse(text);
          return parsed;
        }
        throw Error('No text generated.');
    }
}
