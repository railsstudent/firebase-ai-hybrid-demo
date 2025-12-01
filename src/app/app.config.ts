import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

import { provideFirebaseAILogic } from './ai/providers/firebase.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideFirebaseAILogic(),
  ]
};
