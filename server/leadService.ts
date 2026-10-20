import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { getFirebaseAdmin } from './firebaseAdmin';

const LEADS_FILE_PATH = path.resolve(process.cwd(), 'data/leads.json');

/**
 * Sanitize input string (strips script/HTML tags and clamps length)
 */
function sanitize(val: unknown, maxLen = 300): string {
  if (typeof val !== 'string') return '';
  return val.replace(/<[^>]*>?/gm, '').trim().slice(0, maxLen);
}

export interface LeadSubmissionPayload {
  leadId?: string;
  name?: string;
  phone?: string;
  email?: string;
  service?: string;
  packageName?: string;
  price?: string;
  date?: string;
  time?: string;
  duration?: string;
  location?: string;
  country?: string;
  couponCode?: string;
  discountApplied?: string;
  requirements?: string;
  message?: string;
  source?: string;
  website_url?: string;
  hp_field?: string;
}

/**
 * Process a new booking lead:
 * 1. Filters automated spam via invisible honeypot.
 * 2. Sanitizes input fields.
 * 3. Prevents duplicate submissions (checks recent duplicates within 3 minutes).
 * 4. Saves lead to Firebase Firestore ('bookings' collection).
 * 5. Backs up to local data/leads.json if writable.
 * 6. Dispatches real email via Nodemailer SMTP to getursnapshots@gmail.com.
 */
