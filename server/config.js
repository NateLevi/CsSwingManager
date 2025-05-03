const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const serviceAccount = require('./db/cs-swing-system-firebase-adminsdk-fbsvc-9bdfdef2cb.json'); // Adjust path

module.exports = {
  port: process.env.PORT || 1000,
  databaseUrl: process.env.DATABASE_URL,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseServiceAccount: serviceAccount,
};
