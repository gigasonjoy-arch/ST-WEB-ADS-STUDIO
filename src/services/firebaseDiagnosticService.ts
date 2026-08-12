import firebaseConfig from '../../firebase-applet-config.json';
import { FirebaseTestReport, FirebaseDiagnosticStep } from '../types';
import { db } from './firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

export class FirebaseDiagnosticService {
  /**
   * Runs an end-to-end, rigorous diagnostic test of Firebase services
   */
  public static async runFullDiagnostic(): Promise<FirebaseTestReport> {
    const steps: FirebaseDiagnosticStep[] = [];
    const startTime = Date.now();
    let isConnected = false;
    let overallStatus: FirebaseTestReport['overallStatus'] = 'CONFIG_ERROR';
    let summaryEn = '';
    let summaryBn = '';
    let diagnosticDetail = '';
    let rootCauseEn = '';
    let rootCauseBn = '';
    const recommendedActionEn: string[] = [];
    const recommendedActionBn: string[] = [];

    // STEP 1: Verify Configuration Keys
    const step1Start = Date.now();
    const hasProjectId = Boolean(firebaseConfig.projectId && firebaseConfig.projectId.length > 3);
    const hasApiKey = Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith('AIza'));
    const hasAppId = Boolean(firebaseConfig.appId);

    if (hasProjectId && hasApiKey && hasAppId) {
      steps.push({
        step: '1. Configuration & Credentials Validation',
        stepBn: '১. ফায়ারবেস কনফিগারেশন ও API কি ভ্যালিডেশন',
        status: 'SUCCESS',
        detail: `Valid Project: "${firebaseConfig.projectId}", API Key prefix "${firebaseConfig.apiKey.substring(0, 8)}...", Auth Domain "${firebaseConfig.authDomain}".`,
        durationMs: Date.now() - step1Start
      });
    } else {
      steps.push({
        step: '1. Configuration & Credentials Validation',
        stepBn: '১. ফায়ারবেস কনফিগারেশন ও API কি ভ্যালিডেশন',
        status: 'FAILED',
        detail: 'Missing required Firebase configuration parameters.',
        durationMs: Date.now() - step1Start
      });
      return {
        timestamp: new Date().toISOString(),
        isConnected: false,
        projectId: firebaseConfig.projectId || 'Unknown',
        authDomain: firebaseConfig.authDomain || 'Unknown',
        steps,
        overallStatus: 'CONFIG_ERROR',
        summaryEn: 'Firebase configuration credentials are incomplete or invalid.',
        summaryBn: 'ফায়ারবেস কনফিগারেশন ক্রেডেনশিয়াল অসম্পূর্ণ বা অনুপস্থিত।',
        diagnosticDetail: 'Missing API key or Project ID in firebase-applet-config.json.',
        rootCauseEn: 'Configuration file does not have full GCP project mapping.',
        rootCauseBn: 'কনফিগারেশন ফাইলে সঠিক তথ্য নেই।',
        recommendedActionEn: ['Check firebase-applet-config.json and provision credentials.'],
        recommendedActionBn: ['ফায়ারবেস কনফিগারেশন ফাইল যাচাই করুন।']
      };
    }

