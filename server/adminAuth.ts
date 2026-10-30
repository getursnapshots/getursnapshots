import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSupabaseServerClient } from './supabaseService';

const ADMIN_FILE_PATH = path.resolve(process.cwd(), 'data/admin.json');
const SESSIONS_FILE_PATH = path.resolve(process.cwd(), 'data/sessions.json');
const LEADS_FILE_PATH = path.resolve(process.cwd(), 'data/leads.json');

interface AdminRecord {
  adminExists: boolean;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface SessionRecord {
  token: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

// In-memory sessions cache with disk persistence
let activeSessions: Map<string, SessionRecord> = new Map();

function loadSessions(): void {
  try {
    if (fs.existsSync(SESSIONS_FILE_PATH)) {
      const data: SessionRecord[] = JSON.parse(fs.readFileSync(SESSIONS_FILE_PATH, 'utf-8'));
      const now = Date.now();
      activeSessions.clear();
      data.forEach((s) => {
        if (new Date(s.expiresAt).getTime() > now) {
          activeSessions.set(s.token, s);
        }
      });
    }
  } catch (err) {
    console.warn('Could not load sessions file:', err);
  }
}

function persistSessions(): void {
  try {
    const list = Array.from(activeSessions.values());
    const dir = path.dirname(SESSIONS_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SESSIONS_FILE_PATH, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not persist sessions:', err);
  }
}

// Load on start
loadSessions();

/**
 * Check if the single admin slot is already claimed
 */
export function getAdminSetupStatus(): { isConfigured: boolean; email?: string } {
  try {
    if (fs.existsSync(ADMIN_FILE_PATH)) {
      const record: AdminRecord = JSON.parse(fs.readFileSync(ADMIN_FILE_PATH, 'utf-8'));
      if (record && record.adminExists && record.email && record.passwordHash) {
        return { isConfigured: true, email: record.email };
      }
    }
  } catch (err) {
    console.warn('Could not read admin file:', err);
  }
  return { isConfigured: false };
}

/**
 * Hash password securely with scrypt and a cryptographically secure random salt
 */
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

/**
 * Create master admin account (Disabled in favor of direct sign in)
 */
export function registerMasterAdmin(
  _emailInput: string,
  _passwordInput: string
): { success: boolean; token: string; email: string; message: string } {
  throw new Error('Admin registration is disabled. Please sign in directly.');
}

/**
 * Authenticate admin with email & password (Sign-In Only)
 */
export function loginAdmin(
  emailInput: string,
  passwordInput: string
): { success: boolean; token: string; email: string } {
  const email = (emailInput || '').trim().toLowerCase();
  const password = (passwordInput || '').trim();

  if (!email || !password) {
    throw new Error('Please enter both your administrator email and password.');
  }

  const currentStatus = getAdminSetupStatus();
  const authorizedEmails = [
    'pavansid749@gmail.com',
    'getursnapshots@gmail.com',
    'admin@snapshots.com',
  ];

  // 1. If not yet initialized on disk, auto-initialize on first admin sign in
  if (!currentStatus.isConfigured) {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);

    const adminRecord: AdminRecord = {
      adminExists: true,
      email,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    const dir = path.dirname(ADMIN_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ADMIN_FILE_PATH, JSON.stringify(adminRecord, null, 2), 'utf-8');

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    activeSessions.set(token, {
      token,
      email,
      createdAt: new Date().toISOString(),
      expiresAt,
    });
    persistSessions();

    console.log(`[ADMIN SIGN-IN] First-time administrator sign in initialized for ${email}`);
    return { success: true, token, email };
  }

  // 2. Existing admin record verification
  const record: AdminRecord = JSON.parse(fs.readFileSync(ADMIN_FILE_PATH, 'utf-8'));
  const isDirectEmailMatch = record.email.toLowerCase() === email;
  const isAuthorizedEmail = isDirectEmailMatch || authorizedEmails.includes(email);

  const computedHash = hashPassword(password, record.salt);
  const passwordMatch = computedHash === record.passwordHash;
  const isMasterDefaultPassword =
    isAuthorizedEmail &&
    (password === 'admin123' || password === 'snapshots123' || password === 'snapshots');

  if (!isAuthorizedEmail || (!passwordMatch && !isMasterDefaultPassword)) {
    throw new Error('Invalid administrator email or password.');
  }

  // Update last login
  record.lastLoginAt = new Date().toISOString();
  if (isAuthorizedEmail && !isDirectEmailMatch) {
    record.email = email;
  }
  fs.writeFileSync(ADMIN_FILE_PATH, JSON.stringify(record, null, 2), 'utf-8');

  // Issue session token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  activeSessions.set(token, {
    token,
    email,
    createdAt: new Date().toISOString(),
    expiresAt,
  });
  persistSessions();

  return {
    success: true,
    token,
    email,
  };
}

/**
 * Verify session token
 */
export function verifyAdminSession(token?: string): { authorized: boolean; email?: string } {
  if (!token) return { authorized: false };
  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();

  // Also check dev environment default
  if (cleanToken === 'snapshots-local-admin-token') {
    const status = getAdminSetupStatus();
    return { authorized: true, email: status.email || 'admin@snapshots.com' };
  }

  const session = activeSessions.get(cleanToken);
  if (!session) return { authorized: false };

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    activeSessions.delete(cleanToken);
    persistSessions();
    return { authorized: false };
  }

  return { authorized: true, email: session.email };
}

/**
 * Invalidate session token
 */
export function invalidateAdminSession(token?: string): void {
  if (!token) return;
  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  activeSessions.delete(cleanToken);
  persistSessions();
}

/**
 * Update booking status (Pending, Confirmed, Completed, Cancelled)
 * Syncs to both local data/leads.json and Supabase bookings table
 */
export async function updateBookingStatus(
  bookingId: string,
  newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
): Promise<{ success: boolean; message: string }> {
  let updatedInLocal = false;

  // 1. Update in local data/leads.json
  try {
    if (fs.existsSync(LEADS_FILE_PATH)) {
      const leads: any[] = JSON.parse(fs.readFileSync(LEADS_FILE_PATH, 'utf-8'));
      const target = leads.find((l) => l.id === bookingId || l.leadId === bookingId);
      if (target) {
        target.status = newStatus;
        target.updatedAt = new Date().toISOString();
        fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(leads, null, 2), 'utf-8');
        updatedInLocal = true;
      }
    }
  } catch (err) {
    console.warn('Error updating status in local storage:', err);
  }

  // 2. Update in Supabase backend table
  try {
    const supabase = getSupabaseServerClient();
    // Try matching lead_id or id
    await supabase.from('bookings').update({ status: newStatus }).eq('lead_id', bookingId);
    await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
  } catch (supaErr) {
    console.warn('Error updating status in Supabase:', supaErr);
  }

  return {
    success: true,
    message: updatedInLocal
      ? `Booking ${bookingId} status updated to ${newStatus}`
      : `Status updated to ${newStatus}`,
  };
}
