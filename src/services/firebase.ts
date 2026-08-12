import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  Firestore
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, Auth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App safely (singleton) with fallback
let appInstance: any = null;
let dbInstance: any = null;
let authInstance: any = null;
let googleAuthProviderInstance: any = null;

try {
  if (firebaseConfig && (firebaseConfig.apiKey || firebaseConfig.projectId)) {
    appInstance = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    dbInstance = getFirestore(appInstance);
    authInstance = getAuth(appInstance);
    googleAuthProviderInstance = new GoogleAuthProvider();
    googleAuthProviderInstance.addScope('https://www.googleapis.com/auth/drive.file');
    googleAuthProviderInstance.addScope('https://www.googleapis.com/auth/spreadsheets');
  }
} catch (e) {
  console.warn('Firebase initialization notice (offline / fallback mode):', e);
}

export const app = appInstance;
export const db: Firestore = dbInstance;
export const auth: Auth = authInstance;
export const googleAuthProvider = googleAuthProviderInstance;

export { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot,
  signInWithPopup,
  signOut
};

