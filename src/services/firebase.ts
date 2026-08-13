import { initializeApp, getApps, getApp, setLogLevel } from 'firebase/app';
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
  disableNetwork as firestoreDisableNetwork,
  terminate as firestoreTerminate,
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

export const isQuotaExceeded = () => {
  if (typeof window === 'undefined') return false;
  
  // Check sessionStorage
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('firestore_quota_exceeded') === 'true') {
    return true;
  }
  
  // Check localStorage with a 24-hour expiration check (resets daily)
  if (typeof localStorage !== 'undefined') {
    const quotaExceededTime = localStorage.getItem('firestore_quota_exceeded_time');
    if (quotaExceededTime) {
      const exceededDate = new Date(parseInt(quotaExceededTime, 10));
      const now = new Date();
      // Check if it's the same calendar day
      if (exceededDate.toDateString() === now.toDateString()) {
        return true;
      } else {
        // Clean up stale quota marker
        try {
          localStorage.removeItem('firestore_quota_exceeded_time');
        } catch (e) {}
      }
    }
  }
  return false;
};

// Check if Firestore quota has been exceeded previously in this session or day
const isFirestoreQuotaExceeded = typeof window !== 'undefined' && isQuotaExceeded();

// Initialize Firebase App safely
let appInstance: any = null;
let dbInstance: any = null;
let authInstance: any = null;
let googleAuthProviderInstance: any = null;

try {
  if (typeof window !== 'undefined') {
    try {
      setLogLevel('silent');
    } catch (err) {}
  }
  if (activeFirebaseConfig && activeFirebaseConfig.projectId) {
    appInstance = !getApps().length ? initializeApp(activeFirebaseConfig) : getApp();
    const dbId = activeFirebaseConfig.firestoreDatabaseId;
    if (!isFirestoreQuotaExceeded) {
      dbInstance = dbId ? getFirestore(appInstance, dbId) : getFirestore(appInstance);
    } else {
      console.warn('⚠️ [Firebase Sync] Firestore quota was previously exceeded. Initializing in offline REST API / Local cache fallback mode.');
      dbInstance = null;
    }
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
if (typeof window !== 'undefined' && db && !isQuotaExceeded()) {
  (async () => {
    try {
      await firestoreGetDocFromServer(firestoreDoc(db, 'test', 'connection'));
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      const errCode = error?.code || '';
      if (errCode === 'resource-exhausted' || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('exhausted')) {
        console.warn('⚠️ [Firebase Sync] Firestore quota limit exceeded detected on startup. Disabling Firestore network connection to run in offline local cache mode.');
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('firestore_quota_exceeded', 'true');
          }
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('firestore_quota_exceeded_time', Date.now().toString());
          }
          await firestoreDisableNetwork(db);
          await firestoreTerminate(db);
        } catch (networkErr) {
          console.debug('Failed to disable network or terminate:', networkErr);
        }
      } else if (errMsg.includes('the client is offline')) {
        console.debug('Firebase client offline status check');
      }
    }
  })();
}

// Safe wrapper functions to prevent SDK network errors when Firestore is not provisioned
export const collection = (firestore: any, ...pathSegments: string[]) => {
  if (!firestore || isQuotaExceeded()) return null as any;
  return firestoreCollection(firestore, pathSegments[0], ...pathSegments.slice(1));
};

export const doc = (firestore: any, ...pathSegments: string[]) => {
  if (!firestore || isQuotaExceeded()) return null as any;
  return firestoreDoc(firestore, pathSegments[0], ...pathSegments.slice(1));
};

// Helper to recursively remove undefined properties from Firestore data
const cleanFirestoreData = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) {
    return obj.map(item => cleanFirestoreData(item));
  }
  if (typeof obj === 'object') {
    // Keep standard Firestore classes like GeoPoint, DocumentReference, etc.
    if (obj.constructor && obj.constructor.name !== 'Object' && obj.constructor.name !== 'Array') {
      return obj;
    }
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val !== undefined) {
        cleaned[key] = cleanFirestoreData(val);
      }
    }
    return cleaned;
  }
  return obj;
};

// Global flag to log quota warning only once
let isQuotaExceededLogged = false;

