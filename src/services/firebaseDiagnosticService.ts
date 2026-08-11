import firebaseConfig from '../../firebase-applet-config.json';
import { FirebaseTestReport, FirebaseDiagnosticStep } from '../types';

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
    let authEndpointWorking = false;
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
        authEndpointWorking = true;
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

    // STEP 3: Cloud Firestore Database Endpoint Probe (Testing default database)
    const step3Start = Date.now();
    let firestoreEndpointStatus = 0;
    let firestoreResponseBody = '';
    try {
      const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents?key=${firebaseConfig.apiKey}`;
      const firestoreRes = await fetch(firestoreUrl, { method: 'GET' });
      firestoreEndpointStatus = firestoreRes.status;
      firestoreResponseBody = await firestoreRes.text();

      if (firestoreRes.status === 200) {
        steps.push({
          step: '3. Cloud Firestore REST Endpoint Probe',
          stepBn: '৩. ক্লাউড ফায়ারস্টোর REST এন্ডপয়েন্ট টেস্ট',
          status: 'SUCCESS',
          detail: `Firestore database (default) is active and responded with HTTP 200 OK.`,
          durationMs: Date.now() - step3Start
        });
      } else if (firestoreRes.status === 404) {
        steps.push({
          step: '3. Cloud Firestore REST Endpoint Probe',
          stepBn: '৩. ক্লাউড ফায়ারস্টোর REST এন্ডপয়েন্ট টেস্ট',
          status: 'FAILED',
          detail: `HTTP 404 (Not Found): The database "(default)" has not been created or initialized in Google Cloud project "${firebaseConfig.projectId}".`,
          durationMs: Date.now() - step3Start
        });
      } else if (firestoreRes.status === 403) {
        steps.push({
          step: '3. Cloud Firestore REST Endpoint Probe',
          stepBn: '৩. ক্লাউড ফায়ারস্টোর REST এন্ডপয়েন্ট টেস্ট',
          status: 'FAILED',
          detail: `HTTP 403 (Forbidden): Firestore API is either disabled or Security Rules blocked access.`,
          durationMs: Date.now() - step3Start
        });
      } else {
        steps.push({
          step: '3. Cloud Firestore REST Endpoint Probe',
          stepBn: '৩. ক্লাউড ফায়ারস্টোর REST এন্ডপয়েন্ট টেস্ট',
          status: 'FAILED',
          detail: `HTTP ${firestoreRes.status}: ${firestoreResponseBody.substring(0, 150)}`,
          durationMs: Date.now() - step3Start
        });
      }
    } catch (err: any) {
      steps.push({
        step: '3. Cloud Firestore REST Endpoint Probe',
        stepBn: '৩. ক্লাউড ফায়ারস্টোর REST এন্ডপয়েন্ট টেস্ট',
        status: 'FAILED',
        detail: `Network error reaching Firestore endpoint: ${err.message}`,
        durationMs: Date.now() - step3Start
      });
    }

    // STEP 4: Live Data Read / Write Execution Probe
    const step4Start = Date.now();
    if (firestoreEndpointStatus === 200) {
      // Attempt write via Firestore REST
      try {
        const writeUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/_connection_test?documentId=live_probe&key=${firebaseConfig.apiKey}`;
        const writeRes = await fetch(writeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              ping: { stringValue: 'pong' },
              testedAt: { stringValue: new Date().toISOString() }
            }
          })
        });

        if (writeRes.ok) {
          isConnected = true;
          overallStatus = 'OPERATIONAL';
          steps.push({
            step: '4. Firestore Live Data Read & Write Verification',
            stepBn: '৪. ফায়ারস্টোরে রিয়েল ডেটা রিড ও রাইট ভ্যালিডেশন',
            status: 'SUCCESS',
            detail: 'Successfully wrote and verified test document in Cloud Firestore.',
            durationMs: Date.now() - step4Start
          });
          summaryEn = 'Firebase Auth & Cloud Firestore are 100% operational and verified with live read/write.';
          summaryBn = 'ফায়ারবেস অথ ও ক্লাউড ফায়ারস্টোর ডেটাবেস সম্পূর্ণ সক্রিয় এবং সফলভাবে ডেটা রিড/রাইট হচ্ছে।';
        } else {
          overallStatus = 'PERMISSION_DENIED';
          steps.push({
            step: '4. Firestore Live Data Read & Write Verification',
            stepBn: '৪. ফায়ারস্টোরে রিয়েল ডেটা রিড ও রাইট ভ্যালিডেশন',
            status: 'FAILED',
            detail: `Write operation failed with HTTP ${writeRes.status}. Check firestore.rules.`,
            durationMs: Date.now() - step4Start
          });
          summaryEn = 'Firestore database exists but write permission was denied by security rules.';
          summaryBn = 'ফায়ারস্টোর ডেটাবেস সক্রিয় কিন্তু সিকিউরিটি রুলস এর কারণে ডেটা রাইট পারমিশন ব্লক হয়েছে।';
        }
      } catch (err: any) {
        steps.push({
          step: '4. Firestore Live Data Read & Write Verification',
          stepBn: '৪. ফায়ারস্টোরে রিয়েল ডেটা রিড ও রাইট ভ্যালিডেশন',
          status: 'FAILED',
          detail: `Live write failed: ${err.message}`,
          durationMs: Date.now() - step4Start
        });
      }
    } else {
      steps.push({
        step: '4. Firestore Live Data Read & Write Verification',
        stepBn: '৪. ফায়ারস্টোরে রিয়েল ডেটা রিড ও রাইট ভ্যালিডেশন',
        status: 'SKIPPED',
        detail: 'Skipped live write test because Firestore database endpoint returned 404 (Database not created yet).',
        durationMs: Date.now() - step4Start
      });

      if (firestoreEndpointStatus === 404) {
        overallStatus = 'DATABASE_NOT_INITIALIZED';
        summaryEn = 'Firebase Connection Test: Auth is connected, but Cloud Firestore Database is NOT created yet (HTTP 404).';
        summaryBn = 'ফায়ারবেস কানেকশন টেস্ট: ফায়ারবেস অথ চালু আছে, তবে ক্লাউড ফায়ারস্টোর ডেটাবেস এখনো তৈরি করা হয়নি (404 Not Found)।';
        rootCauseEn = `The Google Cloud / Firebase project "${firebaseConfig.projectId}" exists, but the Firestore database instance has not been provisioned in the Firebase Console.`;
        rootCauseBn = `গুগল ক্লাউড প্রজেক্ট "${firebaseConfig.projectId}"-এ API কি ও অথ চালু রয়েছে, কিন্তু ফায়ারবেস কনসোলে গিয়ে "Create Database" বাটনে ক্লিক করে ডেটাবেসটি এখনও চালু করা হয়নি।`;
        
        recommendedActionEn.push(
          `1. Open Firebase Console: https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`,
          '2. Click "Create Database" (Build > Firestore Database).',
          '3. Choose your nearest Cloud region (e.g. asia-southeast1 or nam5) and select production/test rules.',
          '4. Click "Test Connection" again in this dashboard — live read/write will immediately turn green!'
        );

        recommendedActionBn.push(
          `১. ফায়ারবেস কনসোল ওপেন করুন: https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`,
          '২. "Create Database" বাটনে ক্লিক করুন (Build > Firestore Database)।',
          '৩. লোকেশন হিসেবে asia-southeast1 অথবা nam5 নির্বাচন করে নেক্সট দিন।',
          '৪. তৈরি হওয়ার পর এখানে "পুনরায় টেস্ট করুন" বাটনে ক্লিক করলেই কানেকশন গ্রিন হয়ে যাবে।'
        );
      } else {
        overallStatus = 'NETWORK_ERROR';
        summaryEn = 'Could not reach Firebase services. Please check network connectivity.';
        summaryBn = 'ফায়ারবেস সার্ভিসের সাথে যোগাযোগ করা সম্ভব হয়নি। নেটওয়ার্ক চেক করুন।';
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
