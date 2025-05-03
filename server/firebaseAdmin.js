import admin from 'firebase-admin'
import dotenv from 'dotenv'
dotenv.config({ path: '../.env' })

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
})
export default admin
