import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID =
  import.meta.env?.VITE_SUPABASE_PROJECT_ID || 'llxrklcidaqszupftvmc';

export const SUPABASE_URL =
  import.meta.env?.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;

export const SUPABASE_ANON_KEY =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_mdNjYvjlrsH9-8vzDIyjMQ_BdZDdhiq';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseBookingRow {
  id?: string;
  lead_id?: string;
  name: string;
  phone?: string;
  email?: string;
  service: string;
  package?: string;
  price?: string;
  event_date?: string;
  time?: string;
  duration?: string;
  location?: string;
  country?: string;
  coupon_code?: string;
  discount_applied?: string;
  requirements?: string;
  source?: string;
  status?: string;
  created_at?: string;
  submitted_at?: string;
}

/**
 * Direct client helper to submit booking to Supabase
 */
export async function insertBookingToSupabase(
  booking: SupabaseBookingRow
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Try primary table 'bookings'
    const { data, error } = await supabase.from('bookings').insert([booking]).select();

    if (!error && data) {
      return { success: true, data };
    }

    // Fallback: try table 'appointments' if 'bookings' does not exist
    if (error && error.code === 'PGRST205') {
      const fallback = await supabase.from('appointments').insert([booking]).select();
      if (!fallback.error && fallback.data) {
        return { success: true, data: fallback.data };
      }
    }

    if (error) {
      console.warn('[SUPABASE INSERT NOTICE]', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.warn('[SUPABASE INSERT EXCEPTION]', err);
    return { success: false, error: err?.message || 'Failed to insert to Supabase' };
  }
}