export async function processLeadSubmission(payload: LeadSubmissionPayload) {
  const {
    leadId: clientLeadId,
    name,
    phone,
    email,
    service,
    packageName,
    price,
    date,
    time,
    duration,
    location,
    country,
    couponCode,
    discountApplied,
    requirements,
    message,
    source = 'Booking Form',
    website_url,
    hp_field,
  } = payload;

  // 1. Bot protection: reject silent spam if honeypot was populated
  if (website_url || hp_field) {
    console.warn('[BOT BLOCKED] Dropped automated spam submission with honeypot triggered.');
    return {
      statusCode: 200,
      body: {
        success: true,
        leadId: 'SPAM_FILTERED',
        recipient: 'getursnapshots@gmail.com',
        message: 'Received',
      },
    };
  }

  // 2. Input sanitization
  const cleanName = sanitize(name, 120);
  const cleanPhone = sanitize(phone, 35);
  const cleanEmail = sanitize(email, 120);
  const cleanService = sanitize(service, 100) || 'General Shoot';
  const cleanPackageName = sanitize(packageName, 100) || 'Custom';
  const cleanPrice = sanitize(price, 40);
  const cleanDate = sanitize(date, 50) || 'Flexible';
  const cleanTime = sanitize(time, 50) || 'Flexible';
  const cleanDuration = sanitize(duration, 50) || 'Standard';
  const cleanLocation = sanitize(location, 150) || 'Pending confirmation';
  const cleanCountry = sanitize(country, 60) || 'India';
  const cleanCouponCode = sanitize(couponCode, 30);
  const cleanDiscount = sanitize(discountApplied, 30);
  const cleanRequirements = sanitize(requirements || message, 2000);

  if (!cleanName || (!cleanPhone && !cleanEmail)) {
    return {
      statusCode: 400,
      body: { error: 'Name and either phone or email are required' },
    };
  }

  const targetEmail = process.env.LEADS_EMAIL || 'getursnapshots@gmail.com';
  const timestamp = new Date().toISOString();
  const leadId =
    clientLeadId && clientLeadId.startsWith('LEAD-')
      ? clientLeadId
      : `LEAD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const leadRecord = {
    id: leadId,
    source,
    name: cleanName,
    clientName: cleanName,
    phone: cleanPhone,
    email: cleanEmail,
    service: cleanService,
    package: cleanPackageName,
    packageName: cleanPackageName,
    price: cleanPrice,
    date: cleanDate,
    eventDate: cleanDate,
    time: cleanTime,
    duration: cleanDuration,
    location: cleanLocation,
    city: cleanLocation,
    country: cleanCountry,
    couponCode: cleanCouponCode,
    discountApplied: cleanDiscount,
    requirements: cleanRequirements,
    status: 'pending',
    createdAt: timestamp,
    submittedAt: timestamp,
    deliveredTo: targetEmail,
  };

  // 3. Save to Firebase Firestore via Admin SDK (with Deduplication check)
  let firestoreSaved = false;
  try {
    const { db } = getFirebaseAdmin();
    const bookingsCol = db.collection('bookings');

    // 3a. Exact leadId check
    const existingDocRef = bookingsCol.doc(leadId);
    const existingDoc = await existingDocRef.get();
    if (existingDoc.exists) {
      console.log(`[DEDUPLICATION] Lead #${leadId} was already saved. Skipping duplicate write.`);
      return {
        statusCode: 200,
        body: {
          success: true,
          leadId,
          recipient: targetEmail,
          emailSent: false,
          message: 'Booking request already received. We will contact you shortly.',
          timestamp: existingDoc.data()?.submittedAt || timestamp,
        },
      };
    }

    // 3b. Recent duplicate check (matching phone + service in last 3 minutes, using single-field query to avoid composite index errors)
    if (cleanPhone) {
      const threeMinutesAgoMs = Date.now() - 3 * 60 * 1000;
      try {
        const recentSnapshot = await bookingsCol
          .where('phone', '==', cleanPhone)
          .limit(5)
          .get();

        const duplicateDoc = recentSnapshot.docs.find((doc) => {
          const d = doc.data();
          const docTime = new Date(d.submittedAt || d.createdAt || 0).getTime();
          return d.service === cleanService && docTime >= threeMinutesAgoMs;
        });

        if (duplicateDoc) {
          console.log(`[DEDUPLICATION] Suppressed duplicate booking from ${cleanPhone} for ${cleanService}`);
          return {
            statusCode: 200,
            body: {
              success: true,
              leadId: duplicateDoc.id,
              recipient: targetEmail,
              emailSent: false,
              message: 'Booking request already received. Our coordinator will contact you shortly.',
              timestamp: duplicateDoc.data()?.submittedAt || timestamp,
            },
          };
        }
      } catch (queryErr) {
        console.warn('Recent duplicate check bypassed:', queryErr);
      }
    }

    // Save new lead document to Firestore
    await existingDocRef.set(leadRecord);
    firestoreSaved = true;
    console.log(`[FIRESTORE SUCCESS] Lead #${leadId} saved to Firestore 'bookings' collection.`);
  } catch (firestoreErr) {
    console.error('Firestore Admin save error:', firestoreErr);
  }

  // 4. Legacy local disk backup (ensures zero data loss in hybrid/dev environments)
  try {
    const dir = path.dirname(LEADS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    let existingLeads: any[] = [];
    if (fs.existsSync(LEADS_FILE_PATH)) {
      try {
        existingLeads = JSON.parse(fs.readFileSync(LEADS_FILE_PATH, 'utf-8'));
      } catch {
        existingLeads = [];
      }
    }
    existingLeads.unshift(leadRecord);
    fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(existingLeads.slice(0, 100), null, 2), 'utf-8');
  } catch (fsErr) {
    // Non-fatal if filesystem is read-only (e.g. Vercel serverless)
  }

  // 5. Send automated email via Nodemailer SMTP (failure does not delete Firestore record)
  let emailSent = false;
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT || 465);

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff; color: #18181b;">
          <div style="background-color: #bd1616; padding: 18px 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px;">SNAP SHOTS &mdash; NEW BOOKING LEAD</h1>
            <p style="color: #fecaca; margin: 4px 0 0 0; font-size: 13px;">Lead ID: ${leadId}</p>
          </div>

          <div style="padding: 24px 8px;">
            <h2 style="font-size: 17px; margin-top: 0; color: #18181b; border-bottom: 2px solid #bd1616; padding-bottom: 8px;">Client Information</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 140px; color: #71717a;">Client Name:</td><td style="padding: 8px 0; font-size: 15px; font-weight: 600; color: #18181b;">${cleanName}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Phone Number:</td><td style="padding: 8px 0; font-size: 15px; font-weight: 600;"><a href="tel:${cleanPhone}" style="color: #bd1616; text-decoration: none;">${cleanPhone || 'Not provided'}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Email Address:</td><td style="padding: 8px 0; font-size: 15px;"><a href="mailto:${cleanEmail}" style="color: #bd1616; text-decoration: none;">${cleanEmail || 'Not provided'}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Country:</td><td style="padding: 8px 0; font-size: 15px;">${cleanCountry}</td></tr>
            </table>

            <h2 style="font-size: 17px; margin-top: 0; color: #18181b; border-bottom: 2px solid #bd1616; padding-bottom: 8px;">Shoot Requirements</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 140px; color: #71717a;">Service:</td><td style="padding: 8px 0; font-size: 15px; font-weight: 600; color: #bd1616;">${cleanService}</td></tr>
              ${cleanPackageName ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Package:</td><td style="padding: 8px 0; font-size: 15px;">${cleanPackageName}</td></tr>` : ''}
              ${cleanPrice ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Selected Price:</td><td style="padding: 8px 0; font-size: 15px; font-weight: 600;">${cleanPrice}</td></tr>` : ''}
              <tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Preferred Date:</td><td style="padding: 8px 0; font-size: 15px; font-weight: 600;">${cleanDate}</td></tr>
              ${cleanTime ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Preferred Time:</td><td style="padding: 8px 0; font-size: 15px;">${cleanTime}</td></tr>` : ''}
              ${cleanDuration ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Duration:</td><td style="padding: 8px 0; font-size: 15px;">${cleanDuration}</td></tr>` : ''}
              ${cleanLocation ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Shoot Location:</td><td style="padding: 8px 0; font-size: 15px;">${cleanLocation}</td></tr>` : ''}
              ${cleanCouponCode ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Coupon Applied:</td><td style="padding: 8px 0; font-size: 15px; color: #15803d; font-weight: bold;">${cleanCouponCode} (${cleanDiscount || 'Applied'})</td></tr>` : ''}
            </table>

            ${cleanRequirements ? `
              <h2 style="font-size: 17px; margin-top: 0; color: #18181b; border-bottom: 2px solid #bd1616; padding-bottom: 8px;">Client Notes / Instructions</h2>
              <div style="background-color: #f4f4f5; padding: 14px 18px; border-radius: 8px; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                ${cleanRequirements}
              </div>
            ` : ''}

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e4e4e7;">
              <a href="https://wa.me/${cleanPhone.replace(/[^0-9]/g, '')}" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px; margin-right: 10px;">
                Reply via WhatsApp
              </a>
              <a href="mailto:${cleanEmail || targetEmail}" style="display: inline-block; background-color: #bd1616; color: #ffffff; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px;">
                Reply via Email
              </a>
            </div>
          </div>

          <div style="background-color: #f4f4f5; padding: 14px; text-align: center; font-size: 12px; color: #71717a; border-radius: 0 0 8px 8px;">
            Captured live by Snap Shots Visual Media Studio booking engine.<br/>
            Destination Inbox: <strong>${targetEmail}</strong> &bull; Received at ${new Date(timestamp).toLocaleString()}
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Snap Shots Booking Engine" <${smtpUser}>`,
        to: targetEmail,
        replyTo: cleanEmail || undefined,
        subject: `🎬 New Shoot Lead: ${cleanName} (${cleanService})`,
        html: mailHtml,
        text: `New Shoot Booking Lead:\nName: ${cleanName}\nPhone: ${cleanPhone}\nEmail: ${cleanEmail}\nService: ${cleanService}\nPackage: ${cleanPackageName}\nDate: ${cleanDate}\nTime: ${cleanTime}\nLocation: ${cleanLocation}\nNotes: ${cleanRequirements}\nDelivered to: ${targetEmail}`,
      });

      emailSent = true;
      console.log(`[SMTP SUCCESS] Automated email dispatched to ${targetEmail} for lead #${leadId}`);
    } catch (smtpErr) {
      console.warn('[SMTP NOTICE] Could not send via SMTP. Lead is safely stored in Firestore.');
    }
  }

  return {
    statusCode: 200,
    body: {
      success: true,
      leadId,
      recipient: targetEmail,
      emailSent,
      firestoreSaved,
      emailNotice: emailSent
        ? 'Email dispatched to getursnapshots@gmail.com'
        : 'Lead securely recorded in Firestore for getursnapshots@gmail.com',
      timestamp,
    },
  };
}

