import logger from "firebase-functions/logger";
import { HttpsError } from "firebase-functions/v2/https";
import { validate } from "../validate";

export const AUDIO_CONFIG = (() => {
    logger.info("AUDIO_CONFIG initialization: Loading environment variables and validating configuration...");

    const env = process.env;

    const missingKeys: string[] = [];
    const location = validate(env.GOOGLE_CLOUD_LOCATION, "Vertex Location", missingKeys);
    const model = validate(env.GEMINI_TTS_MODEL_NAME, "Gemini TTS Model Name", missingKeys);
    const project = validate(env.GCLOUD_PROJECT, "Google Cloud Project", missingKeys);

    if (missingKeys.length > 0) {
        throw new HttpsError("failed-precondition", `Missing environment variables: ${missingKeys.join(", ")}`);
    }

    return {
        genAIOptions: {
            project,
            location,
            vertexai: true,
        },
        model,
    };
})();
