import { inject, makeEnvironmentProviders } from '@angular/core';
import { getAI, getGenerativeModel, VertexAIBackend } from 'firebase/ai';
import { FirebaseApp } from "firebase/app";
import { getValue, RemoteConfig } from 'firebase/remote-config';
import { AI_MODEL } from '../constants/firebase.constant';
import { ImageAnalysisSchema } from '../schemas/image-analysis.schema';
import { ConfigService } from '../services/config.service';

function getGenerativeAIModel(firebaseApp: FirebaseApp, remoteConfig: RemoteConfig) {
    const model = getValue(remoteConfig, 'geminiModelName').asString();
    const vertexAILocation = getValue(remoteConfig, 'vertexAILocation'). asString();
    const includeThoughts = getValue(remoteConfig, 'includeThoughts').asBoolean();
    const thinkingBudget = getValue(remoteConfig, 'thinkingBudget').asNumber();

    const ai = getAI(firebaseApp, { backend: new VertexAIBackend(vertexAILocation) });

    return getGenerativeModel(ai, {
        model,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: ImageAnalysisSchema,
          thinkingConfig: {
            includeThoughts,
            thinkingBudget,
          }
        },
        tools: [{
          googleSearch: {}
        }]
    });
}

export function provideFirebase() {
    return makeEnvironmentProviders([
        {
            provide: AI_MODEL,
            useFactory: () => {
              const configService = inject(ConfigService);

              if (!configService.remoteConfig) {
                console.error('Remote config does not exist.');
                return undefined;
              }

              if (!configService.firebaseApp) {
                console.error('Firebase App does not exist');
                return undefined;
              }

              return getGenerativeAIModel(configService.firebaseApp, configService.remoteConfig);
            }
        }
    ]);
}
