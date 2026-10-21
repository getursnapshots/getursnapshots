import { getAnalytics, logEvent, isSupported, Analytics } from 'firebase/analytics';
import { app } from '../config/firebase';

let analyticsInstance: Analytics | null = null;
let initPromise: Promise<Analytics | null> | null = null;

/**
 * Initializes Firebase Analytics safely (checks browser support & window context).
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null;
  if (analyticsInstance) return analyticsInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const supported = await isSupported();
      if (supported) {
        analyticsInstance = getAnalytics(app);
        return analyticsInstance;
      }
    } catch (err) {
      console.warn('[ANALYTICS NOTICE] Firebase Analytics not supported or blocked in this environment:', err);
    }
    return null;
  })();

  return initPromise;
}

/**
 * Safe generic event logger with Firebase Analytics.
 */
export async function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean | undefined>
): Promise<void> {
  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    }
  } catch (err) {
    // Non-blocking telemetry notice
  }
}

/**
 * Track user clicking 'Book a Shoot' or any booking CTA.
 */
export function trackBookShootClick(params: {
  location?: string;
  buttonText?: string;
  buttonId?: string;
  service?: string;
  packageId?: string;
  country?: string;
}): void {
  trackEvent('book_shoot_click', {
    cta_location: params.location || 'unknown',
    button_text: params.buttonText || 'Book a Shoot',
    button_id: params.buttonId || 'unspecified',
    service: params.service || 'unselected',
    package_id: params.packageId || 'unselected',
    country: params.country || 'unselected',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track user interactions with the Floating WhatsApp widget.
 */
export function trackWhatsAppInteraction(params: {
  action: 'open_widget' | 'close_widget' | 'send_message' | 'click_suggested_chip';
  pagePath?: string;
  contextTag?: string;
  messagePreview?: string;
}): void {
  trackEvent('whatsapp_interaction', {
    action: params.action,
    page_path: params.pagePath || (typeof window !== 'undefined' ? window.location.pathname : '/'),
    context_tag: params.contextTag || 'general',
    message_length: params.messagePreview ? params.messagePreview.length : 0,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Track successful lead creation / form submission.
 */
export function trackLeadConversion(params: {
  leadId: string;
  service: string;
  package?: string;
  country?: string;
}): void {
  trackEvent('generate_lead', {
    lead_id: params.leadId,
    service: params.service,
    package: params.package || 'custom',
    country: params.country || 'India',
    timestamp: new Date().toISOString(),
  });
}
