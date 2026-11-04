import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SitePreloaderProps {
  onComplete?: () => void;
}

export const SitePreloader: React.FC<SitePreloaderProps> = ({ onComplete }) => {
  const [isDone, setIsDone] = useState(false);
  const [isRendered, setIsRendered] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
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

  // Lock body scroll while preloader is active
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

  // Visual progress ticker for buttery smooth feedback
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + 5, 100);
      });
    }, 90);

    return () => clearInterval(interval);
  }, []);

  // Handle video autoplay, event handlers, and safety timer
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', 'true');

      const attemptPlay = () => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setVideoLoaded(true);
            })
            .catch((err) => {
              console.warn('Preload video autoplay was deferred or blocked:', err);
            });
        }
      };

      attemptPlay();
    }

    // Safety fallback timer: video is ~1.71s; allow up to 3.2s
    const safetyTimer = setTimeout(() => {
      finishAndOpenSite();
    }, 3200);

    return () => clearTimeout(safetyTimer);
  }, []);

  const handleVideoLoadedData = () => {
    setVideoLoaded(true);
    const video = videoRef.current;
    if (video && video.paused) {
      video.play().catch(() => {});
    }
  };

  const handleVideoPlaying = () => {
    setVideoLoaded(true);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.currentTime > 0) {
      setVideoLoaded(true);
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
          {/* Ambient Red Glow behind video */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
            <div className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full bg-[radial-gradient(circle,rgba(189,22,22,0.3)_0%,rgba(0,0,0,0)_70%)] blur-3xl animate-pulse" />
          </div>

          {/* Underlay Brand Logo & Progress Bar */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-none ${
              videoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <img
              src="/logo.png"
              alt="Snap Shots"
              className="w-28 sm:w-36 h-auto object-contain drop-shadow-2xl animate-pulse mb-4"
            />
            <div className="w-36 sm:w-48 h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-[#bd1616] transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] uppercase font-bold tracking-widest text-zinc-300">
              Your Moments Our Snaps
            </p>
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
              onPlaying={handleVideoPlaying}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              className={`w-full h-full max-h-screen object-contain pointer-events-none transition-opacity duration-300 ${
                videoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <source src="/videos/preload.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Skip Button in Corner */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              finishAndOpenSite();
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 px-3.5 py-1.5 rounded-full bg-black/70 hover:bg-black/95 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-800/80 backdrop-blur-sm transition-all cursor-pointer tracking-wider"
          >
            Skip &rarr;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
