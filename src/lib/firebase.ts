import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, updateDoc, deleteDoc, onSnapshot, query, orderBy, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use specified custom database ID if available
export const db = getFirestore(app, firebaseConfigJson.firestoreDatabaseId || '(default)');

// Attempt to enable offline persistence for Firestore in supported browsers
try {
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, Firestore persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support all features required to enable Firestore persistence.');
      }
    });
  }
} catch (e) {
  console.log('IndexedDB persistence setup:', e);
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');
googleProvider.setCustomParameters({ prompt: 'select_account' });

let activeSignInPromise: Promise<{ user: User | null; accessToken?: string; cancelled?: boolean; popupBlocked?: boolean }> | null = null;

export async function signInWithGoogle(): Promise<{ user: User | null; accessToken?: string; cancelled?: boolean; popupBlocked?: boolean }> {
  // If an auth request is already in-flight, return the active promise to avoid auth/cancelled-popup-request
  if (activeSignInPromise) {
    return activeSignInPromise;
  }

  activeSignInPromise = (async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      if (accessToken) {
        localStorage.setItem('google_workspace_access_token', accessToken);
      }
      return { user: result.user, accessToken };
    } catch (error: any) {
      const errorCode = error?.code || '';
      
      // Gracefully handle standard browser popup restrictions & user cancels
      if (errorCode === 'auth/popup-blocked') {
        console.warn('Google Auth popup was blocked by the browser or iframe sandbox.');
        return { user: auth.currentUser, popupBlocked: true };
      }
      
      if (errorCode === 'auth/cancelled-popup-request' || errorCode === 'auth/popup-closed-by-user') {
        console.info('Google Auth popup request was cancelled or closed by user.');
        return { user: auth.currentUser, cancelled: true };
      }

      console.error('Google Sign-In Error:', error);
      return { user: auth.currentUser, cancelled: true };
    } finally {
      // Release mutex lock after a small tick
      setTimeout(() => {
        activeSignInPromise = null;
      }, 500);
    }
  })();

  return activeSignInPromise;
}

export async function signOutUser() {
  localStorage.removeItem('google_workspace_access_token');
  return fbSignOut(auth);
}
