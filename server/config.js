// config.js (Corrected to load file from App Root)
// const path = require('path'); // We don't need path.resolve for this anymore

// dotenv is for local development only
// require('dotenv').config(...)

let serviceAccount;

try {

  const serviceAccountFilename = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountFilename) {
    console.log(`Attempting to load Firebase key using filename: ${serviceAccountFilename}`);

    serviceAccount = require(serviceAccountFilename);

    console.log('Firebase service account loaded successfully.');
  } else {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set in Render.');
  }
} catch (error) {
  console.error('Fatal Error: Could not load Firebase service account key.', error);
  console.error(`Filename attempted: ${process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'Not Set'}`);
  try {
    console.error(`Current Working Directory (CWD): ${process.cwd()}`);
  } catch (e) { console.error('Could not get CWD.')}
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 3000, // Use Render's PORT
  databaseUrl: process.env.DATABASE_URL,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseServiceAccount: serviceAccount,
};