/**
 * Verifies the Firebase Authentication ID Token passed in Authorization header
 * and ensures the user's email is present on the admin allowlist.
 */
export async function authenticateAdminRequest(authHeader?: string): Promise<{
  authorized: boolean;
  statusCode?: number;
  email?: string;
  error?: string;
}> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      statusCode: 401,
      error: 'Unauthorized: Missing or malformed Authorization header. Expected Bearer <token>',
    };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return {
      authorized: false,
      statusCode: 401,
      error: 'Unauthorized: Empty bearer token provided',
    };
  }

  try {
    const { auth } = getFirebaseAdmin();
    const decodedToken = await auth.verifyIdToken(token);
    const userEmail = (decodedToken.email || '').toLowerCase().trim();

    if (!userEmail) {
      return {
        authorized: false,
        statusCode: 403,
        error: 'Forbidden: Authenticated account has no associated email address',
      };
    }

    // Server-side admin email allowlist:
    // Defined in environment variable ADMIN_EMAIL (comma-separated list, e.g. "admin@snapshots.com,owner@example.com")
    const configuredAllowlist = process.env.ADMIN_EMAIL || process.env.ADMIN_EMAILS || '';
    const allowlist = new Set<string>([
      'getursnapshots@gmail.com',
      'pavansid749@gmail.com',
    ]);
    if (configuredAllowlist) {
      configuredAllowlist
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
        .forEach((e) => allowlist.add(e));
    }

    const isAuthorized = allowlist.has(userEmail);
    if (!isAuthorized) {
      return {
        authorized: false,
        statusCode: 403,
        error: `Forbidden: Account (${userEmail}) is not authorized to access administrative leads.`,
      };
    }

    return {
      authorized: true,
      email: userEmail,
    };
  } catch (tokenErr: any) {
    console.warn('ID Token verification failed:', tokenErr.message);
    return {
      authorized: false,
      statusCode: 401,
      error: 'Unauthorized: Invalid or expired Firebase ID token. Please log in again.',
    };
  }
}

