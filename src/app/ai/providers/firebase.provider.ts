import { makeEnvironmentProviders } from '@angular/core';
import { GenerationConfig, getAI, getGenerativeModel, VertexAIBackend } from 'firebase/ai';
import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import firebaseConfig from '../../firebase.json';
import { AI_MODEL } from '../constants/firebase.constant';
import { ImageAnalysisSchema } from '../schemas/image-analysis.schema';

export function provideFirebaseAiLogic() {
    return makeEnvironmentProviders([
        {
            provide: AI_MODEL,
            useFactory: () => {
              const { model, app } = firebaseConfig

              console.log('model', model);
              const firebaseApp = initializeApp(app);

              // Initialize Firebase App Check
              initializeAppCheck(firebaseApp, {
                provider: new ReCaptchaEnterpriseProvider(firebaseConfig.recaptchaEnterpriseSiteKey),
                isTokenAutoRefreshEnabled: true,
              });

              const generationConfig: GenerationConfig = {
                  responseMimeType: 'application/json',
                  responseSchema: ImageAnalysisSchema,
                  thinkingConfig: {
                    includeThoughts: true,
                    thinkingBudget: 512,
                  }
              };

              const ai = getAI(firebaseApp, { backend: new VertexAIBackend('global') });

              return getGenerativeModel(ai, {
                  model,
                  generationConfig,
                  tools: [{ googleSearch: {} }]
              });
            }
        }
    ]);
}
