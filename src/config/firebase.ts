import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  addDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with explicit database ID from firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on initialization
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.warn('Firebase Firestore: Please check your network / Firebase configuration.');
    }
  }
}
testConnection();

/**
 * Real-time listener for portfolio slides collection
 */
export function subscribeToSlides(
  onUpdate: (slides: Record<number, { videoUrl: string; posterUrl?: string }>) => void,
  onError?: (error: Error) => void
) {
  const path = 'slides';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const slidesMap: Record<number, { videoUrl: string; posterUrl?: string }> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (typeof data.slideIndex === 'number' && typeof data.videoUrl === 'string') {
          if (!data.videoUrl.startsWith('blob:')) {
            slidesMap[data.slideIndex] = {
              videoUrl: data.videoUrl,
              posterUrl: data.posterUrl || '',
            };
          }
        }
      });
      onUpdate(slidesMap);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

/**
 * Save slide configuration directly to Firestore
 */
export async function saveSlideToFirestore(
  slideIndex: number,
  videoUrl: string,
  posterUrl?: string
) {
  const path = `slides/slide_${slideIndex}`;
  try {
    await setDoc(doc(db, 'slides', `slide_${slideIndex}`), {
      slideIndex,
      videoUrl,
      posterUrl: posterUrl || '',
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Save booking request to Firestore
 */
export async function saveBookingToFirestore(bookingData: {
  clientName: string;
  phone: string;
  email?: string;
  service: string;
  package?: string;
  eventDate?: string;
  city?: string;
  country?: string;
  requirements?: string;
}) {
  const path = 'bookings';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...bookingData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

/**
 * Google Auth Helpers
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleAuthProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
