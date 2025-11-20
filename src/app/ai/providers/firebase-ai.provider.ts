import { makeEnvironmentProviders } from '@angular/core';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { FirebaseApp, initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import firebaseConfig from '../../firebase.json';
import { AI_MODEL } from '../constants/firebase.constant';
import { ImageAnalysisSchema } from '../schemas/image-analysis.schema';

function initAppCheckWithRecaptcha(firebaseApp: FirebaseApp) {
  (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = firebaseConfig?.appCheckDebugToken || firebaseConfig.isFirebaseAppCheckDebugMode;

  console.log((self as any).FIREBASE_APPCHECK_DEBUG_TOKEN);

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

                // Initialize the Gemini Developer API backend service
                const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });

                return getGenerativeModel(ai, {
                    model,
                    generationConfig: {
                      responseMimeType: 'application/json',
                      responseSchema: ImageAnalysisSchema
                    },
                    // mode: 'only_in_cloud',
                    // inCloudParams: {
                    //     model,
                    //     generationConfig: {
                    //         responseMimeType: 'application/json',
                    //         responseSchema: ImageAnalysisSchema
                    //     },
                    // },
                    // onDeviceParams: {
                    //     createOptions: {
                    //       expectedInputs: [
                    //         {
                    //           type: 'text',
                    //           languages: ['en'],
                    //         }
                    //       ],
                    //     },
                    //     promptOptions: {
                    //       responseConstraint: ImageAnalysisSchema,
                    //     }
                    // }
                });
            }
        }
    ]);
}