const markQuotaExceededAndDisable = () => {
  if (!isQuotaExceededLogged) {
    console.warn('⚠️ [Firebase Sync] Firestore write quota limit exceeded. Disabling online sync to prevent background retries. Working in local-offline cache mode.');
    isQuotaExceededLogged = true;
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem('firestore_quota_exceeded', 'true');
      } catch (e) {}
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('firestore_quota_exceeded_time', Date.now().toString());
      } catch (e) {}
    }
    if (dbInstance) {
      firestoreDisableNetwork(dbInstance).catch(() => {});
      firestoreTerminate(dbInstance).catch(() => {});
    }
  }
};

export const setDoc = async (reference: any, data: any, options?: any) => {
  if (!reference || isQuotaExceeded()) return;
  try {
    const cleanedData = cleanFirestoreData(data);
    return await firestoreSetDoc(reference, cleanedData, options);
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    const errCode = err?.code || '';
    if (errCode === 'resource-exhausted' || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('exhausted')) {
      markQuotaExceededAndDisable();
      return; // Resolve gracefully to prevent blocking any state flows
    }
    console.debug('Firestore setDoc notice:', err);
    throw err;
  }
};

export const getDocs = async (queryRef: any) => {
  if (!queryRef || isQuotaExceeded()) return { empty: true, size: 0, docs: [] } as any;
  try {
    return await firestoreGetDocs(queryRef);
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    const errCode = err?.code || '';
    if (errCode === 'resource-exhausted' || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('exhausted')) {
      markQuotaExceededAndDisable();
      return { empty: true, size: 0, docs: [] } as any;
    }
    throw err;
  }
};

export const getDoc = async (reference: any) => {
  if (!reference || isQuotaExceeded()) return { exists: () => false, data: () => null } as any;
  try {
    return await firestoreGetDoc(reference);
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    const errCode = err?.code || '';
    if (errCode === 'resource-exhausted' || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('exhausted')) {
      markQuotaExceededAndDisable();
      return { exists: () => false, data: () => null } as any;
    }
    throw err;
  }
};

export const getDocFromServer = async (reference: any) => {
  if (!reference || isQuotaExceeded()) return { exists: () => false, data: () => null } as any;
  try {
    return await firestoreGetDocFromServer(reference);
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    const errCode = err?.code || '';
    if (errCode === 'resource-exhausted' || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('exhausted')) {
      markQuotaExceededAndDisable();
      return { exists: () => false, data: () => null } as any;
    }
    throw err;
  }
};

export const deleteDoc = async (reference: any) => {
  if (!reference || isQuotaExceeded()) return;
  try {
    return await firestoreDeleteDoc(reference);
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    const errCode = err?.code || '';
    if (errCode === 'resource-exhausted' || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('exhausted')) {
      markQuotaExceededAndDisable();
      return; // Ignore quota exhaustions safely
    }
    console.debug('Firestore deleteDoc notice:', err);
    throw err;
  }
};

export const query = (queryRef: any, ...queryConstraints: any[]) => {
  if (!queryRef || isQuotaExceeded()) return null as any;
  return firestoreQuery(queryRef, ...queryConstraints);
};

export const orderBy = (...args: any[]) => {
  return firestoreOrderBy(args[0], args[1]);
};

export const onSnapshot = (reference: any, onNext: (snapshot: any) => void, onError?: (error: any) => void) => {
  if (!reference || isQuotaExceeded()) return () => {};
  
  const wrappedOnError = (err: any) => {
    const errMsg = err?.message || String(err);
    const errCode = err?.code || '';
    if (errCode === 'resource-exhausted' || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('exhausted')) {
      markQuotaExceededAndDisable();
      if (onError) {
        onError(err);
      }
      return;
    }
    if (onError) {
      onError(err);
    } else {
      console.debug('Firestore onSnapshot subscription notice:', err);
    }
  };

  return firestoreOnSnapshot(reference, onNext, wrappedOnError);
};

export const signInWithPopup = async (authObj: any, provider: any) => {
  if (!authObj) throw new Error('Firebase Auth is not configured.');
  return authSignInWithPopup(authObj, provider);
};

export const signOut = async (authObj: any) => {
  if (!authObj) return;
  return authSignOut(authObj);
};
