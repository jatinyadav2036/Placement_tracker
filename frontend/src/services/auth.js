import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app, auth, googleProvider

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
  googleProvider.addScope('email')
  googleProvider.addScope('profile')
} catch (e) {
  console.warn('Firebase not configured. Google login will be unavailable.')
}

export const signInWithGoogle = async () => {
  if (!auth) throw new Error('Firebase not configured')
  const result = await signInWithPopup(auth, googleProvider)
  const idToken = await result.user.getIdToken()
  return { user: result.user, idToken }
}

export const signOutUser = async () => {
  if (auth) await signOut(auth)
  localStorage.removeItem('placeiq_token')
  localStorage.removeItem('placeiq_user')
}

export const resetPassword = async (email) => {
  if (!auth) throw new Error('Firebase not configured')
  await sendPasswordResetEmail(auth, email)
}

export { auth }
