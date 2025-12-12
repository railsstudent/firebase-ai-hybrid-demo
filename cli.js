#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

process.loadEnvFile()

// Data to be written to JSON file
const app = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain:`${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

// Convert data to JSON string with indentation
const jsonString = JSON.stringify({
  app,
  recaptchaEnterpriseSiteKey: process.env.RECAPTCHA_ENTERPRISE_SITE_KEY || '',
}, null, 2);

// Define output file path
const outputPath = path.join('src','app', 'firebase.json');

// Write JSON string to file
fs.writeFile(outputPath, jsonString, (err) => {
  if (err) {
    console.error('Error writing JSON file:', err);
    process.exit(1);
  }
  console.log(`JSON file has been saved to ${outputPath}`);
});