/**
 * Retrieves leads from Firestore 'bookings' collection, newest first.
 * Merges any legacy records from data/leads.json without duplicates.
 */
export async function fetchAdminLeads(authHeader?: string) {
  const authCheck = await authenticateAdminRequest(authHeader);
  if (!authCheck.authorized) {
    return {
      statusCode: authCheck.statusCode || 401,
      body: { error: authCheck.error || 'Unauthorized' },
    };
  }

  const leadsMap = new Map<string, any>();

  // 1. Fetch from Firestore 'bookings' collection
  try {
    const { db } = getFirebaseAdmin();
    const snapshot = await db.collection('bookings').get();
    snapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      leadsMap.set(id, {
        id,
        ...data,
      });
    });
  } catch (firestoreErr) {
    console.error('Error fetching leads from Firestore:', firestoreErr);
  }

  // 2. Merge legacy records from data/leads.json if present
  try {
    if (fs.existsSync(LEADS_FILE_PATH)) {
      const legacyData = JSON.parse(fs.readFileSync(LEADS_FILE_PATH, 'utf-8'));
      if (Array.isArray(legacyData)) {
        for (const item of legacyData) {
          const id = item.id || `LEGACY-${item.phone || item.email}-${item.submittedAt}`;
          if (!leadsMap.has(id)) {
            leadsMap.set(id, item);
          }
        }
      }
    }
  } catch (legacyErr) {
    // Non-critical
  }

  // Convert to array and sort newest first by submittedAt / createdAt
  const allLeads = Array.from(leadsMap.values()).sort((a, b) => {
    const dateA = new Date(a.submittedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.submittedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  return {
    statusCode: 200,
    body: {
      success: true,
      count: allLeads.length,
      leads: allLeads,
    },
  };
}