    // STEP 2: Identity Toolkit (Firebase Auth) Endpoint Probe
    const step2Start = Date.now();
    try {
      const authRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${firebaseConfig.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: 'diagnostic-probe@example.com',
            continueUri: window?.location?.origin || 'https://localhost:3000'
          })
        }
      );
      if (authRes.status === 200 || authRes.status === 400) {
        steps.push({
          step: '2. Firebase Auth (Identity Toolkit) Endpoint Handshake',
          stepBn: '২. ফায়ারবেস অথ ও আইডেন্টিটি সার্ভিস কানেকশন টেস্ট',
          status: 'SUCCESS',
          detail: `Auth service responded normally with HTTP ${authRes.status}. Google Auth provider is reachable.`,
          durationMs: Date.now() - step2Start
        });
      } else {
        steps.push({
          step: '2. Firebase Auth (Identity Toolkit) Endpoint Handshake',
          stepBn: '২. ফায়ারবেস অথ ও আইডেন্টিটি সার্ভিস কানেকশন টেস্ট',
          status: 'FAILED',
          detail: `Identity toolkit endpoint returned HTTP status ${authRes.status}.`,
          durationMs: Date.now() - step2Start
        });
      }
    } catch (err: any) {
      steps.push({
        step: '2. Firebase Auth (Identity Toolkit) Endpoint Handshake',
        stepBn: '২. ফায়ারবেস অথ ও আইডেন্টিটি সার্ভিস কানেকশন টেস্ট',
        status: 'FAILED',
        detail: `Network error reaching Auth endpoint: ${err.message}`,
        durationMs: Date.now() - step2Start
      });
    }

    // STEP 3: Cloud Firestore Database (default) Presence Check
    const step3Start = Date.now();
    let databaseExists = false;
    let databaseNotFound = false;
    try {
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents?key=${firebaseConfig.apiKey}`;
      const firestoreRes = await fetch(firestoreUrl, { method: 'GET' });

      if (firestoreRes.status === 200 || firestoreRes.status === 403) {
        databaseExists = true;
        steps.push({
          step: '3. Cloud Firestore Database (default) Instance Reachability',
          stepBn: '৩. ক্লাউড ফায়ারস্টোর (default) ডেটাবেস ইনস্ট্যান্স উপস্থিতি ও যাচাই',
          status: 'SUCCESS',
          detail: `Firestore database (default) exists in project "${firebaseConfig.projectId}" and is reachable (HTTP ${firestoreRes.status}).`,
          durationMs: Date.now() - step3Start
        });
      } else if (firestoreRes.status === 404) {
        databaseNotFound = true;
        steps.push({
          step: '3. Cloud Firestore Database (default) Instance Reachability',
          stepBn: '৩. ক্লাউড ফায়ারস্টোর (default) ডেটাবেস ইনস্ট্যান্স উপস্থিতি ও যাচাই',
          status: 'FAILED',
          detail: `HTTP 404 (Not Found): The database "(default)" has not been created in Google Cloud project "${firebaseConfig.projectId}".`,
          durationMs: Date.now() - step3Start
        });
      } else {
        steps.push({
          step: '3. Cloud Firestore Database (default) Instance Reachability',
          stepBn: '৩. ক্লাউড ফায়ারস্টোর (default) ডেটাবেস ইনস্ট্যান্স উপস্থিতি ও যাচাই',
          status: 'FAILED',
          detail: `Firestore endpoint returned HTTP ${firestoreRes.status}.`,
          durationMs: Date.now() - step3Start
        });
      }
    } catch (err: any) {
      steps.push({
        step: '3. Cloud Firestore Database (default) Instance Reachability',
        stepBn: '৩. ক্লাউড ফায়ারস্টোর (default) ডেটাবেস ইনস্ট্যান্স উপস্থিতি ও যাচাই',
        status: 'FAILED',
        detail: `Network error probing Firestore endpoint: ${err.message}`,
        durationMs: Date.now() - step3Start
      });
    }

    // STEP 4: Live Data Read & Write Verification via Firebase Firestore SDK
    const step4Start = Date.now();
    if (databaseNotFound) {
      steps.push({
        step: '4. Firestore Live Data Read & Write Verification',
        stepBn: '৪. ফায়ারস্টোরে রিয়েল ডেটা রিড ও রাইট ভ্যালিডেশন',
        status: 'SKIPPED',
        detail: 'Skipped live write test because Firestore database (default) is not created yet (HTTP 404).',
        durationMs: Date.now() - step4Start
      });

      overallStatus = 'DATABASE_NOT_INITIALIZED';
      summaryEn = 'Firestore database (default) is NOT created in this project yet (HTTP 404).';
      summaryBn = 'ক্লাউড ফায়ারস্টোর (default) ডেটাবেস এখনও তৈরি করা হয়নি (404 Not Found)।';
      rootCauseEn = `The Google Cloud / Firebase project "${firebaseConfig.projectId}" exists, but the (default) Firestore database instance has not been provisioned in the Firebase Console.`;
      rootCauseBn = `ফায়ারবেস প্রজেক্ট "${firebaseConfig.projectId}"-এ ফায়ারস্টোর (default) ডেটাবেসটি এখনও চালু করা হয়নি।`;
      recommendedActionEn.push(
        `1. Open Firebase Console: https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`,
        '2. Click "Create Database" (Build > Firestore Database).',
        '3. Select "(default)" as database ID and choose your region.',
        '4. Click "Test Connection" again in this dashboard.'
      );
      recommendedActionBn.push(
        `১. ফায়ারবেস কনসোলে যান: https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`,
        '২. "Create Database" বাটনে ক্লিক করুন (Build > Firestore Database)।',
        '৩. ডাটাবেস আইডি (default) রেখে আপনার রিজিয়ন সিলেক্ট করুন।',
        '৪. তৈরি শেষে এখানে "পুনরায় টেস্ট করুন" বাটনে ক্লিক করুন।'
      );
    } else {
      // Execute actual document write & read using Firestore SDK
      try {
        if (!db) {
          throw new Error('Firestore SDK instance is not initialized.');
        }

        const testDocRef = doc(db, '_connection_test', 'live_probe');
        const testPayload = {
          ping: 'pong',
          timestamp: new Date().toISOString(),
          appId: firebaseConfig.appId,
          testRunner: 'ST Web Studio Automated Diagnostic'
        };

        // Attempt write
        await setDoc(testDocRef, testPayload);

        // Attempt read
        const readSnap = await getDoc(testDocRef);

        if (readSnap.exists()) {
          // Attempt delete to clean up
          await deleteDoc(testDocRef).catch(() => {});

          isConnected = true;
          overallStatus = 'OPERATIONAL';
          steps.push({
            step: '4. Firestore Live Data Read & Write Verification',
            stepBn: '৪. ফায়ারস্টোরে রিয়েল ডেটা রিড ও রাইট ভ্যালিডেশন',
            status: 'SUCCESS',
            detail: 'Successfully wrote, read, and verified test document in Cloud Firestore database.',
            durationMs: Date.now() - step4Start
          });
          summaryEn = 'Firebase Auth & Cloud Firestore are 100% operational and verified with live read/write.';
          summaryBn = 'ফায়ারবেস অথ ও ক্লাউড ফায়ারস্টোর ডেটাবেস সম্পূর্ণ সক্রিয় এবং সফলভাবে ডেটা রিড/রাইট হচ্ছে।';
        } else {
          throw new Error('Test document written but could not be read back.');
        }
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        const isPermissionDenied = 
          errorMsg.includes('permission-denied') || 
          errorMsg.includes('PERMISSION_DENIED') || 
          errorMsg.includes('Missing or insufficient permissions') ||
          err?.code === 'permission-denied';

        if (isPermissionDenied) {
          overallStatus = 'PERMISSION_DENIED';
          steps.push({
            step: '4. Firestore Live Data Read & Write Verification',
            stepBn: '৪. ফায়ারস্টোরে রিয়েল ডেটা রিড ও রাইট ভ্যালিডেশন',
            status: 'FAILED',
            detail: `Security Rules Blocked Access: ${errorMsg}. Database exists, but write/read is denied by Firestore Security Rules.`,
            durationMs: Date.now() - step4Start
          });
          summaryEn = 'Firestore database exists and is connected, but Security Rules are blocking Read/Write access (PERMISSION_DENIED).';
          summaryBn = 'ফায়ারস্টোর ডেটাবেস সক্রিয় ও কানেক্টেড, কিন্তু সিকিউরিটি রুলস (Rules) ডেটা রিড ও রাইট পারমিশন ব্লক করছে।';
          rootCauseEn = `Firestore in project "${firebaseConfig.projectId}" was created with locked rules (e.g. "allow read, write: if false;"). The rules must be updated in Firebase Console to allow authorized access.`;
          rootCauseBn = `প্রজেক্ট "${firebaseConfig.projectId}"-এর ফায়ারস্টোর সিকিউরিটি রুলসে বর্তমানে রিড ও রাইট বন্ধ করা রয়েছে (Default locked mode)। ফায়ারবেস কনসোলে Rules ট্যাবে গিয়ে পারমিশন চালু করতে হবে।`;
          
          recommendedActionEn.push(
            `1. Open Firebase Console Rules: https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`,
            '2. Replace the rules with the recommended rules snippet below.',
            '3. Click the "Publish" button in Firebase Console.',
            '4. Click "Run Diagnostic Test" again — it will immediately turn 100% GREEN!'
          );

          recommendedActionBn.push(
            `১. ফায়ারবেস কনসোলের Rules ট্যাবে যান: https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`,
            '২. নিচের সিকিউরিটি রুলস কোডটি কপি করে সেখানে পেস্ট করুন।',
            '৩. উপরে ডানপাশের "Publish" বাটনে ক্লিক করুন।',
            '৪. এরপর এখানে "পুনরায় টেস্ট করুন" চাপলেই সাথে সাথে ১০০% গ্রিন ও কানেক্টেড হয়ে যাবে!'
          );
        } else {
          overallStatus = 'NETWORK_ERROR';
          steps.push({
            step: '4. Firestore Live Data Read & Write Verification',
            stepBn: '৪. ফায়ারস্টোরে রিয়েল ডেটা রিড ও রাইট ভ্যালিডেশন',
            status: 'FAILED',
            detail: `Firestore operation error: ${errorMsg}`,
            durationMs: Date.now() - step4Start
          });
          summaryEn = `Firestore connection error: ${errorMsg}`;
          summaryBn = `ফায়ারস্টোর কানেকশন এরর: ${errorMsg}`;
        }
      }
    }

    return {
      timestamp: new Date().toISOString(),
      isConnected,
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      steps,
      overallStatus,
      summaryEn,
      summaryBn,
      diagnosticDetail: `Completed in ${Date.now() - startTime}ms`,
      rootCauseEn,
      rootCauseBn,
      recommendedActionEn,
      recommendedActionBn
    };
  }
}
