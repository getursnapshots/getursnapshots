/**
 * Analytics Service (Decoupled from Firebase)
 * Provides safe in-browser event logging and conversion tracking.
 */

export interface AnalyticsEvent {
  name: string;
  params?: Record<string, string | number | boolean | undefined>;
  timestamp: string;
}

/**
 * Safe generic event logger (decoupled from external services).
 */
export async function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean | undefined>
): Promise<void> {
  try {
    if (typeof window === 'undefined') return;

    // Dispatches a custom window event for any listening analytics integrations
    const eventDetail: AnalyticsEvent = {
      name: eventName,
      params: eventParams,
      timestamp: new Date().toISOString(),
    };

    window.dispatchEvent(
      new CustomEvent('snapshots:analytics', {
        detail: eventDetail,
      })
    );
  } catch {
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
