import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SitePreloaderProps {
  onComplete?: () => void;
}

export const SitePreloader: React.FC<SitePreloaderProps> = ({ onComplete }) => {
  const [isDone, setIsDone] = useState(false);
  const [isRendered, setIsRendered] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Lock body scroll while preloader video is active
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

  // Safety fallback: if video doesn't end or fails to start within 3.5s, smoothly open site
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      finishAndOpenSite();
    }, 3500);

    return () => clearTimeout(fallbackTimer);
  }, []);

  const finishAndOpenSite = () => {
    setIsDone(true);
    setTimeout(() => {
      setIsRendered(false);
    }, 550);
  };

  // When video completes playback (e.g. 1.33s), smoothly open the site
  const handleVideoEnded = () => {
    finishAndOpenSite();
  };

  const handleVideoError = () => {
    finishAndOpenSite();
  };

  if (!isRendered) return null;

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          key="site-preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[99999] bg-[#000000] flex items-center justify-center select-none overflow-hidden cursor-pointer"
          onClick={finishAndOpenSite}
          role="status"
          aria-label="Snap Shots Intro Animation"
        >
          {/* Subtle Ambient Red Glow behind video */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
            <div className="w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(189,22,22,0.22)_0%,rgba(0,0,0,0)_70%)] blur-3xl" />
          </div>

          {/* User's Uploaded Preload Video */}
          <div className="relative z-10 w-full h-full flex items-center justify-center max-w-6xl mx-auto px-2">
            <video
              ref={videoRef}
              src="/videos/preload.mp4"
              playsInline
              webkit-playsinline="true"
              autoPlay
              muted
              preload="auto"
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              className="w-full h-full max-h-screen object-contain pointer-events-none"
            />
          </div>

          {/* Minimal Subtle Skip in Corner */}
          <button
            type="button"
            onClick={finishAndOpenSite}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/90 text-zinc-400 hover:text-white text-xs font-semibold border border-zinc-800/80 backdrop-blur-sm transition-all cursor-pointer tracking-wider"
          >
            Skip &rarr;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
