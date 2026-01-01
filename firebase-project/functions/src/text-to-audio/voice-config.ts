import { GenerateContentConfig } from '@google/genai';

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
