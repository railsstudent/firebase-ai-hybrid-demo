import { onCall } from "firebase-functions/v2/https";
import { readFactFunction, readFactFunctionStream } from "./read-fact";

const cors = process.env.WHITELIST ? process.env.WHITELIST.split(",") : true;
const options = {
    cors,
    enforceAppCheck: true,
    timeoutSeconds: 180,
};

export const readFact = onCall(options, ({ data, acceptsStreaming }, response) =>
    acceptsStreaming && response ? readFactFunctionStream(data, response) : readFactFunction(data),
);
