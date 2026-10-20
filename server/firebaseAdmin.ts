import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * Server-Side Firebase Admin Initialization
 * 
 * Securely initializes Firebase Admin using environment variables:
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_CLIENT_EMAIL
 * - FIREBASE_PRIVATE_KEY
 * 
 * Explicitly connects to the user's Firestore database ID:
 * `ai-studio-snapshots-ec71ea43-3add-4edd-8daa-0bb93c5b3123`
 */

const FIRESTORE_DATABASE_ID =
  process.env.FIRESTORE_DATABASE_ID || 'ai-studio-snapshots-ec71ea43-3add-4edd-8daa-0bb93c5b3123';

let adminApp: App | null = null;
let firestoreDb: Firestore | null = null;
let adminAuth: Auth | null = null;

export function getFirebaseAdmin(): { app: App; db: Firestore; auth: Auth } {
  if (adminApp && firestoreDb && adminAuth) {
    return { app: adminApp, db: firestoreDb, auth: adminAuth };
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
  } else {
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.GCP_PROJECT ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      'stable-extension-3z2vd';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && rawPrivateKey) {
      // Clean quotes and parse escaped newlines (\n) commonly provided in Vercel env vars
      const privateKey = rawPrivateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
    } else {
      // Fallback initialization for local development or default credentials
      adminApp = initializeApp({
        projectId,
      });
    }
  }

  firestoreDb = getFirestore(adminApp, FIRESTORE_DATABASE_ID);
  adminAuth = getAuth(adminApp);

  return { app: adminApp, db: firestoreDb, auth: adminAuth };
}
