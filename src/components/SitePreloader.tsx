import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SitePreloaderProps {
  onComplete?: () => void;
}

export const SitePreloader: React.FC<SitePreloaderProps> = ({ onComplete }) => {
  const [isDone, setIsDone] = useState(false);
  const [isRendered, setIsRendered] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasFinishedRef = useRef(false);

  const finishAndOpenSite = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    setIsDone(true);
    setTimeout(() => {
      setIsRendered(false);
      if (onComplete) onComplete();
    }, 450);
  };

  // Lock body scroll while preloader video is active
  useEffect(() => {
    if (!isDone && isRendered) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isDone, isRendered]);

  // Handle video autoplay, event handlers, and safety timer
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishAndOpenSite();
      return;
    }

    const video = videoRef.current;
    if (video) {
      // Force muted & playsinline for seamless mobile & desktop autoplay compliance
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', 'true');

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Preload video autoplay was deferred or blocked:', err);
        });
      }
    }

    // Safety fallback timer: video is ~1.71s; allow up to 4s for network fetch + playback
    const safetyTimer = setTimeout(() => {
      finishAndOpenSite();
    }, 4000);

    return () => clearTimeout(safetyTimer);
  }, []);

  const handleVideoLoadedData = () => {
    setVideoLoaded(true);
    const video = videoRef.current;
    if (video && video.paused) {
      video.play().catch(() => {});
    }
  };

  const handleVideoEnded = () => {
    finishAndOpenSite();
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.warn('Preloader video encountered an error, transitioning to site:', e);
    setTimeout(() => {
      finishAndOpenSite();
    }, 1200);
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
            <div className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full bg-[radial-gradient(circle,rgba(189,22,22,0.25)_0%,rgba(0,0,0,0)_70%)] blur-3xl animate-pulse" />
          </div>

          {/* Underlay Brand Logo Placeholder while video decodes/buffers */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-none ${
              videoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <img
              src="/logo.png"
              alt="Snap Shots"
              className="w-28 h-auto object-contain drop-shadow-2xl animate-pulse mb-3"
            />
            <div className="w-24 h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div className="w-full h-full bg-[#bd1616] animate-pulse" />
            </div>
          </div>

          {/* Preload Video */}
          <div className="relative z-10 w-full h-full flex items-center justify-center max-w-6xl mx-auto px-2">
            <video
              ref={videoRef}
              src="/videos/preload.mp4"
              playsInline
              webkit-playsinline="true"
              autoPlay
              muted
              preload="auto"
              onLoadedData={handleVideoLoadedData}
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              className={`w-full h-full max-h-screen object-contain pointer-events-none transition-opacity duration-200 ${
                videoLoaded ? 'opacity-100' : 'opacity-90'
              }`}
            />
          </div>

          {/* Skip Button in Corner */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              finishAndOpenSite();
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/90 text-zinc-400 hover:text-white text-xs font-semibold border border-zinc-800/80 backdrop-blur-sm transition-all cursor-pointer tracking-wider"
          >
            Skip &rarr;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
