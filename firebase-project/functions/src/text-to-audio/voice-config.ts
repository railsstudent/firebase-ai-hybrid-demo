import { GenerateContentConfig } from "@google/genai";
import { logger } from 'firebase-functions';

/**
 *
 * @param {string} voiceName Prebuilt voice name
 * @return {GenerateContentConfig} an instance of GenerateContentConfig
 */
export function createVoiceConfig(voiceName = "Kore"): GenerateContentConfig {
    logger.debug("Creating voice config with voice name:", voiceName);
    return {
        responseModalities: ["audio"],
        speechConfig: {
            voiceConfig: {
                prebuiltVoiceConfig: {
                    voiceName,
                },
            },
        },
    };
}
