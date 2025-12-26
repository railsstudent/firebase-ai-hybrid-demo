import { GenerateContentConfig, GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { validateVideoConfigFields } from "./audio-validation";
import { DARTH_VADER_TONE, LIGHT_TONE } from "./constants/tone.const";
import { KORE_VOICE_CONFIG, PUCK_VOICE_CONFIG } from "./constants/tts-config.const";
import { AIAudio } from "./types/audio.type";
import { convertToWav, encodeBase64String } from "./wav-conversion";
import { CallableResponse } from "firebase-functions/https";

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
 * @param {String} text      text
 * @param {CallableResponse} response CallableResponse object
 * @return {Promise<string>} the GCS uri of a video
 * @throws {Error} If configuration is invalid or video generation fails.
 */
export async function readFactFunctionStream(text: string, response: CallableResponse<unknown>) {
  const variables = validateVideoConfigFields();
  if (!variables) {
    return "";
  }

  const { genAIOptions, model } = variables;

  try {
    const ai = new GoogleGenAI(genAIOptions);
    return await generateAudioStream({ ai, model }, text, response);
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
${DARTH_VADER_TONE}
${text}`;

    const response = await ai.models.generateContent(createAudioParams(model, contents, KORE_VOICE_CONFIG));

    return getBase64DataUrl(response);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 *
 * @param {AIAudio} aiTTS ai audio info
 * @param {String} text    Text to be converted to audio
 * @param {CallableResponse} response  CallableResponse object
 */
async function generateAudioStream(aiTTS: AIAudio, text: string, response: CallableResponse<unknown>) {
  try {
    const { ai, model } = aiTTS;
    const contents = `
${LIGHT_TONE}
${text}`;

    const chunks = await ai.models.generateContentStream(createAudioParams(model, contents, PUCK_VOICE_CONFIG));

    for await (const chunk of chunks) {
      const inlineData = chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      const rawData = inlineData?.data;
      const mimeType = inlineData?.mimeType;

      if (rawData && mimeType) {
        response.sendChunk(convertToWav(rawData, mimeType));
      }
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 *
 * @param {String} model      AI model name
 * @param {String} contents   contents
 * @param {GenerateContentConfig} config  GenerateContentConfig
 * @return {GenerateContentParameters}  a GenerateContentParameters object
 */
function createAudioParams(model: string, contents: string, config?: GenerateContentConfig) {
  return {
    model,
    contents: {
      role: "user",
      parts: [
        {
          text: contents,
        },
      ],
    },
    config,
  };
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

