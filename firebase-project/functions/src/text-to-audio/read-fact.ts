import { GenerateContentConfig, GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { CallableResponse, HttpsError } from "firebase-functions/https";
import { validateAudioConfigFields } from "./audio-validation";
import { DARTH_VADER_TONE, LIGHT_TONE } from "./constants/tone.const";
import { AIAudio } from "./types/audio.type";
import { WavConversionOptions } from "./types/wav-conversion-options.type";
import { createVoiceConfig } from "./voice-config";
import { createWavHeader, encodeBase64String, parseMimeType } from "./wav-conversion";

const KORE_VOICE_CONFIG = createVoiceConfig();
const PUCK_VOICE_CONFIG = createVoiceConfig("Puck");

/**
 * A wrapper function to initialize the GoogleGenAI client and handle configuration validation and errors.
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
        // Re-throw HttpsError or wrap other errors.
        if (e instanceof HttpsError) {
            throw e;
        }
        throw new HttpsError("internal", "An internal error occurred while setting up the AI client.", {
            originalError: (e as Error).message,
        });
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
 * @return {Promise<number[] | undefined>} The WAV header as a number array, or undefined if no audio was generated.
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

        const chunks = await ai.models.generateContentStream(createAudioParams(model, contents, PUCK_VOICE_CONFIG));

        let byteLength = 0;
        let options: WavConversionOptions | undefined = undefined;
        for await (const chunk of chunks) {
            const { rawData, mimeType } = extractInlineAudioData(chunk);
            if (!options && mimeType) {
                options = parseMimeType(mimeType);
            }

            if (rawData && mimeType) {
                const buffer = Buffer.from(rawData, "base64");
                byteLength = byteLength + buffer.length;
                response.sendChunk(buffer);
            }
        }

        // return the wav header array;
        if (options && byteLength > 0) {
            const header = createWavHeader(byteLength, options);
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
    const { rawData, mimeType } = extractInlineAudioData(response);

    if (!rawData || !mimeType) {
        throw new Error("Audio generation failed: No audio data received.");
    }

    return encodeBase64String({ rawData, mimeType });
}

/**
 * Extracts the inline audio data and mime type from a `GenerateContentResponse`.
 *
 * @param {GenerateContentResponse} response The response object from the generative AI model.
 * @return {object} An object containing the base64 raw data and its mime type.
 */
function extractInlineAudioData(response: GenerateContentResponse): {
    rawData: string | undefined;
    mimeType: string | undefined;
} {
    // Use destructuring and the nullish coalescing operator for a concise and safe extraction.
    const { data: rawData, mimeType } = response.candidates?.[0]?.content?.parts?.[0]?.inlineData ?? {};

    return { rawData, mimeType };
}
