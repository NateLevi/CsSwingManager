const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });


let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    serviceAccount = require('./db/cs-swing-system-firebase-adminsdk-fbsvc-9bdfdef2cb.json');
  }
} catch (error) {
  console.error('Error loading Firebase service account:', error);
  serviceAccount = {};
}

module.exports = {
  port: process.env.PORT || 1000,
  databaseUrl: process.env.DATABASE_URL,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseServiceAccount: serviceAccount,
};
