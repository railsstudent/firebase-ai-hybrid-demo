import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { validateVideoConfigFields } from "./audio-validation";
import { TONE } from './constants/tone.const';
import { KORE_VOICE_CONFIG } from './constants/tts-config.const';
import { AIAudio } from "./types/audio.type";
import { encodeBase64String } from "./wav-conversion";

/**
 *
 * @param {String} text      text
 * @return {Promise<string>} the GCS uri of a video
 * @throws {Error} If configuration is invalid or video generation fails.
 */
export async function readFactFunction(text: string) {
  const variables = validateVideoConfigFields();
  if (!variables) {
    return "";
  }

  const { genAIOptions, model } = variables;

  try {
    const ai = new GoogleGenAI(genAIOptions);
    return await generateAudio({ ai, model }, text);
  } catch (error) {
    console.error("Error generating audio:", error);
    throw new Error("Error generating audio.");
  }
}

/**
 *
 * @param {AIAudio} aiTTS ai audio info
 * @param {String} text    Text to be converted to audio
 * @return {String} audio data url
 */
async function generateAudio(aiTTS: AIAudio, text: string) {
  try {
    const { ai, model } = aiTTS;
    const contents = `
${TONE}
${text}`;

    const response = await ai.models.generateContent({
      model,
      contents: {
        role: "user",
        parts: [
          {
            text: contents,
          },
        ],
      },
      config: KORE_VOICE_CONFIG,
    });

    return getBase64DataUrl(response);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 *
 * @param {GenerateContentResponse} response AI generate content response
 * @return {string} data url
 */
function getBase64DataUrl(response: GenerateContentResponse) {
  const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  const rawData = inlineData?.data;
  const mimeType = inlineData?.mimeType;

  if (!rawData || !mimeType) {
    throw new Error("Audio generation failed: No audio data received.");
  }

  return encodeBase64String({ rawData, mimeType });
}

