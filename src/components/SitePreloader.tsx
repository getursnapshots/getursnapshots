import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SitePreloaderProps {
  onComplete?: () => void;
}

export const SitePreloader: React.FC<SitePreloaderProps> = ({ onComplete }) => {
  const [isDone, setIsDone] = useState(false);
  const [isRendered, setIsRendered] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasFinishedRef = useRef(false);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finishAndOpenSite = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    setIsDone(true);
    setTimeout(() => {
      setIsRendered(false);
      if (onComplete) onComplete();
    }, 400);
  }, [onComplete]);

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

  // Directly start preload video immediately with a dynamic safety fallback
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

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Preload video autoplay was deferred or blocked:', err);
        });
      }
    }

    // Initial fallback timer in case video metadata never loads or stalls
    safetyTimerRef.current = setTimeout(() => {
      finishAndOpenSite();
    }, 8000);

    return () => {
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = null;
      }
    };
  }, [finishAndOpenSite]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    // Reschedule safety timer to match the actual video duration (+1.5s buffer)
    if (Number.isFinite(video.duration) && video.duration > 0) {
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
      }
      const timeoutMs = Math.max(Math.ceil((video.duration + 1.5) * 1000), 2500);
      safetyTimerRef.current = setTimeout(() => {
        finishAndOpenSite();
      }, timeoutMs);
    }

    if (video.paused) {
      video.play().catch(() => {});
    }
  };

  const handleCanPlay = () => {
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
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[99999] bg-[#000000] flex items-center justify-center select-none overflow-hidden cursor-pointer"
          onClick={finishAndOpenSite}
          role="status"
          aria-label="Snap Shots Intro Video"
        >
          {/* Direct Preload Video Only */}
          <video
            ref={videoRef}
            src="/videos/preload.mp4"
            playsInline
            autoPlay
            muted
            preload="auto"
            onLoadedMetadata={handleLoadedMetadata}
            onCanPlay={handleCanPlay}
            onEnded={handleVideoEnded}
            onError={handleVideoError}
            className="w-full h-full max-h-screen object-contain pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
