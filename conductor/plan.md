# Plan: Consolidate `app.bootstrap.ts` to `ConfigService`

This plan outlines the steps to migrate the Firebase initialization logic from `app.bootstrap.ts` into `ConfigService` and clean up the codebase.

## Proposed Changes

### 1. Refactor `ConfigService`

We will rewrite `src/app/features/ai/services/config.service.ts` to handle full Firebase initialization internally.

```typescript
import { inject, Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { connectFunctionsEmulator, Functions, getFunctions } from 'firebase/functions';
import { fetchAndActivate, getRemoteConfig, getValue, RemoteConfig } from 'firebase/remote-config';
import { catchError, lastValueFrom, throwError } from 'rxjs';
import remoteConfigDefaults from '@/firebase/remote_config_defaults.json';
import config from '@/public/config.json';
import { FirebaseConfigResponse } from '../types/firebase-config.type';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private http = inject(HttpClient);
  
  remoteConfig: RemoteConfig | undefined = undefined;
  firebaseApp: FirebaseApp | undefined = undefined;
  functions: Functions | undefined = undefined;

  async initialize(): Promise<void> {
    try {
      const firebaseConfig = await this.loadFirebaseConfig();
      const { app, recaptchaSiteKey } = firebaseConfig;
      this.firebaseApp = initializeApp(app);
      
      this.remoteConfig = await this.fetchRemoteConfig(this.firebaseApp);

      if (recaptchaSiteKey) {
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
        initializeAppCheck(this.firebaseApp, {
          provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
          isTokenAutoRefreshEnabled: true,
        });
      }

      const functionRegion = getValue(this.remoteConfig, 'functionRegion').asString();
      this.functions = getFunctions(this.firebaseApp, functionRegion);
      console.log('ConfigService -> functions region', this.functions.region);
      this.connectEmulators(this.functions, this.remoteConfig);
    } catch (err) {
      console.error('Failed to initialize Firebase configurations in ConfigService:', err);
    }
  }

  private async fetchRemoteConfig(firebaseApp: FirebaseApp): Promise<RemoteConfig> {
    const remoteConfig = getRemoteConfig(firebaseApp);
    remoteConfig.settings.minimumFetchIntervalMillis = isDevMode() ? 0 : 3600000;
    remoteConfig.defaultConfig = remoteConfigDefaults;
    await fetchAndActivate(remoteConfig);
    return remoteConfig;
  }

  private async loadFirebaseConfig(): Promise<FirebaseConfigResponse> {
    const firebaseConfig$ = this.http.get<FirebaseConfigResponse>(config.getFirebaseConfigUrl)
      .pipe(catchError((e) => throwError(() => e)));
    return lastValueFrom(firebaseConfig$);
  }

  private connectEmulators(functions: Functions, remoteConfig: RemoteConfig): void {
    if (location.hostname === 'localhost') {
      const host = getValue(remoteConfig, 'functionEmulatorHost').asString();
      const port = getValue(remoteConfig, 'functionEmulatorPort').asNumber();
      console.log('functionEmulator', `${host}:${port}`);
      connectFunctionsEmulator(functions, host, port);
    }
  }
}
```

### 2. Update `app.config.ts`

We will rewrite `src/app/app.config.ts` to call the initialization method on `ConfigService`.

```typescript
import { ApplicationConfig, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideFirebase } from './features/ai/providers/firebase.provider';
import { ConfigService } from './features/ai/services/config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(async () => {
      const configService = inject(ConfigService);
      await configService.initialize();
    }),
    provideFirebase(),
  ]
};
```

### 3. Remove `app.bootstrap.ts`

Delete `src/app/app.bootstrap.ts` since its functionality has been consolidated into the service.
