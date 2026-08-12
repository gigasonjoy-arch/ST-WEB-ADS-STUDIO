import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection as firestoreCollection, 
  doc as firestoreDoc, 
  setDoc as firestoreSetDoc, 
  getDocs as firestoreGetDocs, 
  getDoc as firestoreGetDoc, 
  getDocFromServer as firestoreGetDocFromServer,
  deleteDoc as firestoreDeleteDoc, 
  query as firestoreQuery, 
  orderBy as firestoreOrderBy, 
  onSnapshot as firestoreOnSnapshot,
  Firestore
} from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup as authSignInWithPopup, signOut as authSignOut, Auth } from 'firebase/auth';
import rawConfig from '../../firebase-applet-config.json';

// Resolves Firebase configuration strictly from environment or configuration
export const resolveFirebaseConfig = () => {
  const env = (import.meta as any).env || {};
  
  const projectId = env.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId || '';
  const apiKey = env.VITE_FIREBASE_API_KEY || rawConfig.apiKey || '';
  const authDomain = env.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain || (projectId ? `${projectId}.firebaseapp.com` : '');
  const storageBucket = env.VITE_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket || (projectId ? `${projectId}.firebasestorage.app` : '');
  const messagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig.messagingSenderId || '';
  const appId = env.VITE_FIREBASE_APP_ID || rawConfig.appId || '';
  const measurementId = env.VITE_FIREBASE_MEASUREMENT_ID || rawConfig.measurementId || '';
  const firestoreDatabaseId = rawConfig.firestoreDatabaseId || (rawConfig as any).databaseId || 'ai-studio-stwebadsstudioso-58ce8062-58ec-4b5b-8089-a248e5bb1e00';

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    measurementId,
    firestoreDatabaseId
  };
};

export const activeFirebaseConfig = resolveFirebaseConfig();

// Initialize Firebase App safely
let appInstance: any = null;
let dbInstance: any = null;
let authInstance: any = null;
let googleAuthProviderInstance: any = null;

try {
  if (activeFirebaseConfig && activeFirebaseConfig.projectId) {
    appInstance = !getApps().length ? initializeApp(activeFirebaseConfig) : getApp();
    const dbId = activeFirebaseConfig.firestoreDatabaseId;
    dbInstance = dbId ? getFirestore(appInstance, dbId) : getFirestore(appInstance);
    authInstance = getAuth(appInstance);
    googleAuthProviderInstance = new GoogleAuthProvider();
    googleAuthProviderInstance.addScope('https://www.googleapis.com/auth/drive.file');
    googleAuthProviderInstance.addScope('https://www.googleapis.com/auth/spreadsheets');
  }
} catch (e) {
  // Graceful fallback for offline / mock mode
  console.warn('Firebase initialization notice:', e);
  appInstance = null;
  dbInstance = null;
}

export const app = appInstance;
export const db: Firestore | null = dbInstance;
export const auth: Auth | null = authInstance;
export const googleAuthProvider = googleAuthProviderInstance;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on startup as mandated by Firebase skill
if (typeof window !== 'undefined' && db) {
  (async () => {
    try {
      await firestoreGetDocFromServer(firestoreDoc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.debug('Firebase client offline status check');
      }
    }
  })();
}

// Safe wrapper functions to prevent SDK network errors when Firestore is not provisioned
export const collection = (firestore: any, ...pathSegments: string[]) => {
  if (!firestore) return null as any;
  return firestoreCollection(firestore, pathSegments[0], ...pathSegments.slice(1));
};

export const doc = (firestore: any, ...pathSegments: string[]) => {
  if (!firestore) return null as any;
  return firestoreDoc(firestore, pathSegments[0], ...pathSegments.slice(1));
};

export const setDoc = async (reference: any, data: any, options?: any) => {
  if (!reference) return;
  return firestoreSetDoc(reference, data, options);
};

export const getDocs = async (queryRef: any) => {
  if (!queryRef) return { empty: true, size: 0, docs: [] } as any;
  return firestoreGetDocs(queryRef);
};

export const getDoc = async (reference: any) => {
  if (!reference) return { exists: () => false, data: () => null } as any;
  return firestoreGetDoc(reference);
};

export const getDocFromServer = async (reference: any) => {
  if (!reference) return { exists: () => false, data: () => null } as any;
  return firestoreGetDocFromServer(reference);
};

export const deleteDoc = async (reference: any) => {
  if (!reference) return;
  return firestoreDeleteDoc(reference);
};

export const query = (queryRef: any, ...queryConstraints: any[]) => {
  if (!queryRef) return null as any;
  return firestoreQuery(queryRef, ...queryConstraints);
};

export const orderBy = (...args: any[]) => {
  return firestoreOrderBy(args[0], args[1]);
};

export const onSnapshot = (reference: any, onNext: (snapshot: any) => void, onError?: (error: any) => void) => {
  if (!reference) return () => {};
  return firestoreOnSnapshot(reference, onNext, onError);
};

export const signInWithPopup = async (authObj: any, provider: any) => {
  if (!authObj) throw new Error('Firebase Auth is not configured.');
  return authSignInWithPopup(authObj, provider);
};

export const signOut = async (authObj: any) => {
  if (!authObj) return;
  return authSignOut(authObj);
};
