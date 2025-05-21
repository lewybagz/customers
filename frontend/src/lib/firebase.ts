import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const completeEmailSignIn = async () => {
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    return null;
  }

  let email = window.localStorage.getItem('emailForSignIn');
  if (!email) {
    // If missing email, prompt user for it
    email = window.prompt('Please provide your email for confirmation');
  }

  if (!email) return null;

  try {
    const result = await signInWithEmailLink(auth, email, window.location.href);
    // Clear email from storage
    window.localStorage.removeItem('emailForSignIn');
    return result;
  } catch (error) {
    console.error('Error completing email link sign in:', error);
    return null;
  }
}; 