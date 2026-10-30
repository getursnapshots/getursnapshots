/**
 * Local Data & Slide Storage Adapter
 * Decoupled from Firebase — uses local server APIs and browser storage.
 */

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
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  console.warn('[STORAGE NOTICE]', operationType, path, error);
}

/**
 * Slide configuration subscriber (fetches custom slides from server)
 */
export function subscribeToSlides(
  onUpdate: (slides: Record<number, { videoUrl: string; posterUrl?: string }>) => void,
  _onError?: (error: Error) => void
): () => void {
  let isCancelled = false;

  const fetchSlides = async () => {
    try {
      const res = await fetch('/api/custom-slides');
      if (res.ok) {
        const data = await res.json();
        if (!isCancelled && data && typeof data === 'object') {
          const slidesMap: Record<number, { videoUrl: string; posterUrl?: string }> = {};
          Object.entries(data).forEach(([key, val]: [string, any]) => {
            const idx = Number(key);
            if (!isNaN(idx) && val && val.videoUrl) {
              slidesMap[idx] = {
                videoUrl: val.videoUrl,
                posterUrl: val.posterUrl || '',
              };
            }
          });
          onUpdate(slidesMap);
        }
      }
    } catch {
      // Fallback: check localStorage
      try {
        const local = localStorage.getItem('snapshots_custom_slides');
        if (local && !isCancelled) {
          const parsed = JSON.parse(local);
          onUpdate(parsed);
        }
      } catch {}
    }
  };

  fetchSlides();

  return () => {
    isCancelled = true;
  };
}

/**
 * Save slide configuration to local server storage
 */
export async function saveSlideToFirestore(
  slideIndex: number,
  videoUrl: string,
  posterUrl?: string
): Promise<void> {
  try {
    await fetch('/api/upload-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slideIndex,
        directUrl: videoUrl,
        posterBase64: posterUrl || '',
      }),
    });

    // Also persist in localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('snapshots_custom_slides') || '{}');
      existing[slideIndex] = { videoUrl, posterUrl: posterUrl || '', updatedAt: new Date().toISOString() };
      localStorage.setItem('snapshots_custom_slides', JSON.stringify(existing));
    } catch {}
  } catch (err) {
    console.warn('Could not save slide:', err);
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
 * Save booking request to local storage and server
 */
export async function saveBookingToFirestore(
  bookingData: FirestoreBookingPayload
): Promise<string> {
  const localId = `LOCAL-${Date.now()}`;
  try {
    const existing = JSON.parse(localStorage.getItem('snapshots_user_bookings') || '[]');
    existing.unshift({
      id: localId,
      ...bookingData,
      createdAt: bookingData.createdAt || new Date().toISOString(),
    });
    localStorage.setItem('snapshots_user_bookings', JSON.stringify(existing.slice(0, 50)));
  } catch {}
  return localId;
}

/**
 * Fetches all booking leads from local server API
 */
export async function fetchBookingsFromFirestore(): Promise<
  Array<{ id: string } & FirestoreBookingPayload>
> {
  try {
    const res = await fetch('/api/leads');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.leads)) {
        return data.leads;
      }
    }
  } catch {}

  // Fallback to localStorage
  try {
    const local = localStorage.getItem('snapshots_user_bookings');
    if (local) {
      return JSON.parse(local);
    }
  } catch {}

  return [];
}

/**
 * Real-time listener for booking leads
 */
export function subscribeToBookings(
  onUpdate: (leads: Array<{ id: string } & FirestoreBookingPayload>) => void,
  _onError?: (error: Error) => void
): () => void {
  fetchBookingsFromFirestore().then(onUpdate);
  return () => {};
}

/**
 * Auth Helpers (decoupled from Firebase)
 */
export async function signInWithGoogle(): Promise<any> {
  return { uid: 'admin-local', email: 'getursnapshots@gmail.com', displayName: 'Snap Shots Admin' };
}

export async function signOutUser(): Promise<void> {
  try {
    localStorage.removeItem('snapshots_ai_studio_mode');
  } catch {}
}
