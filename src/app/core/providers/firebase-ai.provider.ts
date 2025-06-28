import { makeEnvironmentProviders } from '@angular/core';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { initializeApp } from "firebase/app";
import firebaseConfig from '../../firebase-ai.json';
import { GEMINI_MODEL } from '../constants/firebase.constant';
import { ImageAnalysisSchema } from '../schemas/image-analysis.schema';

export function provideFirebaseAiLogic() {
    return makeEnvironmentProviders([
        {
            provide: GEMINI_MODEL,
            useFactory: () => {
                const { model, app } = firebaseConfig
                const firebaseApp = initializeApp(app);

                // Initialize the Gemini Developer API backend service
                const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

                return getGenerativeModel(ai, { 
                    model,
                    generationConfig: {
                        responseMimeType: 'application/json',
                        responseSchema: ImageAnalysisSchema
                    }                
                });
            }
        }
    ]);
}
