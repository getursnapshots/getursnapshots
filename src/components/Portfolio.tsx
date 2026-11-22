import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Film,
} from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { ReelWorkItem } from '../types';
import { isAiStudioEnvironment } from '../utils/aiStudioEnv';
import { VideoLightbox } from './VideoLightbox';
import { subscribeToSlides } from '../config/firebase';
import { useAdminAuth } from '../context/AdminAuthContext';


interface PortfolioProps {
  onSelectReel?: (reel: ReelWorkItem) => void;
  onBookShoot?: (category: string) => void;
}

/**
 * Individual Video Slide Card:
 * Enforces rule: ONLY the middle video plays. All other side videos are strictly paused.
 * When a video comes to the middle, it plays; when it leaves the middle, it pauses.
 */
const defaultFallbackVideos = [
  '/videos/reel-1.mp4',
  '/videos/reel-2.mp4',
  '/videos/reel-3.mp4',
  '/videos/reel-4.mp4',
  '/videos/reel-5.mp4',
];

interface VideoSlideCardProps {
  videoUrl?: string;
  posterUrl?: string;
  isCenter: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  isCarouselInView: boolean;
  diff: number;
  title?: string;
  category?: string;
  instagramUrl?: string;
  slideNumber: number;
  onVideoClick?: () => void;
  onVideoRefReady?: (el: HTMLVideoElement | null) => void;
}

