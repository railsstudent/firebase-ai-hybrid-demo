import { GenerateContentConfig, GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { getStorage, ref, StorageError, uploadBytesResumable, UploadTaskSnapshot } from "firebase/storage";
import mime from "mime";
import { validateVideoConfigFields } from "./audio.util";
import { AIAudio } from "./types/audio.type";

const DEFAULT_CONFIG: GenerateContentConfig = {
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
  systemInstruction: `You are a voice-over specialist for an advanced Text-to-Speech engine.
Your goal is to generate text and formatting that mimics the voice of Darth Vader (James Earl Jones).
**Vocal Characteristics:**
1.  **Pitch:** Extremely low, resonant, and bass-heavy.
2.  **Cadence:** Slow, deliberate, and rhythmic. Never rush. Each word carries the weight of authority.
3.  **Timbre:** Authoritative, menacing, and slightly gravelly, but with perfect clarity.
4.  **Breathing:** Every 2-3 short sentences (or one long sentence), you must insert
a mechanical respirator sound marker: [Mechanical Breath: Inhale/Exhale]`,
};

/**
 *
 * @param {GenerateAudioRequest} data      Generate video request object
 * @return {Promise<string>} the GCS uri of a video
 * @throws {Error} If configuration is invalid or video generation fails.
 */
export async function readFactFunction(data: string) {
  const variables = validateVideoConfigFields();
  if (!variables) {
    return "";
  }

  const { genAIOptions, model } = variables;

  try {
    const ai = new GoogleGenAI(genAIOptions);
    return await generateAudio({ ai, model }, data);
  } catch (error) {
    console.error("Error generating video:", error);
    throw new Error("Error generating video");
  }
}

/**
 *
 * @param {AIAudio} aiTTS ai audio info
 * @param {String} contents    Text to be converted to audio
 * @return {string} audio uri
 */
async function generateAudio(aiTTS: AIAudio, contents: string) {
  try {
    const { ai, model } = aiTTS;
    const response = await ai.models.generateContent({
      model,
      contents,
      config: DEFAULT_CONFIG,
    });
    const uploadTask = uploadAudioResumable(response);

    const audioUriPromise = new Promise<string>((resolve, reject) => {
      uploadTask.on("state_changed",
        (snapshot) => logUploadProgress(snapshot),
        (error) => reject(processError(error)),
        () => {
          console.log("Upload completed successfully");
          console.log(uploadTask.snapshot.ref);
          resolve(uploadTask.snapshot.ref.fullPath);
        });
    });
    return await audioUriPromise;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 *
 * @param {StorageError} error  Storage error
 * @return {string} Error string
 */
async function processError(error: StorageError) {
  switch (error.code) {
  case "storage/object-not-found":
    console.error(error.message);
    return "File doesn't exist";
  case "storage/unauthorized":
    console.error(error.message);
    return "User doesn't have permission to access the object";
  case "storage/canceled":
    console.error(error.message);
    return "User canceled the upload";
  case "storage/unknown":
    console.error(error.message);
    console.error(error.serverResponse);
    return "Unknown storage error occurred, inspect the server response";
  default:
    return "An unknown error occurred during storage operation";
  }
}

/**
 *
 * @param {UploadTaskSnapshot} snapshot upload task snapshot
 */
function logUploadProgress(snapshot: UploadTaskSnapshot) {
  const { bytesTransferred, totalBytes, state } = snapshot;
  const progress = (bytesTransferred / totalBytes) * 100;
  console.log("Upload is " + progress + "% done");

  switch (state) {
  case "paused":
    console.log("Upload is paused");
    break;
  case "running":
    console.log("Upload is running");
    break;
  }
}

/**
 *
 * @param {GenerateContentResponse} response AI generate content response
 * @return {UploadTask} upload task
 */
function uploadAudioResumable(response: GenerateContentResponse) {
  const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  const data = inlineData?.data;
  const mimeType = inlineData?.mimeType;

  if (!data || !mimeType) {
    throw new Error("Audio generation failed: No audio data received.");
  }

  const extension = mime.getExtension(mimeType);
  const filename = `audio.${extension}`;

  const arrayBuffer = Buffer.from(data, "base64");
  const storage = getStorage();
  const audioRef = ref(storage, `${Date.now()}/${filename}`);

  return uploadBytesResumable(audioRef, arrayBuffer, { contentType: mimeType });
}

