// config.js (Loading from JSON Environment Variable)

// dotenv is for local development only
// require('dotenv').config(...)
console.log('--- Loading config.js ---');

let serviceAccount;

try {
  // Read the JSON string directly from the environment variable
  // Ensure this variable is set in Render with the correctly formatted single-line JSON string
  const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  console.log(`DEBUG: Attempting to read FIREBASE_SERVICE_ACCOUNT_JSON env var.`);

  if (serviceAccountJSON) {
    console.log(`DEBUG: Env var FIREBASE_SERVICE_ACCOUNT_JSON is present, attempting JSON.parse().`);
    // Parse the JSON string into an object
    serviceAccount = JSON.parse(serviceAccountJSON);

    // Optional: Basic validation after parsing to catch common errors
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
       throw new Error('Parsed service account JSON is missing required fields (project_id, private_key, client_email).');
    }
     console.log('Firebase service account parsed successfully from environment variable.');
  } else {
    // Variable not set in Render environment
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
  }
} catch (error) {
  // Catch parsing errors (if JSON format is bad) or missing variable error
  console.error('Fatal Error: Could not load/parse Firebase service account key from environment variable.', error);
  // Avoid logging the full JSON string here for security.
  process.exit(1);
}

module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  // Project ID can now reliably come from the parsed service account object
  firebaseProjectId: serviceAccount.project_id,
  firebaseServiceAccount: serviceAccount, // This holds the parsed object
};