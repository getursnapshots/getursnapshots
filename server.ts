import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // 1. Security Headers Middleware (Protection against XSS, clickjacking, sniffing)
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // Increase payload limit to 100MB for video file uploads
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // 2. IP Rate Limiter (Protection against DDoS, brute force & lead spam)
  const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
  const createRateLimiter = (maxRequests: number, windowMs: number, actionName: string) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        'unknown';
      const now = Date.now();
      const key = `${actionName}:${clientIp}`;

      const record = rateLimitStore.get(key);
      if (!record || now > record.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return next();
      }

      if (record.count >= maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        res.setHeader('Retry-After', String(retryAfter));
        console.warn(`[RATE LIMIT EXCEEDED] IP ${clientIp} blocked on ${actionName}. Retry after ${retryAfter}s`);
        return res.status(429).json({
          error: 'Too many requests. Please wait a moment before trying again.',
          retryAfterSeconds: retryAfter,
        });
      }

      record.count++;
      next();
    };
  };

  const leadSubmissionLimiter = createRateLimiter(20, 10 * 60 * 1000, 'lead-submission');
  const uploadLimiter = createRateLimiter(30, 10 * 60 * 1000, 'upload');
  const slideMutationLimiter = createRateLimiter(30, 5 * 60 * 1000, 'slide-mutation');

  // Ensure data directory exists for persistent leads
  const dataDir = path.resolve(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const leadsFilePath = path.resolve(dataDir, 'leads.json');
  if (!fs.existsSync(leadsFilePath)) {
    fs.writeFileSync(leadsFilePath, JSON.stringify([], null, 2), 'utf-8');
  }

  // Ensure public/videos directory exists
  const videosDir = path.resolve(__dirname, 'public/videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  // Ensure legacy upload directory exists in public/assets/uploads
  const uploadDir = path.resolve(__dirname, 'public/assets/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Ensure public/custom-slides.json exists
  const slidesConfigPath = path.resolve(__dirname, 'public/custom-slides.json');
  if (!fs.existsSync(slidesConfigPath)) {
    fs.writeFileSync(slidesConfigPath, JSON.stringify({}), 'utf-8');
  }

  // Helper to sync custom-slides.json to dist if dist exists
  const syncToDist = (data: any) => {
    try {
      const distDir = path.resolve(__dirname, 'dist');
      if (fs.existsSync(distDir)) {
        fs.writeFileSync(path.join(distDir, 'custom-slides.json'), JSON.stringify(data, null, 2), 'utf-8');
      }
    } catch (e) {
      console.warn('Could not sync custom-slides.json to dist:', e);
    }
  };

  // Configure Multer for streaming file uploads directly to public/videos
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, videosDir);
    },
    filename: (req, file, cb) => {
      const slideIndex = req.body?.slideIndex ?? '0';
      const reelNum = Number(slideIndex) + 1;
      const ext = path.extname(file.originalname) || '.mp4';
      const cleanExt = ext.startsWith('.') ? ext : `.${ext}`;
      cb(null, `reel-${reelNum}${cleanExt}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB limit
  });

  // API endpoint 1: Upload via multipart/form-data (high performance, stream direct to disk)
  app.post(
    '/api/upload-video-file',
    uploadLimiter,
    upload.fields([
      { name: 'video', maxCount: 1 },
      { name: 'poster', maxCount: 1 },
    ]),
    async (req, res) => {
      try {
        const slideIndex = req.body?.slideIndex !== undefined ? String(req.body.slideIndex) : '0';
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const videoFile = files?.['video']?.[0];
        const posterFile = files?.['poster']?.[0];

        if (!videoFile) {
          return res.status(400).json({ error: 'No video file provided in form data' });
        }

        const permanentVideoUrl = `/videos/${videoFile.filename}`;
        let permanentPosterUrl = '';

        if (posterFile) {
          permanentPosterUrl = `/videos/${posterFile.filename}`;
        } else if (req.body?.posterDataUrl && req.body.posterDataUrl.startsWith('data:image/')) {
          // If poster passed as data URL
          try {
            const cleanPoster = req.body.posterDataUrl.replace(/^data:image\/\w+;base64,/, '');
            const posterBuffer = Buffer.from(cleanPoster, 'base64');
            const posterFilename = `poster-slide-${slideIndex}-${Date.now()}.jpg`;
            fs.writeFileSync(path.join(videosDir, posterFilename), posterBuffer);
            permanentPosterUrl = `/videos/${posterFilename}`;
          } catch (e) {
            console.warn('Could not save poster data URL:', e);
          }
        }

        // Also sync uploaded video and poster to dist/videos if dist exists
        const distVideosDir = path.resolve(__dirname, 'dist/videos');
        if (!fs.existsSync(distVideosDir)) {
          fs.mkdirSync(distVideosDir, { recursive: true });
        }
        try {
          fs.copyFileSync(videoFile.path, path.join(distVideosDir, videoFile.filename));
          if (posterFile) {
            fs.copyFileSync(posterFile.path, path.join(distVideosDir, posterFile.filename));
          } else if (permanentPosterUrl) {
            const posterBase = path.basename(permanentPosterUrl);
            const srcPosterPath = path.join(videosDir, posterBase);
            if (fs.existsSync(srcPosterPath)) {
              fs.copyFileSync(srcPosterPath, path.join(distVideosDir, posterBase));
            }
          }
        } catch {}

        // Update public/custom-slides.json
        let existing: Record<string, any> = {};
        if (fs.existsSync(slidesConfigPath)) {
          try {
            existing = JSON.parse(fs.readFileSync(slidesConfigPath, 'utf-8'));
          } catch {}
        }

        existing[slideIndex] = {
          videoUrl: permanentVideoUrl,
          posterUrl: permanentPosterUrl,
          updatedAt: new Date().toISOString(),
        };

        fs.writeFileSync(slidesConfigPath, JSON.stringify(existing, null, 2), 'utf-8');
        syncToDist(existing);

        console.log(`[Upload-File] Slide #${slideIndex} saved permanently to ${permanentVideoUrl}`);

        return res.json({
          success: true,
          slideIndex: Number(slideIndex),
          videoUrl: permanentVideoUrl,
          posterUrl: permanentPosterUrl,
        });
      } catch (err: any) {
        console.error('Error handling multipart video upload:', err);
        return res.status(500).json({ error: err.message || 'Failed to upload video' });
      }
    }
  );

  // API endpoint 2: Upload / replace video via Base64 or Direct URL (fallback)
  app.post('/api/upload-video', uploadLimiter, async (req, res) => {
    try {
      const { slideIndex, videoBase64, posterBase64, directUrl } = req.body;
      const targetIndex = slideIndex !== undefined ? String(slideIndex) : '0';

      let existing: Record<string, any> = {};
      if (fs.existsSync(slidesConfigPath)) {
        try {
          existing = JSON.parse(fs.readFileSync(slidesConfigPath, 'utf-8'));
        } catch {}
      }

      if (directUrl) {
        existing[targetIndex] = {
          videoUrl: directUrl,
          posterUrl: posterBase64 || '',
          updatedAt: new Date().toISOString(),
        };
        fs.writeFileSync(slidesConfigPath, JSON.stringify(existing, null, 2), 'utf-8');
        syncToDist(existing);
        return res.json({ success: true, videoUrl: directUrl });
      }

      if (!videoBase64) {
        return res.status(400).json({ error: 'No video data provided' });
      }

      // Convert Base64 data to binary buffer and write to /public/videos/
      const cleanBase64 = videoBase64
        .replace(/^data:video\/\w+;base64,/, '')
        .replace(/^data:application\/octet-stream;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const reelNum = Number(targetIndex) + 1;
      const filename = `reel-${reelNum}.mp4`;
      const filePath = path.join(videosDir, filename);

      fs.writeFileSync(filePath, buffer);

      let posterUrl = '';
      if (posterBase64 && posterBase64.startsWith('data:image/')) {
        const cleanPoster = posterBase64.replace(/^data:image\/\w+;base64,/, '');
        const posterBuffer = Buffer.from(cleanPoster, 'base64');
        const posterFilename = `poster-slide-${targetIndex}-${Date.now()}.jpg`;
        const posterFilePath = path.join(videosDir, posterFilename);
        fs.writeFileSync(posterFilePath, posterBuffer);
        posterUrl = `/videos/${posterFilename}`;
      }

      const permanentVideoUrl = `/videos/${filename}`;

      existing[targetIndex] = {
        videoUrl: permanentVideoUrl,
        posterUrl: posterUrl,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(slidesConfigPath, JSON.stringify(existing, null, 2), 'utf-8');
      syncToDist(existing);

      console.log(`[Upload-Base64] Slide #${targetIndex} saved to ${permanentVideoUrl} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);

      return res.json({
        success: true,
        videoUrl: permanentVideoUrl,
        posterUrl: posterUrl,
      });
    } catch (err: any) {
      console.error('Error saving uploaded video:', err);
      return res.status(500).json({ error: err.message || 'Failed to save video' });
    }
  });

  // API endpoint 3: Save all slide configurations (used by the Save Changes button)
  app.post('/api/save-all-slides', slideMutationLimiter, (req, res) => {
    try {
      const { slides } = req.body;
      if (slides && typeof slides === 'object') {
        const cleanSlides: Record<string, any> = {};
        for (const [k, v] of Object.entries(slides as Record<string, any>)) {
          if (v && v.videoUrl && !v.videoUrl.startsWith('blob:')) {
            cleanSlides[k] = v;
          }
        }
        fs.writeFileSync(slidesConfigPath, JSON.stringify(cleanSlides, null, 2), 'utf-8');
        syncToDist(cleanSlides);
        console.log(`[Save-All] Saved ${Object.keys(cleanSlides).length} clean slide configurations`);
        return res.json({ success: true, count: Object.keys(cleanSlides).length });
      }
      return res.status(400).json({ error: 'Invalid slides payload' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // API endpoint 4: Get all saved custom slides
  app.get('/api/custom-slides', (_req, res) => {
    try {
      if (fs.existsSync(slidesConfigPath)) {
        const data = JSON.parse(fs.readFileSync(slidesConfigPath, 'utf-8'));
        return res.json(data);
      }
      return res.json({});
    } catch {
      return res.json({});
    }
  });

  // API endpoint 5: Reset custom slides
  app.post('/api/reset-slides', slideMutationLimiter, (req, res) => {
    try {
      const { slideIndex, resetAll } = req.body;
      let data: Record<string, any> = {};
      if (fs.existsSync(slidesConfigPath)) {
        try {
          data = JSON.parse(fs.readFileSync(slidesConfigPath, 'utf-8'));
        } catch {}
      }

      if (resetAll || slideIndex === undefined) {
        data = {};
      } else {
        delete data[String(slideIndex)];
      }

      fs.writeFileSync(slidesConfigPath, JSON.stringify(data, null, 2), 'utf-8');
      syncToDist(data);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // API endpoint 6: Send & record booking lead directly to getursnapshots@gmail.com with anti-bot defense
  app.post('/api/send-lead', leadSubmissionLimiter, async (req, res) => {
    try {
      const {
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
        // Anti-bot honeypot fields
        website_url,
        hp_field,
      } = req.body;

      // Bot protection: if automated bot filled invisible honeypot, reject silently
      if (website_url || hp_field) {
        console.warn(`[BOT BLOCKED] Dropped automated spam submission with honeypot triggered.`);
        return res.json({
          success: true,
          leadId: 'SPAM_FILTERED',
          recipient: 'getursnapshots@gmail.com',
          message: 'Received',
        });
      }

      // Input sanitization (strip HTML / script tags and limit length)
      const sanitize = (val: any, maxLen = 300) => {
        if (typeof val !== 'string') return '';
        return val.replace(/<[^>]*>?/gm, '').trim().slice(0, maxLen);
      };

      const cleanName = sanitize(name, 120);
      const cleanPhone = sanitize(phone, 35);
      const cleanEmail = sanitize(email, 120);
      const cleanService = sanitize(service, 100);
      const cleanPackageName = sanitize(packageName, 100);
      const cleanPrice = sanitize(price, 40);
      const cleanDate = sanitize(date, 50);
      const cleanTime = sanitize(time, 50);
      const cleanDuration = sanitize(duration, 50);
      const cleanLocation = sanitize(location, 150);
      const cleanCountry = sanitize(country, 60);
      const cleanCouponCode = sanitize(couponCode, 30);
      const cleanDiscount = sanitize(discountApplied, 30);
      const cleanRequirements = sanitize(requirements || message, 2000);

      if (!cleanName || (!cleanPhone && !cleanEmail)) {
        return res.status(400).json({ error: 'Name and either phone or email are required' });
      }

      const targetEmail = process.env.LEADS_EMAIL || 'getursnapshots@gmail.com';
      const timestamp = new Date().toISOString();
      const leadId = `LEAD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const leadRecord = {
        id: leadId,
        source,
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        service: cleanService || 'General Shoot',
        packageName: cleanPackageName || 'Custom',
        price: cleanPrice,
        date: cleanDate || 'Flexible',
        time: cleanTime,
        duration: cleanDuration,
        location: cleanLocation,
        country: cleanCountry || 'India',
        couponCode: cleanCouponCode,
        discountApplied: cleanDiscount,
        requirements: cleanRequirements,
        submittedAt: timestamp,
        deliveredTo: targetEmail,
        status: 'new',
      };

      // 1. Save permanently to data/leads.json
      let existingLeads: any[] = [];
      try {
        if (fs.existsSync(leadsFilePath)) {
          existingLeads = JSON.parse(fs.readFileSync(leadsFilePath, 'utf-8'));
        }
      } catch (e) {
        existingLeads = [];
      }
      existingLeads.unshift(leadRecord);
      fs.writeFileSync(leadsFilePath, JSON.stringify(existingLeads, null, 2), 'utf-8');

      // Sync to dist/data if dist exists
      try {
        const distDataDir = path.resolve(__dirname, 'dist/data');
        if (fs.existsSync(distDataDir)) {
          fs.writeFileSync(path.join(distDataDir, 'leads.json'), JSON.stringify(existingLeads, null, 2), 'utf-8');
        }
      } catch {}

      console.log(`[LEAD RECEIVED] Lead #${leadId} from "${name}" (${phone || email}) for "${service}". Target: ${targetEmail}`);

      // 2. Dispatch real email via SMTP if credentials are configured in environment
      let emailSent = false;
      let emailError: string | null = null;

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
                  <tr><td style="padding: 8px 0; font-weight: bold; width: 140px; color: #71717a;">Client Name:</td><td style="padding: 8px 0; font-size: 15px; font-weight: 600; color: #18181b;">${name}</td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Phone Number:</td><td style="padding: 8px 0; font-size: 15px; font-weight: 600;"><a href="tel:${phone}" style="color: #bd1616; text-decoration: none;">${phone || 'Not provided'}</a></td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Email Address:</td><td style="padding: 8px 0; font-size: 15px;"><a href="mailto:${email}" style="color: #bd1616; text-decoration: none;">${email || 'Not provided'}</a></td></tr>
                  <tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Country:</td><td style="padding: 8px 0; font-size: 15px;">${country || 'India'}</td></tr>
                </table>

                <h2 style="font-size: 17px; margin-top: 0; color: #18181b; border-bottom: 2px solid #bd1616; padding-bottom: 8px;">Shoot Requirements</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr><td style="padding: 8px 0; font-weight: bold; width: 140px; color: #71717a;">Service:</td><td style="padding: 8px 0; font-size: 15px; font-weight: 600; color: #bd1616;">${service || 'Event Reels'}</td></tr>
                  ${packageName ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Package:</td><td style="padding: 8px 0; font-size: 15px;">${packageName}</td></tr>` : ''}
                  ${price ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Selected Price:</td><td style="padding: 8px 0; font-size: 15px; font-weight: 600;">${price}</td></tr>` : ''}
                  <tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Preferred Date:</td><td style="padding: 8px 0; font-size: 15px; font-weight: 600;">${date || 'Flexible'}</td></tr>
                  ${time ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Preferred Time:</td><td style="padding: 8px 0; font-size: 15px;">${time}</td></tr>` : ''}
                  ${duration ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Duration:</td><td style="padding: 8px 0; font-size: 15px;">${duration}</td></tr>` : ''}
                  ${location ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Shoot Location:</td><td style="padding: 8px 0; font-size: 15px;">${location}</td></tr>` : ''}
                  ${couponCode ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #71717a;">Coupon Applied:</td><td style="padding: 8px 0; font-size: 15px; color: #15803d; font-weight: bold;">${couponCode} (${discountApplied || 'Applied'})</td></tr>` : ''}
                </table>

                ${(requirements || message) ? `
                  <h2 style="font-size: 17px; margin-top: 0; color: #18181b; border-bottom: 2px solid #bd1616; padding-bottom: 8px;">Client Notes / Instructions</h2>
                  <div style="background-color: #f4f4f5; padding: 14px 18px; border-radius: 8px; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                    ${requirements || message}
                  </div>
                ` : ''}

                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e4e4e7;">
                  <a href="https://wa.me/${(phone || '').replace(/[^0-9]/g, '')}" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px; margin-right: 10px;">
                    Reply via WhatsApp
                  </a>
                  <a href="mailto:${email || targetEmail}" style="display: inline-block; background-color: #bd1616; color: #ffffff; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px;">
                    Reply via Email
                  </a>
                </div>
              </div>

              <div style="background-color: #f4f4f5; padding: 14px; text-align: center; font-size: 12px; color: #71717a; border-radius: 0 0 8px 8px;">
                This lead was captured live by Snap Shots Visual Media Studio booking engine.<br/>
                Destination Inbox: <strong>${targetEmail}</strong> &bull; Received at ${new Date(timestamp).toLocaleString()}
              </div>
            </div>
          `;

          await transporter.sendMail({
            from: `"Snap Shots Booking Engine" <${smtpUser}>`,
            to: targetEmail,
            replyTo: email || undefined,
            subject: `🎬 New Shoot Lead: ${name} (${service || 'Event Reels'})`,
            html: mailHtml,
            text: `New Shoot Booking Lead:\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nService: ${service}\nPackage: ${packageName || 'Custom'}\nDate: ${date}\nTime: ${time}\nLocation: ${location}\nNotes: ${requirements || message}\nDelivered to: ${targetEmail}`,
          });

          emailSent = true;
          console.log(`[SMTP SUCCESS] Automated email dispatched to ${targetEmail} for lead #${leadId}`);
        } catch (err: any) {
          emailError = err.message || 'SMTP error';
          console.warn(`[SMTP NOTICE] Could not send via SMTP (${emailError}). Lead is safely persisted in data/leads.json.`);
        }
      } else {
        console.log(`[LEAD READY] Lead saved to data/leads.json! Set SMTP_USER & SMTP_PASS in environment variables to enable live automated SMTP dispatch to ${targetEmail}.`);
      }

      return res.json({
        success: true,
        leadId,
        recipient: targetEmail,
        emailSent,
        emailNotice: emailSent
          ? 'Email dispatched to getursnapshots@gmail.com'
          : 'Lead saved and queued for getursnapshots@gmail.com',
        timestamp,
      });
    } catch (err: any) {
      console.error('Error handling lead submission:', err);
      return res.status(500).json({ error: err.message || 'Failed to submit lead' });
    }
  });

  // API endpoint 7: Retrieve all leads (protected: admin passcode or local development)
  app.get('/api/leads', (req, res) => {
    try {
      const passcode = req.headers['x-admin-passcode'] || req.query.passcode;
      const isLocalOrDev = process.env.NODE_ENV !== 'production' || req.headers['host']?.includes('localhost');
      if (!isLocalOrDev && passcode !== 'snapshots2026') {
        return res.status(403).json({ error: 'Unauthorized: Admin passcode required' });
      }

      if (fs.existsSync(leadsFilePath)) {
        const data = JSON.parse(fs.readFileSync(leadsFilePath, 'utf-8'));
        return res.json({ success: true, count: data.length, leads: data });
      }
      return res.json({ success: true, count: 0, leads: [] });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Serve static files from public
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (process.env.NODE_ENV === 'production' || process.env.VITE_PROD === 'true') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    // Mount Vite middlewares in development
    const vite = await createViteServer({
      server: { middlewareMode: true, port: Number(PORT), host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
