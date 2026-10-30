import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_PROJECT_ID =
  process.env.SUPABASE_PROJECT_ID || 'llxrklcidaqszupftvmc';

const SUPABASE_URL =
  process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  'sb_publishable_mdNjYvjlrsH9-8vzDIyjMQ_BdZDdhiq';

let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseClientInstance;
}

export interface SupabaseBookingPayload {
  id?: string;
  leadId?: string;
  name?: string;
  clientName?: string;
  phone?: string;
  email?: string;
  service?: string;
  package?: string;
  packageName?: string;
  price?: string;
  date?: string;
  eventDate?: string;
  time?: string;
  duration?: string;
  location?: string;
  city?: string;
  country?: string;
  couponCode?: string;
  discountApplied?: string;
  requirements?: string;
  message?: string;
  source?: string;
  status?: string;
  createdAt?: string;
  submittedAt?: string;
}

/**
 * Format payload into clean row matching standard Supabase SQL columns
 */
function toSupabaseRow(payload: SupabaseBookingPayload): Record<string, any> {
  const row: Record<string, any> = {
    lead_id: payload.id || payload.leadId,
    name: payload.name || payload.clientName || 'Anonymous Client',
    phone: payload.phone || null,
    email: payload.email || null,
    service: payload.service || 'General Shoot',
    package: payload.package || payload.packageName || 'Custom',
    price: payload.price || null,
    event_date: payload.eventDate || payload.date || 'Flexible',
    time: payload.time || 'Flexible',
    duration: payload.duration || 'Standard',
    location: payload.location || payload.city || 'Pending confirmation',
    country: payload.country || 'India',
    coupon_code: payload.couponCode || null,
    discount_applied: payload.discountApplied || null,
    requirements: payload.requirements || payload.message || null,
    source: payload.source || 'Website Booking Form',
    status: payload.status || 'pending',
    created_at: payload.createdAt || new Date().toISOString(),
    submitted_at: payload.submittedAt || new Date().toISOString(),
  };

  return row;
}

/**
 * Save booking lead to Supabase backend table
 * Tries 'bookings', falls back to 'appointments' or 'leads'
 */
export async function saveLeadToSupabase(
  payload: SupabaseBookingPayload
): Promise<{ success: boolean; supabaseId?: string; table?: string; error?: string }> {
  try {
    const supabase = getSupabaseServerClient();
    const row = toSupabaseRow(payload);

    // 1. Primary target table: 'bookings'
    const { data: bookingData, error: bookingErr } = await supabase
      .from('bookings')
      .insert([row])
      .select();

    if (!bookingErr && bookingData && bookingData.length > 0) {
      const savedId = bookingData[0].id || bookingData[0].lead_id;
      console.log(`[SUPABASE SUCCESS] Appointment saved to 'bookings' table. ID: ${savedId}`);
      return { success: true, supabaseId: String(savedId), table: 'bookings' };
    }

    // If 'bookings' table not found in schema cache, try alternative candidate tables
    if (bookingErr && (bookingErr.code === 'PGRST205' || bookingErr.message?.includes('schema cache'))) {
      console.warn(`[SUPABASE] Table 'bookings' not found yet. Trying 'appointments'...`);
      const { data: aptData, error: aptErr } = await supabase
        .from('appointments')
        .insert([row])
        .select();

      if (!aptErr && aptData && aptData.length > 0) {
        const savedId = aptData[0].id || aptData[0].lead_id;
        console.log(`[SUPABASE SUCCESS] Appointment saved to 'appointments' table. ID: ${savedId}`);
        return { success: true, supabaseId: String(savedId), table: 'appointments' };
      }

      // Try 'leads' table
      const { data: leadData, error: leadErr } = await supabase
        .from('leads')
        .insert([row])
        .select();

      if (!leadErr && leadData && leadData.length > 0) {
        const savedId = leadData[0].id || leadData[0].lead_id;
        console.log(`[SUPABASE SUCCESS] Appointment saved to 'leads' table. ID: ${savedId}`);
        return { success: true, supabaseId: String(savedId), table: 'leads' };
      }

      const lastErr = leadErr || aptErr || bookingErr;
      console.warn('[SUPABASE NOTICE] Tables not initialized yet in Supabase schema. Run supabase_schema.sql in Supabase SQL editor.');
      return {
        success: false,
        error: `Supabase table not found (${lastErr?.message || 'Run supabase_schema.sql in SQL editor'})`,
      };
    }

    if (bookingErr) {
      console.warn('[SUPABASE INSERT WARNING]', bookingErr.message);
      return { success: false, error: bookingErr.message };
    }

    return { success: true, table: 'bookings' };
  } catch (err: any) {
    console.warn('[SUPABASE EXCEPTION]', err?.message || err);
    return { success: false, error: err?.message || 'Supabase operation failed' };
  }
}

/**
 * Fetch booking leads from Supabase backend table
 */
export async function fetchLeadsFromSupabase(): Promise<any[]> {
  try {
    const supabase = getSupabaseServerClient();

    // Try 'bookings' table
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map((item) => ({
        id: item.id || item.lead_id,
        leadId: item.lead_id,
        name: item.name,
        clientName: item.name,
        phone: item.phone,
        email: item.email,
        service: item.service,
        package: item.package,
        packageName: item.package,
        price: item.price,
        date: item.event_date,
        eventDate: item.event_date,
        time: item.time,
        duration: item.duration,
        location: item.location,
        city: item.location,
        country: item.country,
        couponCode: item.coupon_code,
        discountApplied: item.discount_applied,
        requirements: item.requirements,
        status: item.status || 'pending',
        createdAt: item.created_at,
        submittedAt: item.submitted_at || item.created_at,
        source: item.source || 'Supabase Backend',
      }));
    }

    // Try 'appointments' table
    const { data: aptData, error: aptErr } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false });

    if (!aptErr && Array.isArray(aptData)) {
      return aptData;
    }

    return [];
  } catch (err) {
    console.warn('[SUPABASE FETCH EXCEPTION]', err);
    return [];
  }
}
