import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured =
  !!firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your_firebase_api_key' &&
  !!firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your-project-id'

let app, auth, db, googleProvider

if (isFirebaseConfigured) {
  // Prevent duplicate app init on HMR
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  googleProvider = new GoogleAuthProvider()
  // Add YouTube scope so posting comments works
  googleProvider.addScope('https://www.googleapis.com/auth/youtube.force-ssl')
  googleProvider.setCustomParameters({ prompt: 'select_account' })
} else {
  console.warn('[Firebase] Not configured — fill in VITE_FIREBASE_* in .env')
  auth = null
  db = null
  googleProvider = null
}

export { app, auth, db, googleProvider }
export default app
