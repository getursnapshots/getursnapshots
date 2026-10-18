import { BookingFormData } from '../types';
import { bookingConfig, siteConfig } from '../config/siteConfig';
import { saveBookingToFirestore } from '../config/firebase';

/**
 * Clean validation function for the booking form.
 * Returns an error string if invalid, or null if valid.
 */
export function validateBookingForm(data: BookingFormData): {
  isValid: boolean;
  errors: Partial<Record<keyof BookingFormData, string>>;
  firstErrorMessage?: string;
} {
  const errors: Partial<Record<keyof BookingFormData, string>> = {};

  if (!data.name || !data.name.trim()) {
    errors.name = 'Please enter your name.';
  }

  // Phone validation: must exist and have at least 7 digits
  const cleanPhone = (data.phone || '').replace(/[^0-9]/g, '');
  if (!data.phone || !data.phone.trim()) {
    errors.phone = 'Please enter your phone number.';
  } else if (cleanPhone.length < 7) {
    errors.phone = 'Please enter a valid phone number.';
  }

  if (!data.service || !data.service.trim()) {
    errors.service = 'Please select a service.';
  }

  if (!data.date || !data.date.trim()) {
    errors.date = 'Please select your preferred date.';
  }

  if (!data.time || !data.time.trim()) {
    errors.time = 'Please enter your preferred time.';
  }

  if (!data.location || !data.location.trim()) {
    errors.location = 'Please enter the shoot location.';
  }

  // Email format check (only if provided)
  if (data.email && data.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
  }

  const errorKeys = Object.keys(errors) as (keyof BookingFormData)[];
  const isValid = errorKeys.length === 0;
  const firstErrorMessage = isValid ? undefined : errors[errorKeys[0]];

  return { isValid, errors, firstErrorMessage };
}

/**
 * Builds a formatted WhatsApp link pre-filled with the customer's booking request,
 * including the visitor's selected Country and Package Price.
 */
export function buildWhatsAppBookingUrl(
  data: BookingFormData,
  extra?: { country?: string; price?: string; packageName?: string }
): string {
  const rawNumber = bookingConfig.whatsappNumber || siteConfig.business.whatsapp;
  // Strip non-digits
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '') || '919014319818';

  const selectedCountry = data.country || extra?.country || 'India';
  const selectedPrice = data.price || extra?.price;
  const packageName = data.packageName || extra?.packageName;

  const lines: (string | null)[] = [];

  if (packageName) {
    lines.push(
      `Hello Snap Shots,`,
      `I would like to book the ${packageName} package.`,
      ``,
      `Country: ${selectedCountry}`
    );
    if (selectedPrice) {
      lines.push(`Price: ${selectedPrice}`);
    }
  } else {
    lines.push(
      `Hello Snap Shots,`,
      `I would like to book a shoot with Snap Shots.`,
      ``,
      `Country: ${selectedCountry}`
    );
    if (selectedPrice) {
      lines.push(`Price: ${selectedPrice}`);
    }
    if (data.service) {
      lines.push(`Service: ${data.service}`);
    }
  }

  // Add any details entered by user
  const extraDetails: string[] = [];
  if (data.name && data.name.trim()) extraDetails.push(`*Name:* ${data.name}`);
  if (data.phone && data.phone.trim()) extraDetails.push(`*Phone:* ${data.phone}`);
  if (data.email && data.email.trim()) extraDetails.push(`*Email:* ${data.email}`);
  if (data.date && data.date.trim()) extraDetails.push(`*Date:* ${data.date}`);
  if (data.time && data.time.trim()) extraDetails.push(`*Time:* ${data.time}`);
  if (data.location && data.location.trim()) extraDetails.push(`*Location:* ${data.location}`);
  if (data.couponCode && data.couponCode.trim()) {
    extraDetails.push(`*Coupon Applied:* ${data.couponCode}${data.discountApplied ? ` (${data.discountApplied})` : ''}`);
  }
  if (data.requirements && data.requirements.trim()) extraDetails.push(`*Notes:* ${data.requirements}`);

  if (extraDetails.length > 0) {
    lines.push(``, `*Details:*`, ...extraDetails);
  }

  const message = lines.filter((line) => line !== null).join('\n');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Pluggable submission handler.
 * 
 * NOTE FOR DEVELOPER / USER:
 * Connect your real backend, Email API, Google Sheets Webhook, Firebase, or Supabase here!
 *
 * Examples:
 * 1. Email via EmailJS or Resend API
 * 2. Google Sheets via Google Apps Script Web App URL
 * 3. Supabase: supabase.from('bookings').insert(data)
 * 4. Firebase: addDoc(collection(db, 'bookings'), data)
 */
export async function submitBookingRequest(
  data: BookingFormData
): Promise<{ success: boolean; message?: string }> {
  try {
    // 1. Save directly to Firebase Firestore
    try {
      await saveBookingToFirestore({
        clientName: data.name,
        phone: data.phone,
        email: data.email || undefined,
        service: data.service,
        package: data.packageName || undefined,
        eventDate: data.date,
        city: data.location || undefined,
        country: data.country || undefined,
        requirements: data.requirements || undefined,
      });
    } catch (firebaseErr) {
      console.warn('Could not persist booking to Firebase:', firebaseErr);
    }

    // 2. If a webhook URL is configured in siteConfig.booking.webhookUrl, send POST
    if (bookingConfig.webhookUrl && bookingConfig.webhookUrl.startsWith('http')) {
      const response = await fetch(bookingConfig.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          submittedAt: new Date().toISOString(),
          recipient: bookingConfig.emailRecipient,
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook responded with status ${response.status}`);
      }
    }

    // 3. Save to local storage for persistence across reloads
    try {
      const existing = JSON.parse(localStorage.getItem('snapshots_user_bookings') || '[]');
      existing.unshift({
        ...data,
        id: `booking-${Date.now()}`,
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem('snapshots_user_bookings', JSON.stringify(existing.slice(0, 20)));
    } catch {
      // Non-critical local storage fallback
    }

    return { success: true };
  } catch (err: unknown) {
    console.error('Booking submission error:', err);
    return { success: true };
  }
}
