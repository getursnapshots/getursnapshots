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
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

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

export interface FirestoreBookingPayload {
  clientName: string;
  phone: string;
  email?: string;
  service: string;
  package?: string;
  price?: string;
  eventDate?: string;
  time?: string;
  duration?: string;
  city?: string;
  country?: string;
  couponCode?: string;
  requirements?: string;
  source?: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt?: string;
}

/**
 * Save booking request to Firestore with strict sanitization and error handling
 */
export async function saveBookingToFirestore(
  bookingData: FirestoreBookingPayload
): Promise<string> {
  const path = 'bookings';
  try {
    const cleanPayload: Record<string, string> = {
      clientName: (bookingData.clientName || '').trim().slice(0, 120),
      phone: (bookingData.phone || '').trim().slice(0, 30),
      service: (bookingData.service || 'General Shoot').trim().slice(0, 100),
      createdAt: bookingData.createdAt || new Date().toISOString(),
      status: bookingData.status || 'pending',
    };

    if (bookingData.email?.trim()) cleanPayload.email = bookingData.email.trim().slice(0, 150);
    if (bookingData.package?.trim()) cleanPayload.package = bookingData.package.trim().slice(0, 100);
    if (bookingData.price?.trim()) cleanPayload.price = bookingData.price.trim().slice(0, 50);
    if (bookingData.eventDate?.trim()) cleanPayload.eventDate = bookingData.eventDate.trim().slice(0, 50);
    if (bookingData.time?.trim()) cleanPayload.time = bookingData.time.trim().slice(0, 50);
    if (bookingData.duration?.trim()) cleanPayload.duration = bookingData.duration.trim().slice(0, 50);
    if (bookingData.city?.trim()) cleanPayload.city = bookingData.city.trim().slice(0, 100);
    if (bookingData.country?.trim()) cleanPayload.country = bookingData.country.trim().slice(0, 80);
    if (bookingData.couponCode?.trim()) cleanPayload.couponCode = bookingData.couponCode.trim().slice(0, 50);
    if (bookingData.source?.trim()) cleanPayload.source = bookingData.source.trim().slice(0, 100);
    if (bookingData.requirements?.trim()) cleanPayload.requirements = bookingData.requirements.trim().slice(0, 5000);

    const docRef = await addDoc(collection(db, path), cleanPayload);
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

/**
 * Fetches all booking leads directly from Firestore (for authenticated admin)
 */
export async function fetchBookingsFromFirestore(): Promise<
  Array<{ id: string } & FirestoreBookingPayload>
> {
  const path = 'bookings';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const leads: Array<{ id: string } & FirestoreBookingPayload> = [];
    snapshot.forEach((docSnap) => {
      leads.push({
        id: docSnap.id,
        ...(docSnap.data() as FirestoreBookingPayload),
      });
    });
    return leads;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

/**
 * Real-time listener for booking leads (for authenticated admin)
 */
export function subscribeToBookings(
  onUpdate: (leads: Array<{ id: string } & FirestoreBookingPayload>) => void,
  onError?: (error: Error) => void
) {
  const path = 'bookings';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const leads: Array<{ id: string } & FirestoreBookingPayload> = [];
      snapshot.forEach((docSnap) => {
        leads.push({
          id: docSnap.id,
          ...(docSnap.data() as FirestoreBookingPayload),
        });
      });
      onUpdate(leads);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
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
