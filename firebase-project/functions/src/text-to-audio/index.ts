import { logger } from "firebase-functions";
import { onCall } from "firebase-functions/v2/https";
import { cors } from "../auth";
import { readFactFunction, readFactFunctionStream } from "./read-fact";

const options = {
    cors,
    enforceAppCheck: true,
    timeoutSeconds: 600,
};

const SCENE_DICTIONARY = [
    "A dimly lit, dusty library filled with ancient leather-bound books. " +
        "The air is thick with history. A scholarly archivist is leaning closely into a warm, " +
        "vintage ribbon microphone. They speak with an infectious, hushed intensity, " +
        "eager to share a forgotten secret they just uncovered in a decaying manuscript.",

    "It is 10:00 PM in a glass-walled studio overlooking the moonlit London skyline, " +
        "but inside, it is blindingly bright. The red 'ON AIR' tally light is blazing. " +
        "The speaker is standing up, bouncing on the balls of their heels to the rhythm " +
        "of a thumping backing track. It is a chaotic, caffeine-fueled cockpit designed " +
        "to wake up an entire nation.",

    "A meticulously sound-treated bedroom in a suburban home. The space is deadened by " +
        "plush velvet curtains and a heavy rug, creating an intimate, close-up acoustic " +
        "environment. The speaker delivers the information like a trusted friend sharing " +
        "an inside joke.",

    "A high-tech, minimalist laboratory humming with servers. Crisp, clean acoustics " +
        "reflect off glass and steel. A brilliant but eccentric scientist is pacing back " +
        "and forth, speaking rapidly and enthusiastically into a headset microphone, " +
        "excited to explain a complex phenomenon.",
];

export const readFact = onCall(options, (request, response) => {
    const { data, acceptsStreaming } = request;

    logger.debug("Extracted data:", data);
    logger.debug("Accepts streaming:", acceptsStreaming);

    // Randomly select a scene from the dictionary
    const randomIndex = Math.floor(Math.random() * SCENE_DICTIONARY.length);
    logger.debug("Selected scene index:", randomIndex);
    const selectedScene = SCENE_DICTIONARY[randomIndex];

    // append transcript
    const prompt = `## Scene:\n${selectedScene}\n\n#### TRANSCRIPT:\n${data}`;

    return acceptsStreaming && response ? readFactFunctionStream(prompt, response) : readFactFunction(prompt);
});
