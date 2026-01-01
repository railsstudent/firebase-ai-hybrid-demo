import { GenerateContentConfig, GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { CallableResponse, HttpsError } from "firebase-functions/https";
import { validateAudioConfigFields } from "./audio-validation";
import { DARTH_VADER_TONE, LIGHT_TONE } from "./constants/tone.const";
import { AIAudio } from "./types/audio.type";
import { WavConversionOptions } from "./types/wav-conversion-options.type";
import { createVoiceConfig } from './voice-config';
import { createWavHeader, encodeBase64String, parseMimeType } from "./wav-conversion";

/**
 *
 * @param {any} callback A callback function that returns a URL, wav header or undefined
 * @return {Promise<string | number[] | undefined>} the result of the callback function
 */
async function withAIAudio(callback: (ai: GoogleGenAI, model: string) => Promise<string | number[] | undefined>) {
    try {
        const variables = validateAudioConfigFields();
        if (!variables) {
            return "";
        }

        const { genAIOptions, model } = variables;
        const ai = new GoogleGenAI(genAIOptions);
        return await callback(ai, model);
    } catch (e) {
        console.error(e);
        throw new HttpsError("internal", "Internal server error", { originalError: (e as Error).message });
    }
}

/**
 *
 * @param {String} text      text
 * @return {Promise<string>} the GCS uri of a video
 * @throws {Error} If configuration is invalid or video generation fails.
 */
export async function readFactFunction(text: string) {
    return withAIAudio((ai, model) => generateAudio({ ai, model }, text));
}

/**
 *
 * @param {String} text      text
 * @param {CallableResponse} response CallableResponse object
 * @return {Promise<string>} the GCS uri of a video
 * @throws {Error} If configuration is invalid or video generation fails.
 */
export async function readFactFunctionStream(text: string, response: CallableResponse<unknown>) {
    return withAIAudio((ai, model) => generateAudioStream({ ai, model }, text, response));
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
        const contents = `${DARTH_VADER_TONE.trim()} ${text.trim()}`;

        const voiceConfig = createVoiceConfig();
        const response = await ai.models.generateContent(createAudioParams(model, contents, voiceConfig));

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
 * @return {Promise<number[] | undefined>}  wav header or undefined
 */
async function generateAudioStream(
    aiTTS: AIAudio,
    text: string,
    response: CallableResponse<unknown>,
): Promise<number[] | undefined> {
    try {
        const { ai, model } = aiTTS;
        const contents = `${LIGHT_TONE.trim()} ${text.trim()}`;

        const voiceConfig = createVoiceConfig("Puck");
        const chunks = await ai.models.generateContentStream(createAudioParams(model, contents, voiceConfig));

        let rawDataLength = 0;
        let options: WavConversionOptions | undefined = undefined;
        for await (const chunk of chunks) {
            const inlineData = chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData;
            const rawData = inlineData?.data;
            const mimeType = inlineData?.mimeType;

            if (!options && mimeType) {
                options = parseMimeType(mimeType);
            }

            if (rawData && mimeType) {
                const buffer = Buffer.from(rawData, "base64");
                rawDataLength = rawDataLength + buffer.length;
                response.sendChunk(buffer);
            }
        }

        // return the wav header array;
        if (options && rawDataLength > 0) {
            console.log("rawDataLength", rawDataLength);
            const header = createWavHeader(rawDataLength, options);
            return [...header];
        }

        return undefined;
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
