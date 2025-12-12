import { inject } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { fetchAndActivate, getRemoteConfig } from 'firebase/remote-config';
import remoteConfigDefaults from '../../firebase-project/remoteconfig.defaults.json';
import { ConfigService } from './ai/services/config.service';
import firebaseConfig from './firebase.json';

function createRemoteConfig(firebaseApp: FirebaseApp) {
  const remoteConfig = getRemoteConfig(firebaseApp);
  remoteConfig.settings.minimumFetchIntervalMillis = 1;
  remoteConfig.defaultConfig = remoteConfigDefaults;

  return remoteConfig;
}

export async function bootstrapFirebase() {
    try {
      const configService = inject(ConfigService);
      const firebaseApp = initializeApp(firebaseConfig.app);

      // Initialize Firebase App Check
      initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaEnterpriseProvider(firebaseConfig.recaptchaEnterpriseSiteKey),
        isTokenAutoRefreshEnabled: true,
      });

      const remoteConfig = createRemoteConfig(firebaseApp);
      await fetchAndActivate(remoteConfig);

      configService.loadConfig(firebaseApp, remoteConfig);
    } catch (err) {
      console.error('Remote Config fetch failed', err);
      throw err;
    }
}