const VideoSlideCard: React.FC<VideoSlideCardProps> = ({
  videoUrl,
  posterUrl,
  isCenter,
  isPlaying,
  isMuted,
  isCarouselInView,
  diff,
  title,
  category,
  slideNumber,
  onVideoClick,
  onVideoRefReady,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMediaReady, setIsMediaReady] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Fallback to high-quality local MP4 if URL is missing, empty, or an external link
  const isDirectFile = Boolean(
    videoUrl &&
      (videoUrl.endsWith('.mp4') ||
        videoUrl.endsWith('.webm') ||
        videoUrl.startsWith('blob:') ||
        videoUrl.includes('/videos/'))
  );
  const resolvedVideoUrl = isDirectFile
    ? videoUrl
    : defaultFallbackVideos[(slideNumber - 1) % defaultFallbackVideos.length] || '/videos/reel-1.mp4';

  // Progressive preloading strategy:
  // - Off-screen carousel: none (prevent multi-MB downloads on initial load)
  // - Center active visible reel: auto
  // - Adjacent reels: metadata (downloads only dimensions & headers, ~kb)
  // - Far side reels: none
  const preloadStrategy = !isCarouselInView
    ? 'none'
    : isCenter
    ? 'auto'
    : Math.abs(diff) <= 1
    ? 'metadata'
    : 'none';

  // Reset loading state if video source URL changes
  useEffect(() => {
    setIsMediaReady(false);
    setHasError(false);
  }, [resolvedVideoUrl, posterUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isCenter && isCarouselInView) {
      if (onVideoRefReady) {
        onVideoRefReady(video);
      }
      video.defaultMuted = isMuted;
      video.muted = isMuted;
      if (!isMuted) {
        video.volume = 1.0;
      }

      if (isPlaying) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            // Only fall back to muted if initial unmuted autoplay was rejected by mobile browser policy
            if (!video.muted) {
              console.log('Mobile autoplay policy prevented unmuted sound, falling back to muted autoplay:', err);
              video.muted = true;
              video.defaultMuted = true;
              video.play().catch(() => {});
            }
          });
        }
      } else {
        video.pause();
      }
    } else {
      // Side videos or off-screen carousel: MUST be strictly paused and muted
      video.muted = true;
      video.defaultMuted = true;
      video.pause();
    }
  }, [isCenter, isPlaying, isMuted, isCarouselInView, resolvedVideoUrl, onVideoRefReady]);

  const handleMediaLoaded = () => {
    setIsMediaReady(true);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950">
      {/* ================================================================ */}
      {/* SKELETON LOADER & SUBTLE ANIMATED PULSE                          */}
      {/* Displayed while video and poster are being fetched & initialized */}
      {/* ================================================================ */}
      <div
        className={`absolute inset-0 z-20 flex flex-col justify-between p-4 bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black select-none pointer-events-none transition-opacity duration-500 ease-out ${
          isMediaReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-hidden={isMediaReady}
      >
        {/* Shimmer light sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-shimmer" />

        {/* Top skeleton tag & live pulse dot */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="h-2.5 w-16 rounded-full bg-zinc-800/80 animate-pulse" />
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#bd1616] animate-ping" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#bd1616]/70" />
          </div>
        </div>

        {/* Center reel icon with subtle brand red pulsing glow */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto gap-3">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-14 h-14 rounded-full bg-[#bd1616]/20 animate-ping opacity-30" />
            <div className="relative w-12 h-12 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center shadow-lg backdrop-blur-sm">
              <Film className="w-5 h-5 text-zinc-400 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#bd1616]" />
            <span>Loading Reel</span>
          </div>
        </div>

        {/* Bottom metadata skeleton lines */}
        <div className="relative z-10 space-y-2">
          <div className="h-3 w-4/5 rounded-full bg-zinc-800/80 animate-pulse" />
          <div className="h-2 w-1/2 rounded-full bg-zinc-800/50 animate-pulse" />
        </div>
      </div>

      {/* Background Poster: Lightweight poster thumbnail rendered immediately */}
      {posterUrl && !posterUrl.includes('unsplash.com') && (
        <img
          src={posterUrl}
          alt={title || ''}
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          onLoad={handleMediaLoaded}
          onError={() => {
            // Even if poster errors out, don't trap the user in the loading skeleton
            setIsMediaReady(true);
          }}
          className={`absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-all duration-500 ease-out will-change-transform group-hover:scale-105 ${
            isMediaReady ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Primary HTML5 Video Element with Progressive Viewport-Aware Preload */}
      {resolvedVideoUrl && (
        <video
          ref={(el) => {
            videoRef.current = el;
            if (isCenter && onVideoRefReady) {
              onVideoRefReady(el);
            }
          }}
          src={resolvedVideoUrl}
          poster={posterUrl && !posterUrl.includes('unsplash.com') ? posterUrl : undefined}
          playsInline
          webkit-playsinline="true"
          loop
          preload={preloadStrategy}
          muted={isCenter ? isMuted : true}
          onClick={(e) => {
            if (isCenter && onVideoClick) {
              e.stopPropagation();
              onVideoClick();
            }
          }}
          onLoadedMetadata={() => {
            setIsMediaReady(true);
            const v = videoRef.current;
            if (v && v.currentTime === 0) {
              try {
                v.currentTime = 0.001;
              } catch {}
            }
            if (isCenter && onVideoRefReady && v) {
              onVideoRefReady(v);
            }
          }}
          onLoadedData={handleMediaLoaded}
          onCanPlay={handleMediaLoaded}
          onPlaying={handleMediaLoaded}
          onError={() => {
            setHasError(true);
            setIsMediaReady(true);
          }}
          className={`relative z-10 w-full h-full object-cover transition-opacity duration-500 cursor-pointer ${
            isMediaReady && !hasError ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Graceful Video Load Fallback: shown when video URL returns 404 or fails */}
      {hasError && (
        <div className="absolute inset-0 z-15 flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-xs text-center select-none pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-black/75 border border-white/20 flex items-center justify-center mb-2 shadow-lg">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide line-clamp-1">{title}</span>
          <span className="text-[10px] text-zinc-300 mt-0.5 uppercase tracking-wider font-semibold">
            {category || 'Snap Shots 4K Edit'}
          </span>
        </div>
      )}
    </div>
  );
};

export const Portfolio: React.FC<PortfolioProps> = ({ onSelectReel, onBookShoot }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedLightboxReel, setSelectedLightboxReel] = useState<ReelWorkItem | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const isMuted = true;
  const centerVideoRef = useRef<HTMLVideoElement | null>(null);

  // Open 4K video lightbox popup with sound on all devices
  const handleOpenLightbox = (reel: ReelWorkItem) => {
    if (centerVideoRef.current) {
      centerVideoRef.current.pause();
    }
    setIsPlaying(false);
    setSelectedLightboxReel(reel);
    onSelectReel?.(reel);
  };

  // Check if running in AI Studio development/workspace mode or logged in as Admin
  const { isAdmin } = useAdminAuth();
  const isAiStudio = isAiStudioEnvironment() || isAdmin;

  // Strict replacement dictionary keyed purely by numeric slide index (0, 1, 2, ...)
  const [replacedBySlide, setReplacedBySlide] = useState<
    Record<number, { videoUrl: string; posterUrl?: string }>
  >(() => {
    try {
      localStorage.removeItem('snapshots_slide_replacements_strict_v4');
      const saved = localStorage.getItem('snapshots_slide_replacements_strict_v5');
      if (saved) {
        const parsed = JSON.parse(saved);
        const clean: Record<number, { videoUrl: string; posterUrl?: string }> = {};
        Object.entries(parsed).forEach(([k, v]: [string, any]) => {
          if (
            v?.videoUrl &&
            !v.videoUrl.startsWith('blob:') &&
            !v.videoUrl.includes('/assets/uploads/') &&
            !v.videoUrl.includes('instagram.com')
          ) {
            clean[Number(k)] = v;
          }
        });
        return clean;
      }
      return {};
    } catch {
      return {};
    }
  });

  // Fetch permanent custom slides from server (/api/custom-slides and /custom-slides.json)
  // Ensures uploaded videos show up reliably on the live website for all visitors
  useEffect(() => {
    let isMounted = true;
    const fetchSavedSlides = async () => {
      try {
        // Try /api/custom-slides first, fall back to /custom-slides.json
        let res = await fetch(`/api/custom-slides?t=${Date.now()}`).catch(() => null);
        if (!res || !res.ok || (res.headers.get('content-type') && !res.headers.get('content-type')!.includes('json'))) {
          // If running on static host (e.g. Vercel) where API routes rewrite to HTML, fetch static JSON
          res = await fetch(`/custom-slides.json?t=${Date.now()}`).catch(() => null);
        }
        if (res && res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('json') || contentType.includes('text/plain') || contentType === '') {
            const data = await res.json();
            if (isMounted && data && typeof data === 'object') {
              const parsed: Record<number, { videoUrl: string; posterUrl?: string }> = {};
              Object.entries(data).forEach(([key, val]: [string, any]) => {
                const numKey = Number(key);
                if (
                  !isNaN(numKey) &&
                  val?.videoUrl &&
                  !val.videoUrl.startsWith('blob:') &&
                  !val.videoUrl.includes('/assets/uploads/') &&
                  !val.videoUrl.includes('instagram.com')
                ) {
                  parsed[numKey] = {
                    videoUrl: val.videoUrl,
                    posterUrl: val.posterUrl || '',
                  };
                }
              });
              if (Object.keys(parsed).length > 0) {
                setReplacedBySlide((prev) => {
                  const merged = { ...prev, ...parsed };
                  try {
                    localStorage.setItem(
                      'snapshots_slide_replacements_strict_v5',
                      JSON.stringify(merged)
                    );
                  } catch {}
                  return merged;
                });
              }
            }
          }
        }
      } catch (e) {
        console.warn('Could not load custom slides from server:', e);
      }
    };

    fetchSavedSlides();

    // Real-time synchronization with custom slides
    let unsubscribeSlides = () => {};
    try {
      unsubscribeSlides = subscribeToSlides((customSlides) => {
        if (isMounted && Object.keys(customSlides).length > 0) {
          const cleanSlides: Record<number, { videoUrl: string; posterUrl?: string }> = {};
          Object.entries(customSlides).forEach(([k, v]) => {
            if (v?.videoUrl && !v.videoUrl.includes('/assets/uploads/')) {
              cleanSlides[Number(k)] = v;
            }
          });
          if (Object.keys(cleanSlides).length > 0) {
            setReplacedBySlide((prev) => {
              const merged = { ...prev, ...cleanSlides };
              try {
                localStorage.setItem(
                  'snapshots_slide_replacements_strict_v5',
                  JSON.stringify(merged)
                );
              } catch {}
              return merged;
            });
          }
        }
      });
    } catch (e) {
      console.warn('Slides listener not active:', e);
    }

    return () => {
      isMounted = false;
      unsubscribeSlides();
    };
  }, []);

  // Map reels: Strictly display 5 videos (reel-1.mp4 through reel-5.mp4)
  const filteredReels: ReelWorkItem[] = siteConfig.portfolioReels
    .slice(0, 5)
    .map((reel, idx) => {
      const replacement = replacedBySlide[idx];
      const cleanReelPoster = reel.posterUrl && !reel.posterUrl.includes('unsplash.com') ? reel.posterUrl : undefined;
      if (replacement && replacement.videoUrl && !replacement.videoUrl.includes('/assets/uploads/')) {
        const cleanReplacementPoster =
          replacement.posterUrl && !replacement.posterUrl.includes('unsplash.com')
            ? replacement.posterUrl
            : undefined;
        return {
          ...reel,
          videoUrl: replacement.videoUrl,
          posterUrl: cleanReplacementPoster || cleanReelPoster,
        };
      }
      return {
        ...reel,
        videoUrl: reel.videoUrl || '',
        posterUrl: cleanReelPoster,
      };
    })
    .filter((reel) => Boolean(reel.videoUrl && reel.videoUrl.trim() !== ''))
    .slice(0, 5);

  const totalSlides = filteredReels.length;

  const handleNext = useCallback(() => {
    if (totalSlides === 0) return;
    setActiveIndex((prev) => (prev + 1) % totalSlides);
    setIsPlaying(true);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    if (totalSlides === 0) return;
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setIsPlaying(true);
  }, [totalSlides]);

  // Tap on active center video: pop up and play whole video with sound in all devices
  const handleCenterSlideClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const currentReel = filteredReels[activeIndex];
    if (currentReel) {
      handleOpenLightbox(currentReel);
    }
  };

  // IntersectionObserver to pause video playback and prevent background auto-scroll when off-screen
  const portfolioContainerRef = useRef<HTMLDivElement | null>(null);
  const [isCarouselInView, setIsCarouselInView] = useState<boolean>(true);

  useEffect(() => {
    const el = portfolioContainerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCarouselInView(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '150px 0px', // preload slightly before viewport intersection
        threshold: 0.15,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // IMPORTANT: Disable auto-scroll when off-screen, hovered, or in AI Studio edit mode!
  useEffect(() => {
    if (isAiStudio || isHovered || !isCarouselInView || totalSlides <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [isAiStudio, isHovered, isCarouselInView, totalSlides, handleNext]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsHovered(true);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsHovered(false);
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (deltaX > 40) {
      handlePrev();
    } else if (deltaX < -40) {
      handleNext();
    }
    setTouchStartX(null);
  };

  return (
    <div
      id="work"
      ref={portfolioContainerRef}
      className="bg-transparent pt-4 sm:pt-6 pb-6 sm:pb-8 relative overflow-hidden select-none"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 3D-Feel Carousel / Pure Video Slides Stage */}
        <div
          className="relative h-[440px] min-[390px]:h-[480px] sm:h-[530px] md:h-[560px] max-w-5xl lg:max-w-6xl mx-auto flex items-center justify-center overflow-hidden sm:overflow-visible"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {filteredReels.map((reel, index) => {
            // Compute relative offset (-2, -1, 0, 1, 2)
            let diff = index - activeIndex;
            if (diff > totalSlides / 2) diff -= totalSlides;
            if (diff < -totalSlides / 2) diff += totalSlides;

            const isCenter = diff === 0;
            const isAdjacentLeft = diff === -1;
            const isAdjacentRight = diff === 1;
            const isFarLeft = diff === -2;

            // Show 5 slides: center + 2 equal-sized divs on left + 2 equal-sized divs on right
            if (Math.abs(diff) > 2) {
              return null;
            }

            return (
              <div
                key={reel.id || index}
                onClick={(e) => {
                  if (isCenter) {
                    handleCenterSlideClick(e);
                  } else {
                    // Clicking ANY side card selects that exact slide immediately
                    setActiveIndex(index);
                    setIsPlaying(true);
                  }
                }}
                className={`absolute transition-all duration-500 ease-out will-change-transform cursor-pointer ${
                  isCenter
                    ? 'z-30 w-[240px] min-[390px]:w-[265px] sm:w-[290px] md:w-[320px] aspect-[9/16] rounded-[26px] sm:rounded-[34px] overflow-hidden bg-zinc-950 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(189,22,22,0.3)] border-2 border-zinc-700/80 hover:border-[#bd1616] scale-100 translate-x-0 opacity-100 group'
                    : isAdjacentLeft
                    ? 'z-20 w-[205px] min-[390px]:w-[225px] sm:w-[245px] md:w-[275px] aspect-[9/16] rounded-[22px] sm:rounded-[28px] overflow-hidden bg-zinc-950 shadow-xl border border-zinc-800/80 -translate-x-[140px] min-[390px]:-translate-x-[160px] sm:-translate-x-[200px] md:-translate-x-[240px] scale-[0.88] opacity-80 hover:opacity-95'
                    : isAdjacentRight
                    ? 'z-20 w-[205px] min-[390px]:w-[225px] sm:w-[245px] md:w-[275px] aspect-[9/16] rounded-[22px] sm:rounded-[28px] overflow-hidden bg-zinc-950 shadow-xl border border-zinc-800/80 translate-x-[140px] min-[390px]:translate-x-[160px] sm:translate-x-[200px] md:translate-x-[240px] scale-[0.88] opacity-80 hover:opacity-95'
                    : isFarLeft
                    ? 'z-10 w-[175px] min-[390px]:w-[190px] sm:w-[210px] md:w-[235px] aspect-[9/16] rounded-[18px] sm:rounded-[24px] overflow-hidden bg-zinc-950 shadow-lg border border-zinc-800/60 -translate-x-[250px] min-[390px]:-translate-x-[280px] sm:-translate-x-[360px] md:-translate-x-[430px] scale-[0.76] opacity-50 hover:opacity-75'
                    : 'z-10 w-[175px] min-[390px]:w-[190px] sm:w-[210px] md:w-[235px] aspect-[9/16] rounded-[18px] sm:rounded-[24px] overflow-hidden bg-zinc-950 shadow-lg border border-zinc-800/60 translate-x-[250px] min-[390px]:translate-x-[280px] sm:translate-x-[360px] md:translate-x-[430px] scale-[0.76] opacity-50 hover:opacity-75'
                }`}
              >
                {/* 9:16 Pure Video Slide Stage: ONLY middle plays, all sides are strictly paused */}
                <div className="relative w-full h-full bg-black">
                  {/* Center Slide Action Controls & Overlay */}
                  <VideoSlideCard
                    videoUrl={reel.videoUrl}
                    posterUrl={reel.posterUrl}
                    isCenter={isCenter}
                    isPlaying={isPlaying}
                    isMuted={isMuted}
                    isCarouselInView={isCarouselInView}
                    diff={diff}
                    title={reel.title}
                    category={reel.category}
                    slideNumber={index + 1}
                    onVideoClick={() => {
                      if (isCenter) {
                        handleOpenLightbox(reel);
                      }
                    }}
                    onVideoRefReady={(el) => {
                      if (isCenter) {
                        centerVideoRef.current = el;
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Navigation & Indicators */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          {/* Left Circular Arrow Button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-zinc-900 hover:bg-[#bd1616] text-white border border-zinc-800 hover:border-[#bd1616] shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          {/* Dots Pagination Indicators */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            {filteredReels.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveIndex(idx);
                  setIsPlaying(true);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer touch-manipulation ${
                  activeIndex === idx
                    ? 'w-7 sm:w-8 h-2 sm:h-2.5 bg-[#bd1616] shadow-md shadow-[#bd1616]/50'
                    : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-zinc-700 hover:bg-zinc-500'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Right Circular Arrow Button */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Slide"
            className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-zinc-900 hover:bg-[#bd1616] text-white border border-zinc-800 hover:border-[#bd1616] shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* 4K Video Popup Modal with Sound on All Devices */}
        {selectedLightboxReel && (
          <VideoLightbox
            reel={selectedLightboxReel}
            onClose={() => {
              setSelectedLightboxReel(null);
            }}
            onBookShoot={(category) => {
              setSelectedLightboxReel(null);
              if (onBookShoot) {
                onBookShoot(category);
              } else {
                const bookBtn =
                  document.getElementById('header-book-btn') ||
                  document.getElementById('footer-book-cta-btn');
                if (bookBtn) {
                  bookBtn.click();
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
};
