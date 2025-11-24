import { inject, Injectable } from '@angular/core';
import { AI_MODEL } from '../constants/firebase.constant';
import { fileToGenerativePart } from '../fileToPart.util';
import { ImageAnalysis, ImageAnalysisResponse } from '../types/image-analysis.type';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService  {
    private aiModel = inject(AI_MODEL);

    async generateAltText(image: File): Promise<ImageAnalysisResponse> {
        if (!image) {
            throw Error('image is required to generate texts.');
        }

        const imagePart = await fileToGenerativePart(image);
        const altTextPrompt = `
You are asked to perform four tasks:
Task 1: Generate an alternative text for the image provided, max 125 characters.
Task 2: Generate at least 3 tags to describe the image.
Task 3: Based on the alternative text and tags, provide some suggestions to make the image more interestin and the reason to support them.
Task 4: Search for a surprising or obscure fact that interconnects the following tags. If a direct link doesn't exist, find a conceptual link between them.
`;
        const result = await this.aiModel.generateContent([altTextPrompt, imagePart]);

        if (result?.response) {
          const response = result.response;
          const thought = response.thoughtSummary() || '';
          const text = response.text();
          const parsed: ImageAnalysis = JSON.parse(text);
          const usageMetadata = response.usageMetadata;
          const tokenUsage = {
            input: usageMetadata?.promptTokenCount || 0,
            output: usageMetadata?.candidatesTokenCount || 0,
            thought: usageMetadata?.thoughtsTokenCount || 0,
            total: usageMetadata?.totalTokenCount || 0,
          };

          const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
          const googleSearchSuggestions = groundingMetadata?.searchEntryPoint?.renderedContent;

          return {
            parsed,
            thought,
            tokenUsage,
            googleSearchSuggestions,
          };
        }
        throw Error('No text generated.');
    }
}
