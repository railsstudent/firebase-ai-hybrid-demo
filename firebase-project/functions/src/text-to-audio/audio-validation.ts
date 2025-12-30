import { validate } from "../validate";

/**
 *
 * @return {object} an object containing validated environment variables or undefined if validation fails
 */
export function validateAudioConfigFields() {
    process.loadEnvFile();

    const env = process.env;
    const vertexai = (env.GOOGLE_GENAI_USE_VERTEXAI || "false") === "true";

    const missingKeys: string[] = [];
    const location = validate(env.GOOGLE_CLOUD_LOCATION, "Vertex Location", missingKeys);
    const model = validate(env.GEMINI_TTS_MODEL_NAME, "Gemini TTS Model Name", missingKeys);
    const project = validate(env.GOOGLE_CLOUD_QUOTA_PROJECT, "Google Cloud Project", missingKeys);

    if (missingKeys.length > 0) {
        throw new Error(`Missing environment variables: ${missingKeys.join(", ")}`);
    }

    return {
        genAIOptions: {
            project,
            location,
            vertexai,
        },
        model,
    };
}
