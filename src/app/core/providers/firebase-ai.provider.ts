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
                    mode: 'prefer_on_device',
                    inCloudParams: {
                        model: 'gemini-2.5-flash',
                        generationConfig: {
                            responseMimeType: 'application/json',
                            responseSchema: ImageAnalysisSchema
                        },
                    },
                    onDeviceParams: {
                        promptOptions: {
                          responseConstraint: ImageAnalysisSchema,
                        },
                        createOptions: {
                            initialPrompts: [
                                {
                                    role: 'system',
                                    content: [
                                        {
                                            type: 'text',
                                            value: 'You are a helpful assistant that can generate alternative text and tags for an image.'
                                        }
                                    ]
                                },
                            ],
                        }
                    }             
                });
            }
        }
    ]);
}
