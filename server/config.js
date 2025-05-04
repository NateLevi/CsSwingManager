// config.js (Fixing newline characters after parsing)

// dotenv is for local development only
const dotenv = require('dotenv');
const path = require('path'); // Needed for dotenv path resolution
// Make sure dotenv config points to your .env file correctly for local testing
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('--- Loading config.js ---');

let serviceAccount;

try {
  const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  console.log(`DEBUG: Attempting to read FIREBASE_SERVICE_ACCOUNT_JSON env var.`);

  if (serviceAccountJSON) {
    console.log(`DEBUG: Env var FIREBASE_SERVICE_ACCOUNT_JSON is present, attempting JSON.parse().`);
    // Parse the JSON string
    serviceAccount = JSON.parse(serviceAccountJSON);
    console.log('DEBUG: JSON parsed successfully.');

    // ** THE FIX: Replace literal "\\n" sequences with actual newline characters **
    if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
       serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
       console.log('DEBUG: Replaced "\\\\n" with "\\n" in private_key for PEM format.');
    } else {
       console.warn('DEBUG: serviceAccount.private_key not found or not a string after parsing.');
    }

    // Optional: Basic validation
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
       throw new Error('Parsed service account JSON is missing required fields (project_id, private_key, client_email).');
    }
     console.log('Firebase service account object prepared successfully.');
  } else {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
  }
} catch (error) {
  console.error('Fatal Error: Could not load/parse Firebase service account key from environment variable.', error);
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 3000, // Render uses PORT, default locally if needed
  databaseUrl: process.env.DATABASE_URL,
  firebaseProjectId: serviceAccount.project_id,
  firebaseServiceAccount: serviceAccount, // This holds the parsed object with corrected key
};