import { GenerateContentConfig } from "@google/genai";

/**
 *
 * @param {string} voiceName Prebuilt voice name
 * @return {GenerateContentConfig} an instance of GenerateContentConfig
 */
export function createVoiceConfig(voiceName = "Kore"): GenerateContentConfig {
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
