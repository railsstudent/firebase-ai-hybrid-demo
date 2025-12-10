import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';

import { provideFirebase } from './ai/providers/firebase.provider';
import { bootstrapFirebase } from './app.bootstrap';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(async () => bootstrapFirebase()),
    provideFirebase(),
  ]
};
