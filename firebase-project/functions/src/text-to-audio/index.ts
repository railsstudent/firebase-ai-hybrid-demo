import { onCall } from "firebase-functions/https";
import { readFactFunction } from "./read-fact";

const cors = process.env.WHITELIST ? process.env.WHITELIST.split(",") : true;
const options = {
  cors,
  enforceAppCheck: true,
  timeoutSeconds: 180,
};

export const readFact = onCall( options,
  ({ data, acceptsStreaming }) =>
    acceptsStreaming ? readFactFunction(data) : readFactFunction(data)
);

