import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Increase payload limit to 100MB for video file uploads
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

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
  app.post('/api/upload-video', async (req, res) => {
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
  app.post('/api/save-all-slides', (req, res) => {
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
  app.post('/api/reset-slides', (req, res) => {
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
