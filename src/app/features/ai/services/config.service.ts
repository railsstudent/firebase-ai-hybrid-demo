import remoteConfigDefaults from '@/firebase/remote_config_defaults.json';
import config from '@/public/config.json';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, isDevMode } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { connectFunctionsEmulator, Functions, getFunctions } from 'firebase/functions';
import { fetchAndActivate, getRemoteConfig, getValue, RemoteConfig } from 'firebase/remote-config';
import { catchError, lastValueFrom, throwError } from 'rxjs';
import { FirebaseConfigResponse } from '../types/firebase-config.type';

@Injectable({
  providedIn: 'root'
})
export class ConfigService  {
    #remoteConfig: RemoteConfig | undefined = undefined;
    #firebaseApp: FirebaseApp | undefined = undefined;
    #functions: Functions | undefined = undefined;
    #httpService = inject(HttpClient);

    get remoteConfig(): RemoteConfig {
      if (!this.#remoteConfig) {
        throw new Error('Remote Config has not been initialized.');
      }
      return this.#remoteConfig;
    }

    get firebaseApp(): FirebaseApp {
      if (!this.#firebaseApp) {
        throw new Error('Firebase App has not been initialized.');
      }
      return this.#firebaseApp;
    }

    get functions(): Functions {
      if (!this.#functions) {
        throw new Error('Functions has not been initialized.');
      }
      return this.#functions;
    }

    async initialize() {
      try {
        const firebaseConfig$ =
        this.#httpService.get<FirebaseConfigResponse>(config.getFirebaseConfigUrl)
          .pipe(catchError((e) => throwError(() => e)));
        const firebaseConfig = await lastValueFrom(firebaseConfig$);
        const { app, recaptchaSiteKey } = firebaseConfig;
        this.#firebaseApp = initializeApp(app);

        const local = isDevMode();
        this.#remoteConfig = getRemoteConfig(this.#firebaseApp);
        this.#remoteConfig.settings.minimumFetchIntervalMillis = local ? 0 : 3600000;
        this.#remoteConfig.defaultConfig = remoteConfigDefaults;
         try {
          const activated = await fetchAndActivate(this.#remoteConfig);
          console.log('Remote Config initialized. Activated new values:', activated);
        } catch (error) {
          console.error('Failed to fetch and activate remote config:', error);
        }

        if (recaptchaSiteKey) {
          (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = local;
          initializeAppCheck(this.#firebaseApp, {
            provider: new ReCaptchaEnterpriseProvider(recaptchaSiteKey),
            isTokenAutoRefreshEnabled: true,
          });
        }

        const functionRegion = getValue(this.#remoteConfig, 'functionRegion').asString();
        this.#functions = getFunctions(this.#firebaseApp, functionRegion);
        console.log('bootstrapFirebase -> functions region', this.#functions.region);
        if (location.hostname === 'localhost') {
          const host = getValue(this.#remoteConfig, 'functionEmulatorHost').asString();
          const port = getValue(this.#remoteConfig, 'functionEmulatorPort').asNumber();
          console.log('functionEmulator', `${host}:${port}`);
          connectFunctionsEmulator(this.#functions, host, port);
        }
      } catch (err) {
        console.error(err);
      }
    }
}

