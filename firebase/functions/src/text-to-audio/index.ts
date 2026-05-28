import { logger } from "firebase-functions";
import { onCall } from "firebase-functions/v2/https";
import { cors } from "../auth";
import { buildAudioPrompt } from "./audio-prompt";
import { readFactFunction, readFactStreamFunction } from "./read-fact";
import { createVoiceConfig } from './voice-config';

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
    const prompt = buildAudioPrompt(data);
    const voiceOption = createVoiceConfig(data.voiceOption);

    return isStreaming
        ? readFactStreamFunction(prompt, voiceOption, response)
        : readFactFunction(prompt, voiceOption);
});
