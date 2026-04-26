import { logger } from "firebase-functions";
import { onCall } from "firebase-functions/v2/https";
import { cors } from "../auth";
import { buildAudioPrompt } from './audio-prompt';
import { AUDIO_PROFILES } from './constants/tone.const';
import { readFactFunction, readFactFunctionStream } from "./read-fact";

const options = {
    cors,
    enforceAppCheck: true,
    timeoutSeconds: 600,
};

export const readFact = onCall(options, (request, response) => {
    const { data, acceptsStreaming } = request;

    logger.debug("Extracted data:", data);
    logger.debug("Accepts streaming:", acceptsStreaming);

    const isStreaming = acceptsStreaming && !!response;
    const audioProfile = isStreaming ? AUDIO_PROFILES["LIGHT"] : AUDIO_PROFILES["DARTH_VADER"];
    const prompt = buildAudioPrompt(data, audioProfile);

    return isStreaming ? readFactFunctionStream(prompt, data.voiceOption, response) : readFactFunction(prompt, data.voiceOption);
});
