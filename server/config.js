const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccountPath = path.resolve(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    serviceAccount = require(serviceAccountPath);
  } else {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH must be set in the .env file.');
  }
} catch (error) {
  console.error('Fatal Error: Could not load Firebase service account key.', error);
  process.exit(1); 
}

module.exports = {
  port: process.env.PORT || 1000,
  databaseUrl: process.env.DATABASE_URL,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseServiceAccount: serviceAccount, // This now holds the loaded JSON object
};