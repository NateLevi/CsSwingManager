// config.js (with added debugging)
// const path = require('path'); // Not needed for this approach

// dotenv is for local development only
// require('dotenv').config(...)
console.log('--- Loading config.js ---'); // Log entry to prove this file is running

let serviceAccount;

try {
  const serviceAccountFilename = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  // Log the exact value read from the environment variable
  console.log(`DEBUG: Env Var FIREBASE_SERVICE_ACCOUNT_PATH value: "${serviceAccountFilename}"`);

  if (serviceAccountFilename) {
    // Log the current working directory to see where Node is running from
    try {
      console.log(`DEBUG: Current Working Directory (CWD): ${process.cwd()}`);
    } catch (e) { console.log('DEBUG: Could not get CWD.')}

    // Log exactly what we are about to require
    console.log(`DEBUG: Attempting require('${serviceAccountFilename}')`);

    // require() will search Node's default paths, including the CWD
    serviceAccount = require(serviceAccountFilename); // Use the filename directly

    console.log('Firebase service account loaded successfully.');

  } else {
    // This means the environment variable wasn't set in Render
    throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set in Render.');
  }
} catch (error) {
  console.error('Fatal Error: Could not load Firebase service account key.', error);
  // Log the filename it *should* have attempted based on the env var
  console.error(`Filename attempted based on Env Var: ${process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'Not Set'}`);
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 3000, // Use Render's PORT
  databaseUrl: process.env.DATABASE_URL,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseServiceAccount: serviceAccount,
};