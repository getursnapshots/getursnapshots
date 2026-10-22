import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Volume2, VolumeX, RotateCcw, Film, CheckCircle2, Loader2, X, Play } from 'lucide-react';
import logoPng from '../assets/logo.png';
import { useLogo } from '../context/LogoContext';

interface SitePreloaderProps {
  onComplete?: () => void;
}

const STORAGE_PRELOAD_KEY = 'snapshots_preload_video';

export const SitePreloader: React.FC<SitePreloaderProps> = ({ onComplete }) => {
  const { customLogoUrl } = useLogo();
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isRendered, setIsRendered] = useState(true);

  // Preloader video state
  const [preloadVideoUrl, setPreloadVideoUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_PRELOAD_KEY) || null;
    } catch {
      return null;
    }
  });

  const [isMuted, setIsMuted] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [videoDuration, setVideoDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check server for saved preload video on initial mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/preload-video')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.hasVideo && data?.videoUrl) {
          setPreloadVideoUrl(data.videoUrl);
          try {
            localStorage.setItem(STORAGE_PRELOAD_KEY, data.videoUrl);
          } catch {}
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Lock body scroll while preloader is active
  useEffect(() => {
    if (!isDone) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
      if (onComplete) onComplete();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isDone, onComplete]);

  // Default timed progress when no video is playing
  useEffect(() => {
    if (preloadVideoUrl) return; // Video controls its own progress

    const startTime = Date.now();
    const duration = 1600; // 1.6s smooth intro

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setIsDone(true);
          setTimeout(() => setIsRendered(false), 600);
        }, 300);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [preloadVideoUrl]);

  // Handle video playback time updates
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const pct = Math.min(100, Math.round((v.currentTime / v.duration) * 100));
    setProgress(pct);
  };

  // Video loaded metadata
  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (v) {
      setVideoDuration(v.duration);
      v.play().catch(() => {
        // Fall back to muted autoplay if needed
        v.muted = true;
        setIsMuted(true);
        v.play().catch(() => {});
      });
    }
  };

  // Video completed playback -> automatically reveal site
  const handleVideoEnded = () => {
    setProgress(100);
    setTimeout(() => {
      setIsDone(true);
      setTimeout(() => setIsRendered(false), 550);
    }, 200);
  };

  const handleSkip = () => {
    setProgress(100);
    setIsDone(true);
    setTimeout(() => {
      setIsRendered(false);
    }, 400);
  };

  // Handle direct file upload from user
  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file (.mp4, .mov, .webm)');
      return;
    }

    // 1. Instant preview via Blob URL
    const localBlob = URL.createObjectURL(file);
    setPreloadVideoUrl(localBlob);
    try {
      localStorage.setItem(STORAGE_PRELOAD_KEY, localBlob);
    } catch {}

    // Reset progress
    setProgress(0);
    setIsUploading(true);

    // 2. Stream to server disk permanently
    try {
      const formData = new FormData();
      formData.append('video', file);

      const res = await fetch('/api/upload-preload-video', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data?.success && data?.videoUrl) {
        setPreloadVideoUrl(data.videoUrl);
        try {
          localStorage.setItem(STORAGE_PRELOAD_KEY, data.videoUrl);
        } catch {}
        setUploadSuccessMessage('Preload video saved successfully!');
        setTimeout(() => setUploadSuccessMessage(null), 3500);
      }
    } catch (err) {
      console.warn('Could not stream to server, local preview active:', err);
    } finally {
      setIsUploading(false);
      setIsUploadModalOpen(false);
    }
  };

  // Save via direct URL
  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const cleanUrl = urlInput.trim();
    setPreloadVideoUrl(cleanUrl);
    try {
      localStorage.setItem(STORAGE_PRELOAD_KEY, cleanUrl);
    } catch {}

    setProgress(0);
    setIsUploading(true);

    try {
      await fetch('/api/upload-preload-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directUrl: cleanUrl }),
      });
      setUploadSuccessMessage('Preload video URL saved!');
      setTimeout(() => setUploadSuccessMessage(null), 3500);
    } catch {
      // Local preview remains
    } finally {
      setIsUploading(false);
      setIsUploadModalOpen(false);
      setUrlInput('');
    }
  };

  // Reset to default animated logo
  const handleResetPreload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.removeItem(STORAGE_PRELOAD_KEY);
      await fetch('/api/reset-preload-video', { method: 'POST' });
    } catch {}
    setPreloadVideoUrl(null);
    setProgress(0);
  };

  if (!isRendered) return null;

  const currentLogo = customLogoUrl || logoPng || '/assets/logo.png';

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="site-preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: 'blur(6px)',
            transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[99999] bg-[#000000] flex flex-col items-center justify-center select-none overflow-hidden"
          role="status"
          aria-label="Snap Shots Loading Screen"
        >
          {/* Ambient Cinematic Red Core Glow */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
            <motion.div
              initial={{ scale: 0.8, opacity: 0.3 }}
              animate={{
                scale: [0.85, 1.25, 0.95],
                opacity: [0.35, 0.75, 0.4],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-[420px] sm:w-[620px] md:w-[780px] h-[420px] sm:h-[620px] md:h-[780px] rounded-full bg-[radial-gradient(circle,rgba(189,22,22,0.32)_0%,rgba(117,13,13,0.14)_45%,transparent_70%)] blur-3xl"
            />
          </div>

          {/* Vignette Grid Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Hidden File Input for video upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/*"
            onChange={handleFilePicked}
            className="hidden"
          />

          {/* Top Floating Action Toolbar (Upload / Reset / Sound / Enter) */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex items-center gap-2">
            {/* Upload Video in Preload Button (Brand Red #bd1616) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsUploadModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#bd1616]/35 border border-[#9e1212] transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Upload your own custom video to play in this preload screen"
              id="preload-upload-btn"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{preloadVideoUrl ? 'Change Video' : 'Upload Video'}</span>
            </button>

            {/* If custom video is active, allow sound toggle and reset */}
            {preloadVideoUrl && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="p-2 sm:p-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-all cursor-pointer shadow-md"
                  title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#ffc800]" />}
                </button>

                <button
                  type="button"
                  onClick={handleResetPreload}
                  className="p-2 sm:p-2.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-all cursor-pointer shadow-md"
                  title="Reset to default logo animation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Quick Enter Site / Skip Button */}
            <button
              type="button"
              onClick={handleSkip}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-black/80 hover:bg-zinc-900 text-zinc-300 hover:text-white text-[11px] sm:text-xs font-semibold border border-zinc-800 transition-all cursor-pointer"
            >
              Enter Site &rarr;
            </button>
          </div>

          {/* MAIN CONTENT: EITHER CUSTOM PRELOAD VIDEO OR LOGO ANIMATION */}
          {preloadVideoUrl ? (
            /* ========================================================================= */
            /* CASE 1: USER'S UPLOADED PRELOAD VIDEO PLAYING                             */
            /* ========================================================================= */
            <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full max-w-xl">
              {/* Video Player Container */}
              <div
                onClick={handleSkip}
                className="relative w-full max-w-sm sm:max-w-md aspect-[9/16] max-h-[72vh] rounded-[28px] sm:rounded-[36px] overflow-hidden bg-black shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(189,22,22,0.45)] border-2 border-zinc-800 hover:border-[#bd1616]/60 transition-all cursor-pointer group"
              >
                <video
                  ref={videoRef}
                  src={preloadVideoUrl}
                  playsInline
                  autoPlay
                  muted={isMuted}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleVideoEnded}
                  onError={() => {
                    // Fall back to logo animation if file fails
                    setPreloadVideoUrl(null);
                  }}
                  className="w-full h-full object-cover"
                />

                {/* Subtle Brand Watermark Logo on Top Left */}
                <div className="absolute top-3.5 left-4 z-20 pointer-events-none opacity-80">
                  <img
                    src={currentLogo}
                    alt="Snap Shots"
                    className="h-6 w-auto object-contain drop-shadow-md"
                  />
                </div>

                {/* Ambient vignette and click prompt */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Tap to enter hint */}
                <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-white/80 uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full border border-white/10 backdrop-blur-xs">
                    Tap to enter site &bull; {progress}%
                  </span>
                </div>
              </div>

              {/* Progress Bar & Counter */}
              <div className="w-full max-w-sm sm:max-w-md mt-4">
                <div className="relative h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#750d0d] via-[#bd1616] to-[#ffc800] rounded-full shadow-[0_0_12px_#bd1616]"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: 'easeOut', duration: 0.1 }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span className="uppercase tracking-wider text-zinc-400">Custom Preload Video</span>
                  <span className="text-white font-bold">{progress}%</span>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* CASE 2: ANIMATED SNAP SHOTS LOGO SHUTTER INTRO                            */
            /* ========================================================================= */
            <div
              onClick={handleSkip}
              className="relative z-10 flex flex-col items-center justify-center px-4 max-w-sm sm:max-w-md w-full cursor-pointer"
            >
              {/* Camera Aperture / Shutter Blade Animated Ring */}
              <div className="relative flex items-center justify-center mb-6 sm:mb-8">
                {/* Outer Pulsing Glow Ring */}
                <motion.div
                  initial={{ rotate: 0, scale: 0.9 }}
                  animate={{ rotate: 360, scale: 1 }}
                  transition={{
                    rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 1.6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
                  }}
                  className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-dashed border-[#bd1616]/40 pointer-events-none"
                />

                {/* High-Tech Shutter Ring (Brand Red Accent) */}
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                  className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border-t-2 border-r border-[#bd1616] border-b-transparent border-l-transparent pointer-events-none shadow-[0_0_20px_rgba(189,22,22,0.5)]"
                />

                {/* Shutter Camera Flash Element */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    scale: [0.8, 1.4, 0.9],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[radial-gradient(circle,rgba(255,200,0,0.25)_0%,rgba(189,22,22,0.4)_50%,transparent_75%)] blur-lg pointer-events-none"
                />

                {/* Brand Logo with Smooth Reveal & Pop */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative z-10 p-3 sm:p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-zinc-800/80 shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
                >
                  <img
                    src={currentLogo}
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (!el.src.endsWith('/assets/logo.png')) {
                        el.src = '/assets/logo.png';
                      } else if (!el.src.endsWith('/logo.png')) {
                        el.src = '/logo.png';
                      }
                    }}
                    alt="Snap Shots"
                    width={240}
                    height={54}
                    style={{ aspectRatio: '1382/310' }}
                    className="h-10 sm:h-12 md:h-14 w-auto max-h-[56px] object-contain block drop-shadow-[0_0_18px_rgba(189,22,22,0.6)]"
                    loading="eager"
                    decoding="sync"
                  />
                </motion.div>
              </div>

              {/* Brand Title / Cinematic Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-center mb-5"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#bd1616] animate-ping" />
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-zinc-300">
                    Snap Shots Elite
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#bd1616] animate-ping" />
                </div>
                <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-zinc-500 font-semibold">
                  4K Cinema Reels &bull; Same-Day Turnaround
                </p>
              </motion.div>

              {/* Cinematic Progress Bar */}
              <div className="w-full max-w-[260px] sm:max-w-[300px]">
                <div className="relative h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#750d0d] via-[#bd1616] to-[#ffc800] rounded-full shadow-[0_0_12px_#bd1616]"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: 'easeOut', duration: 0.1 }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-500 font-mono font-medium">
                  <span className="uppercase tracking-wider text-zinc-400">Loading site</span>
                  <span className="text-white font-bold">{progress}%</span>
                </div>
              </div>

              {/* Action: Upload Video in Preload & Skip */}
              <div className="mt-6 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#bd1616]/30 border border-[#9e1212] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload My Video in Preload</span>
                </button>

                <span className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors tracking-wider uppercase font-semibold mt-1">
                  Tap anywhere to enter site &rarr;
                </span>
              </div>
            </div>
          )}

          {/* Feedback & Upload Status Toasts */}
          {uploadSuccessMessage && (
            <div className="absolute bottom-6 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-medium animate-in fade-in duration-200 shadow-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{uploadSuccessMessage}</span>
            </div>
          )}

          {isUploading && (
            <div className="absolute bottom-6 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium animate-in fade-in duration-200 shadow-xl">
              <Loader2 className="w-4 h-4 animate-spin text-[#bd1616]" />
              <span>Uploading preload video to server...</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* UPLOAD PRELOAD VIDEO MODAL                                                */}
          {/* ========================================================================= */}
          {isUploadModalOpen && (
            <div
              className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl p-6 text-white space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#bd1616]/20 border border-[#bd1616]/40 flex items-center justify-center text-[#bd1616]">
                      <Film className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Upload Preload Video</h3>
                      <p className="text-[11px] text-zinc-400">Plays as your site intro before entering</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Option 1: File Pick from Computer / Phone */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Option 1: Choose Video File (.mp4, .mov, .webm)
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 border-2 border-dashed border-zinc-700 hover:border-[#bd1616] rounded-2xl bg-zinc-900/50 hover:bg-zinc-900/90 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  >
                    <Upload className="w-6 h-6 text-[#bd1616]" />
                    <span className="text-xs font-bold text-white">Select Video File</span>
                    <span className="text-[11px] text-zinc-400">Supports MP4, MOV, WEBM (vertical or 16:9)</span>
                  </button>
                </div>

                {/* Option 2: Direct Video URL */}
                <form onSubmit={handleSaveUrl} className="space-y-2 pt-2 border-t border-zinc-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Option 2: Direct Video Link URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/my-intro.mp4"
                      className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#bd1616]"
                    />
                    <button
                      type="submit"
                      disabled={!urlInput.trim() || isUploading}
                      className="px-4 py-2 rounded-xl bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </form>

                {/* Reset button if custom exists */}
                {preloadVideoUrl && (
                  <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
                    <span className="text-[11px] text-zinc-400">Currently using custom video</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        handleResetPreload(e);
                        setIsUploadModalOpen(false);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 underline underline-offset-4 cursor-pointer"
                    >
                      Reset to Animated Logo
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
