/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({maxInstances: 2, region: "asia-east1"});

export const getFirebaseConfig = onRequest( {cors: true}, (_, response) => {
  logger.info("getFirebaseConfig called");

  process.loadEnvFile();

  if (!process.env.RECAPTCHA_ENTERPRISE_SITE_KEY) {
    const err = "RECAPTCHA_ENTERPRISE_SITE_KEY is missing.";
    logger.error(err);
    response.status(500).send(err);
    return;
  }

  if (!process.env.FIREBASE_CONFIG) {
    const error = "FIREBASE_CONFIG is missing.";
    logger.error(error);
    response.status(500).send(error);
    return;
  }

  const recaptchaSiteKey = process.env.RECAPTCHA_ENTERPRISE_SITE_KEY;
  const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
  const projectId = firebaseConfig?.projectId;
  const storageBucket = firebaseConfig?.storageBucket;

  if (!projectId) {
    logger.error("Project ID not found in FIREBASE_CONFIG");
    response.status(500).send("Project ID not found in FIREBASE_CONFIG");
    return;
  }

  if (!storageBucket) {
    logger.error("Storage Bucket not found in FIREBASE_CONFIG");
    response.status(500).send("Storage Bucket not found in FIREBASE_CONFIG");
    return;
  }

  const jsonString = JSON.stringify({
    app: {
      apiKey: process.env.APP_API_KEY,
      authDomain: `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket,
      messagingSenderId: process.env.APP_MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
    },
    recaptchaSiteKey,
  }, null, 2);

  response.send(jsonString);
});

