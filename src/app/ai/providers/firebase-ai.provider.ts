import { makeEnvironmentProviders } from '@angular/core';
import { GenerationConfig, getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { FirebaseApp, initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import firebaseConfig from '../../firebase.json';
import { AI_MODEL } from '../constants/firebase.constant';
import { ImageAnalysisSchema } from '../schemas/image-analysis.schema';

function initAppCheckWithRecaptcha(firebaseApp: FirebaseApp) {
  (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = firebaseConfig?.appCheckDebugToken || firebaseConfig.isFirebaseAppCheckDebugMode;

  // Initialize Firebase App Check
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(firebaseConfig.recaptchaEnterpriseSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export function provideFirebaseAiLogic() {
    return makeEnvironmentProviders([
        {
            provide: AI_MODEL,
            useFactory: () => {
                const { model, app } = firebaseConfig
                const firebaseApp = initializeApp(app);
                initAppCheckWithRecaptcha(firebaseApp)

                const generationConfig: GenerationConfig = {
                    responseMimeType: 'application/json',
                    responseSchema: ImageAnalysisSchema,
                    thinkingConfig: {
                      includeThoughts: true,
                      thinkingBudget: 512,
                    }
                };

                // Initialize the Gemini Developer API backend service
                const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

                return getGenerativeModel(ai, {
                    model,
                    generationConfig,
                });
            }
        }
    ]);
}
