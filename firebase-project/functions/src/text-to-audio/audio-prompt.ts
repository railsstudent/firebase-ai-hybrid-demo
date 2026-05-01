import logger from "firebase-functions/logger";
import { SCENE_DICTIONARY } from "./constants/scenes.const";
import { AudioPrompt } from "./types/audio-prompt.type";

/**
 *
 * @param {String} text
 * @return {String} sanitized scene description
 */
function sanitizeScene(text: string): string {
    return (
        (text || "")
            .trim()
            // 1. Replace actual newlines with literal '\n' characters
            .replace(/\r?\n/g, "\\n")
            // 2. Remove any markdown headers that might have been injected
            .replace(/^[#\s]+/gm, "")
    );
}

/**
 *
 * @param {String} text
 * @return {String} sanitized transcript text
 */
function sanitizeTranscript(text: string): string {
    return (
        (text || "")
            .trim()
            // 1. Neutralize potential markdown header injections (e.g. '##')
            // that could trick the parser into ending the transcript block.
            .replace(/^#+/gm, "")
            // 2. Ensure we don't have triple quotes inside that would break our delimiter
            .replace(/"""/g, '"')
    );
}

/**
 *
 * @param {AudioPrompt} data
 * @return {string}  formatted prompt with scene and transcript with audio tags
 */
export function buildAudioPrompt(data: AudioPrompt): string {
    // Randomly select a scene from the dictionary
    const randomIndex = Math.floor(Math.random() * SCENE_DICTIONARY.length);
    logger.debug("Selected scene index:", randomIndex);
    const selectedScene = SCENE_DICTIONARY[randomIndex];

    const trimmedScene = (data.scene || "").trim() || selectedScene;
    const escapedScene = sanitizeScene(trimmedScene);

    const transcript = insertAudioTagsToTranscript(data);

    const prompt = `## Scene:
${escapedScene}

## Transcript:
"""
${transcript}
"""
`;

    logger.debug("Constructed audio prompt:", prompt);

    return prompt;
}

/**
 *
 * @param {AudioPrompt} param0
 * @return {string} transcript with audio tags inserted
 */
function insertAudioTagsToTranscript({ transcript, pace, emotion }: AudioPrompt): string {
    const audioTags = `${makeTag(emotion)}${makeTag(pace)}`;
    const cleanedTranscript = sanitizeTranscript(transcript);

    const parts = cleanedTranscript.split(/(?<!\b(?:Mr|Mrs|Ms|Dr|St|i\.e|e\.g))([.!?\n\r]+[”"’']*\s*)/);
    return parts
        .map((text, i, arr) => {
            if (i % 2 !== 0) {
                return ""; // Skip delimiters, they are appended to the text blocks
            }
            const delimiter = arr[i + 1] || "";
            return text.trim() ? `${audioTags}${text.trim()}${delimiter}` : delimiter;
        })
        .join("");
}

/**
 *
 * @param {String} value
 * @return {String} formatted audio tag if value is not empty, otherwise returns an empty string
 */
function makeTag(value: string) {
    const trimmedValue = value.trim();
    return trimmedValue ? `[${trimmedValue}] ` : "";
}
