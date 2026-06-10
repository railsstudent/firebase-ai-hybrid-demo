import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideFirebase } from './features/ai/providers/firebase.provider';
import { ConfigService } from './features/ai/services/config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(async () => {
      const configService = inject(ConfigService);
      await configService.initialize();
    }),
    provideFirebase(),
  ]
};
