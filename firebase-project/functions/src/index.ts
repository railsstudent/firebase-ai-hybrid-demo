/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import express from "express";
import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import { getFirebaseConfigFunction } from "./firebase";

process.loadEnvFile();

setGlobalOptions({ maxInstances: 2, region: process.env.GOOGLE_FUNCTION_LOCATION || "us-central1" });

const cors = process.env.WHITELIST ? process.env.WHITELIST.split(",") : true;
const whitelist = process.env.WHITELIST?.split(",") || [];
const refererList = process.env.REFERER?.split(",") || [];

/**
 *
 * @param {string} referer       a referer
 * @param {string[]} refererList a list of refereres
 * @return {boolean} true when referer is found in referers
 */
function isValidReferer(referer: string | undefined, refererList: string[]) {
    return referer && refererList.includes(referer);
}

/**
 *
 * @param {string} origin       an origin
 * @param {string[]} whitelist  a list of valid domains
 * @return {boolean} true when origin is found in whitelist
 */
function isValidOrigin(origin: string | undefined, whitelist: string[]) {
    return origin && whitelist.includes(origin);
}

/**
 * Sends a 401 Unauthorized response.
 * @param {any} response The response object.
 * @param {string} message The error message to send.
 */
function sendUnauthorizedResponse(response: express.Response, message: string): void {
    response.status(401).send(`Unauthorized, ${message}.`);
}

/**
 * Validates the incoming request's method, referer, and origin.
 * @param {express.Request} request The request object.
 * @param {express.Response} response The response object.
 * @return {boolean} True if the request is valid, otherwise false.
 */
function validateRequest(request: express.Request, response: express.Response): boolean {
    if (request.method !== "GET") {
        response.status(405).send("Method Not Allowed");
        return false;
    }

    const referer = request.header("referer");
    if (!isValidReferer(referer, refererList)) {
        sendUnauthorizedResponse(response, "invalid referer");
        return false;
    }

    const origin = request.header("origin");
    if (!isValidOrigin(origin, whitelist)) {
        sendUnauthorizedResponse(response, "invalid origin");
        return false;
    }

    return true;
}

export const getFirebaseConfig = onRequest({ cors }, (request, response) => {
    if (!validateRequest(request, response)) {
        return;
    }

    try {
        const config = getFirebaseConfigFunction();

        response.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
        response.json(config);
    } catch (err) {
        console.error(err);
        response.status(500).send("Internal Server Error");
    }
});

// eslint-disable-next-line  @typescript-eslint/no-require-imports
exports.textToAudio = require("./text-to-audio");
