import { GenerateContentConfig } from '@google/genai';

export const KORE_VOICE_CONFIG: GenerateContentConfig = {
  responseModalities: [
    "audio",
  ],
  speechConfig: {
    voiceConfig: {
      prebuiltVoiceConfig: {
        voiceName: "Kore",
      },
    },
  },
};

export const ENCELADUS_VOICE_CONFIG: GenerateContentConfig = {
  responseModalities: [
    "audio",
  ],
  speechConfig: {
    voiceConfig: {
      prebuiltVoiceConfig: {
        voiceName: "Enceladus",
      },
    },
  },
};
