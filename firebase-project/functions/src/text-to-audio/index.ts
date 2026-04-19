import { onCall } from "firebase-functions/v2/https";
import { cors } from "../auth";
import { readFactFunction, readFactFunctionStream } from "./read-fact";

const options = {
    cors,
    enforceAppCheck: true,
    timeoutSeconds: 600,
};

export const readFact = onCall(options, ({ data, acceptsStreaming }, response) =>
    acceptsStreaming && response ? readFactFunctionStream(data, response) : readFactFunction(data),
);
