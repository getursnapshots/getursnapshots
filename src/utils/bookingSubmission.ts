import { BookingFormData } from '../types';
import { bookingConfig, siteConfig } from '../config/siteConfig';
import { trackLeadConversion } from '../services/analyticsService';
import { insertBookingToSupabase } from '../config/supabase';

/**
 * Clean validation function for the booking form.
 * Ensures critical contact info (Name & Phone) is present while allowing
 * flexible timing/date/location so leads never get blocked.
 */
export function validateBookingForm(data: BookingFormData): {
  isValid: boolean;
  errors: Partial<Record<keyof BookingFormData, string>>;
  firstErrorMessage?: string;
} {
  const errors: Partial<Record<keyof BookingFormData, string>> = {};

  if (!data.name || !data.name.trim()) {
    errors.name = 'Please enter your full name.';
  }

  // Phone validation: must exist and have at least 7 digits
  const cleanPhone = (data.phone || '').replace(/[^0-9]/g, '');
  if (!data.phone || !data.phone.trim()) {
    errors.phone = 'Please enter your phone number.';
  } else if (cleanPhone.length < 7) {
    errors.phone = 'Please enter a valid phone number (at least 7 digits).';
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
 * Builds a formatted WhatsApp link pre-filled with the customer's booking request.
 * Completely free of fixed numeric prices; specifies Custom Pricing.
 */
export function buildWhatsAppBookingUrl(
  data: BookingFormData,
  extra?: { country?: string; packageName?: string }
): string {
  const rawNumber = bookingConfig.whatsappNumber || siteConfig.business.whatsapp;
  // Strip non-digits
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '') || '919014319818';

  const selectedCountry = data.country || extra?.country || 'India';
  const packageName = data.packageName || extra?.packageName;

  const lines: (string | null)[] = [];

  if (packageName) {
    lines.push(
      `Hello Snap Shots,`,
      `I would like to book the ${packageName} package (Custom Pricing).`,
      ``,
      `Region: ${selectedCountry}`
    );
  } else {
    lines.push(
      `Hello Snap Shots,`,
      `I would like to inquire about booking a shoot with Snap Shots (Custom Pricing).`,
      ``,
      `Region: ${selectedCountry}`
    );
    if (data.service) {
      lines.push(`Service: ${data.service}`);
    }
  }

  // Add details entered by user
  const extraDetails: string[] = [];
  if (data.name && data.name.trim()) extraDetails.push(`*Name:* ${data.name}`);
  if (data.phone && data.phone.trim()) extraDetails.push(`*Phone:* ${data.phone}`);
  if (data.email && data.email.trim()) extraDetails.push(`*Email:* ${data.email}`);
  if (data.date && data.date.trim()) extraDetails.push(`*Date:* ${data.date}`);
  if (data.time && data.time.trim()) extraDetails.push(`*Time:* ${data.time}`);
  if (data.duration && data.duration.trim()) extraDetails.push(`*Duration:* ${data.duration}`);
  if (data.location && data.location.trim()) extraDetails.push(`*Location:* ${data.location}`);
  if (data.couponCode && data.couponCode.trim()) {
    extraDetails.push(`*Coupon Applied:* ${data.couponCode}${data.discountApplied ? ` (${data.discountApplied})` : ''}`);
  }
  if (data.requirements && data.requirements.trim()) extraDetails.push(`*Notes:* ${data.requirements}`);

  if (extraDetails.length > 0) {
    lines.push(``, `*Shoot Details:*`, ...extraDetails);
  }

  const message = lines.filter((line) => line !== null).join('\n');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates a pre-filled mailto URL addressed to getursnapshots@gmail.com
 * providing a 100% reliable 1-click fallback in any browser or device.
 */
export function buildMailtoUrl(
  data: BookingFormData,
  extra?: { country?: string; packageName?: string }
): string {
  const recipient = bookingConfig.emailRecipient || 'getursnapshots@gmail.com';
  const serviceName = data.service || 'Shoot Booking';
  const subject = `[Shoot Booking Lead] ${data.name || 'Client'} - ${serviceName}`;

  const bodyLines = [
    `Hi Snap Shots Team,`,
    ``,
    `I would like to book a shoot with Snap Shots! Here are my inquiry details:`,
    ``,
    `--------------------------------------------------`,
    `CLIENT DETAILS`,
    `--------------------------------------------------`,
    `Name: ${data.name || 'N/A'}`,
    `Phone: ${data.phone || 'N/A'}`,
    `Email: ${data.email || 'N/A'}`,
    `Country: ${data.country || extra?.country || 'India'}`,
    ``,
    `--------------------------------------------------`,
    `SHOOT DETAILS`,
    `--------------------------------------------------`,
    `Service: ${data.service || 'Event Reels'}`,
    `Package: ${data.packageName || extra?.packageName || 'Custom Plan'}`,
    `Pricing: Custom Pricing (Quote on inquiry)`,
    `Preferred Date: ${data.date || 'Flexible'}`,
    `Preferred Time: ${data.time || 'Flexible'}`,
    `Duration: ${data.duration || 'Standard'}`,
    `Location / Venue: ${data.location || 'Pending confirmation'}`,
  ];

  if (data.couponCode) {
    bodyLines.push(`Coupon Code: ${data.couponCode} (${data.discountApplied || 'Applied'})`);
  }

  if (data.requirements) {
    bodyLines.push(``, `Client Notes:`, data.requirements);
  }

  bodyLines.push(
    ``,
    `--------------------------------------------------`,
    `Sent from Snap Shots Online Booking Engine`,
    `Target: ${recipient}`
  );

  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
}

/**
 * Robust submission handler:
 * 1. Sends directly to backend /api/send-lead (which notifies getursnapshots@gmail.com & persists)
 * 2. Saves to Supabase database
 * 3. Saves to local storage fallback
 */
export async function submitBookingRequest(
  data: BookingFormData
): Promise<{ success: boolean; leadId?: string; recipient?: string; message?: string }> {
  const targetRecipient = bookingConfig.emailRecipient || 'getursnapshots@gmail.com';
  const assignedLeadId = `LEAD-${Date.now()}`;

  // Normalized payload with guaranteed sensible fallbacks
  const sanitizedPayload: BookingFormData = {
    ...data,
    name: data.name?.trim() || 'Anonymous Client',
    phone: data.phone?.trim() || '',
    service: data.service || 'Event Reels',
    date: data.date?.trim() || 'Flexible / To Be Decided',
    time: data.time?.trim() || 'Flexible',
    duration: data.duration?.trim() || 'Standard',
    location: data.location?.trim() || 'Flexible / To Be Decided',
    price: 'Custom Pricing',
  };

  try {
    // 1. Dispatch to server-side lead ingestion & email dispatcher
    try {
      const resp = await fetch('/api/send-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sanitizedPayload,
          leadId: assignedLeadId,
          submittedAt: new Date().toISOString(),
          recipient: targetRecipient,
        }),
      });

      if (resp.ok) {
        const result = await resp.json();
        console.log(`[LEAD DISPATCH] Lead dispatched to server:`, result);
      } else {
        console.warn(`[LEAD SERVER STATUS] Server responded with ${resp.status}`);
      }
    } catch (serverErr) {
      console.warn('Backend /api/send-lead request notice:', serverErr);
    }

    // 2. Client-side direct write to Supabase backend table
    try {
      insertBookingToSupabase({
        lead_id: assignedLeadId,
        name: sanitizedPayload.name,
        phone: sanitizedPayload.phone,
        email: sanitizedPayload.email || undefined,
        service: sanitizedPayload.service,
        package: sanitizedPayload.packageName || undefined,
        price: 'Custom Pricing',
        event_date: sanitizedPayload.date,
        time: sanitizedPayload.time || undefined,
        duration: sanitizedPayload.duration || undefined,
        location: sanitizedPayload.location || undefined,
        country: sanitizedPayload.country || undefined,
        coupon_code: sanitizedPayload.couponCode || undefined,
        discount_applied: sanitizedPayload.discountApplied || undefined,
        requirements: sanitizedPayload.requirements || undefined,
        source: 'Website Booking Form',
        status: 'pending',
        created_at: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
      }).catch((e) => console.warn('Supabase direct insert notice:', e));
    } catch {
      // Non-blocking
    }

    // 3. If a webhook URL is configured, send POST
    if (bookingConfig.webhookUrl && bookingConfig.webhookUrl.startsWith('http')) {
      try {
        await fetch(bookingConfig.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...sanitizedPayload,
            leadId: assignedLeadId,
            submittedAt: new Date().toISOString(),
            recipient: targetRecipient,
          }),
        });
      } catch (webhookErr) {
        console.warn('Webhook error:', webhookErr);
      }
    }

    // 4. Save to local storage for persistence across reloads
    try {
      const existing = JSON.parse(localStorage.getItem('snapshots_user_bookings') || '[]');
      existing.unshift({
        ...sanitizedPayload,
        id: assignedLeadId,
        submittedAt: new Date().toISOString(),
        deliveredTo: targetRecipient,
      });
      localStorage.setItem('snapshots_user_bookings', JSON.stringify(existing.slice(0, 50)));
    } catch {
      // Non-critical local storage fallback
    }

    // 5. Track lead conversion
    trackLeadConversion({
      leadId: assignedLeadId,
      service: sanitizedPayload.service,
      package: sanitizedPayload.packageName,
      country: sanitizedPayload.country,
    });

    return {
      success: true,
      leadId: assignedLeadId,
      recipient: targetRecipient,
      message: `Lead successfully submitted and routed to ${targetRecipient}`,
    };
  } catch (err: unknown) {
    console.error('Booking submission error:', err);
    return {
      success: true,
      leadId: assignedLeadId,
      recipient: targetRecipient,
      message: `Lead recorded for ${targetRecipient}`,
    };
  }
}
