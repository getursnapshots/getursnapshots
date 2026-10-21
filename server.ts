import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import nodemailer from 'nodemailer';
import compression from 'compression';
import { processLeadSubmission, fetchAdminLeads } from './server/leadService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Gzip / Deflate response compression for ultra-fast text/json/asset transfer
  app.use(compression());

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
          const numK = Number(k);
          if (numK >= 0 && numK < 5 && v && v.videoUrl && !v.videoUrl.startsWith('blob:')) {
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

  // API endpoint 6: Send & record booking lead to Firestore with deduplication, anti-bot defense & SMTP
  app.post('/api/send-lead', leadSubmissionLimiter, async (req, res) => {
    try {
      const result = await processLeadSubmission(req.body);
      return res.status(result.statusCode).json(result.body);
    } catch (err: any) {
      console.error('Error handling lead submission:', err);
      return res.status(500).json({ error: err.message || 'Failed to submit lead' });
    }
  });

  // API endpoint 7: Retrieve all leads from Firestore (protected: Firebase Auth ID token & admin allowlist)
  app.get('/api/leads', async (req, res) => {
    try {
      const authHeader = req.headers.authorization || (req.headers.Authorization as string);
      const result = await fetchAdminLeads(authHeader);
      return res.status(result.statusCode).json(result.body);
    } catch (err: any) {
      console.error('Error retrieving leads:', err);
      return res.status(500).json({ error: err.message || 'Failed to retrieve leads' });
    }
  });

  // High-performance static asset caching
  app.use(
    '/videos',
    express.static(path.resolve(__dirname, 'public/videos'), {
      maxAge: '30d',
      etag: true,
      lastModified: true,
    })
  );

  // Dedicated SEO Routes for Search Engine Crawlers
  app.get('/sitemap.xml', (_req, res) => {
    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(path.resolve(__dirname, 'public/sitemap.xml'));
  });

  app.get('/robots.txt', (_req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(path.resolve(__dirname, 'public/robots.txt'));
  });

  app.use(
    express.static(path.resolve(__dirname, 'public'), {
      maxAge: '1d',
      etag: true,
      lastModified: true,
    })
  );

  if (process.env.NODE_ENV === 'production' || process.env.VITE_PROD === 'true') {
    app.use(
      '/assets',
      express.static(path.resolve(__dirname, 'dist/assets'), {
        maxAge: '1y',
        immutable: true,
        etag: true,
      })
    );
    app.use(
      express.static(path.resolve(__dirname, 'dist'), {
        maxAge: '1h',
        etag: true,
      })
    );
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
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

  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('Server error:', err);
  });
}

startServer();
