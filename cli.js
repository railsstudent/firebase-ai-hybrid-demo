#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Data to be written to JSON file
const app = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const model = process.env.GEMINI_MODEL_NAME;
if (!model) {
  throw new Error('GEMINI MODEL NAME is blank.');
}

// Convert data to JSON string with indentation
const jsonString = JSON.stringify({
  app,
  model,
}, null, 2);

// Define output file path
const outputPath = path.join('src','app', 'firebase-ai.json');

// Write JSON string to file
fs.writeFile(outputPath, jsonString, (err) => {
  if (err) {
    console.error('Error writing JSON file:', err);
    process.exit(1);
  }
  console.log(`JSON file has been saved to ${outputPath}`);
});