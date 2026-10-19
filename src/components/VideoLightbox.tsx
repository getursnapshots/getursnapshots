import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Film,
} from 'lucide-react';
import { ReelWorkItem } from '../types';
import { getResponsiveImageSrcSet } from '../utils/imageUtils';

const defaultFallbackVideos = [
  '/videos/reel-1.mp4',
  '/videos/reel-2.mp4',
  '/videos/reel-3.mp4',
  '/videos/reel-4.mp4',
  '/videos/reel-5.mp4',
];

interface VideoLightboxProps {
  reel: ReelWorkItem | null;
  onClose: () => void;
  onBookShoot?: (category: string) => void;
}

export const VideoLightbox: React.FC<VideoLightboxProps> = ({ reel, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>('0:00');
  const [durationTime, setDurationTime] = useState<string>('0:30');
  const [videoError, setVideoError] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll and play whole video with sound when lightbox opens
  useEffect(() => {
    if (reel) {
      document.body.style.overflow = 'hidden';
      setIsPlaying(true);
      setIsMuted(false);
      setProgress(0);
      setVideoError(false);

      // Play immediately with audio enabled across all devices
      const video = videoRef.current;
      if (video) {
        try {
          video.currentTime = 0;
          video.muted = false;
          video.defaultMuted = false;
          video.volume = 1.0;
        } catch {}

        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.log('Autoplay unmuted notice, testing policy fallback:', err);
            // Fallback only if mobile browser policy requires initial mute
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.defaultMuted = true;
              setIsMuted(true);
              videoRef.current.play().catch(() => {});
            }
          });
        }
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [reel]);

  if (!reel) return null;

  // Resolve direct video source (No iframes, pure high performance 4K video)
  const hasDirectVideo = Boolean(
    reel.videoUrl &&
      (reel.videoUrl.startsWith('blob:') ||
        reel.videoUrl.startsWith('data:') ||
        reel.videoUrl.endsWith('.mp4') ||
        reel.videoUrl.endsWith('.webm') ||
        reel.videoUrl.includes('.mp4') ||
        reel.videoUrl.startsWith('/videos/') ||
        reel.videoUrl.startsWith('/assets/'))
  );

  const numId =
    typeof reel.id === 'number'
      ? reel.id
      : parseInt(String(reel.id).replace(/\D/g, '') || '0', 10);
  const effectiveVideoUrl = hasDirectVideo
    ? (reel.videoUrl as string)
    : defaultFallbackVideos[Math.abs(numId) % defaultFallbackVideos.length];

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Synchronous audio toggle ensuring sound plays immediately on mobile & touch devices
  const toggleMute = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
      if ('preventDefault' in e && e.type === 'touchend') {
        e.preventDefault();
      }
    }
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    video.defaultMuted = nextMuted;
    if (!nextMuted) {
      video.volume = 1.0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Playback with sound notice:', err);
        });
      }
    }
    setIsMuted(nextMuted);
  };

  const formatSeconds = (sec: number): string => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setProgress((cur / dur) * 100);
      setCurrentTime(formatSeconds(cur));
      setDurationTime(formatSeconds(dur));
    }
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !videoRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * videoRef.current.duration;
  };

  // Sync fullscreen state across browser changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Custom Fullscreen toggle supporting mobile (iOS webkitEnterFullscreen, Android) and desktop
  const handleFullscreen = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
      if ('preventDefault' in e && e.type === 'touchend') {
        e.preventDefault();
      }
    }
    const video = videoRef.current;
    if (!video) return;

    // iOS Safari webkitEnterFullscreen support
    if ((video as any).webkitEnterFullscreen) {
      try {
        (video as any).webkitEnterFullscreen();
        return;
      } catch (err) {
        console.warn('webkitEnterFullscreen error:', err);
      }
    }

    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } else {
      if (video.requestFullscreen) {
        video.requestFullscreen().catch((err) => {
          console.warn('requestFullscreen error:', err);
        });
      } else if ((video as any).webkitRequestFullscreen) {
        (video as any).webkitRequestFullscreen();
      } else if ((video as any).mozRequestFullScreen) {
        (video as any).mozRequestFullScreen();
      } else if ((video as any).msRequestFullscreen) {
        (video as any).msRequestFullscreen();
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={reel.title}
      onClick={onClose}
      className="fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/90 backdrop-blur-2xl transition-opacity animate-in fade-in duration-300"
    >
      {/* Pure 9:16 Vertical Video Popup - Shows ONLY the Video */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[340px] min-[400px]:max-w-[380px] sm:max-w-[420px] md:max-w-[460px] aspect-[9/16] max-h-[92vh] bg-black border border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/95 overflow-hidden flex items-center justify-center select-none"
      >
        {/* Top Right Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-[#bd1616] text-white hover:bg-[#9e1212] active:bg-[#750d0d] transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xl border border-white/20 touch-manipulation"
          aria-label="Close video player"
        >
          <X className="w-5 h-5" />
        </button>

        {!videoError ? (
          <>
            <video
              ref={videoRef}
              src={effectiveVideoUrl}
              poster={reel.posterUrl && !reel.posterUrl.includes('unsplash.com') ? reel.posterUrl : undefined}
              loop
              playsInline
              webkit-playsinline="true"
              autoPlay
              muted={isMuted}
              onLoadedMetadata={() => {
                const v = videoRef.current;
                if (v) {
                  if (!isMuted) {
                    v.muted = false;
                    v.defaultMuted = false;
                    v.volume = 1.0;
                  }
                  v.play().catch(() => {});
                }
              }}
              onCanPlay={() => {
                const v = videoRef.current;
                if (v && !isMuted) {
                  v.muted = false;
                  v.defaultMuted = false;
                  v.volume = 1.0;
                }
              }}
              onTimeUpdate={handleTimeUpdate}
              onClick={togglePlay}
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover cursor-pointer"
            />

            {/* Ambient Edge Shadows */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-transparent to-black/40" />

            {/* Watermark Branding (Snap Shots) */}
            <div className="absolute top-3.5 left-3.5 z-40 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#bd1616] animate-pulse" />
              <span className="text-[10px] font-black tracking-wider text-white">SNAP SHOTS 4K</span>
            </div>

            {/* Top-Right Media Controls: Fullscreen & Sound Toggle Buttons */}
            <div className="absolute top-3.5 right-16 z-40 flex items-center gap-2">
              {/* Custom Fullscreen Toggle Button */}
              <button
                type="button"
                onClick={handleFullscreen}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleFullscreen(e);
                }}
                className="h-10 w-10 flex items-center justify-center rounded-full transition-all cursor-pointer backdrop-blur-md shadow-2xl active:scale-90 border touch-manipulation bg-black/85 hover:bg-[#bd1616] active:bg-[#750d0d] text-white border-white/30 hover:border-white/50"
                aria-label={isFullscreen ? 'Exit fullscreen video' : 'Enter fullscreen video'}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-white" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-white" />
                )}
              </button>

              {/* Prominent Floating Mute/Unmute Toggle Button */}
              <button
                type="button"
                onClick={toggleMute}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  toggleMute(e);
                }}
                className={`h-10 w-10 flex items-center justify-center rounded-full transition-all cursor-pointer backdrop-blur-md shadow-2xl active:scale-90 border touch-manipulation ${
                  isMuted
                    ? 'bg-black/85 hover:bg-[#bd1616] active:bg-[#750d0d] text-white border-white/30'
                    : 'bg-[#bd1616] text-white border-white/50 shadow-[#bd1616]/50 shadow-lg'
                }`}
                aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                title={isMuted ? 'Tap to enable sound' : 'Mute sound'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-[#ffc800]" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white animate-pulse" />
                )}
              </button>
            </div>

            {/* Mobile-Friendly "Tap for Sound" Floating Pill */}
            {isMuted && isPlaying && (
              <button
                type="button"
                onClick={toggleMute}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  toggleMute(e);
                }}
                className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/95 hover:bg-[#bd1616] text-white text-xs font-bold border border-white/30 shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer animate-pulse touch-manipulation"
                aria-label="Tap to enable sound"
              >
                <VolumeX className="w-4 h-4 text-[#ffc800]" />
                <span>Tap for Sound</span>
              </button>
            )}

            {/* Center Play/Pause Indicator Overlay */}
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer bg-black/30 backdrop-blur-xs"
                aria-label="Play video"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#bd1616] text-white shadow-2xl hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
              </button>
            )}

            {/* Bottom Video Controls Bar */}
            <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between text-white pointer-events-auto">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-2 rounded-full bg-black/70 hover:bg-[#bd1616] border border-white/10 transition-colors cursor-pointer touch-manipulation"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleMute(e);
                  }}
                  className={`p-2 rounded-full border transition-all cursor-pointer touch-manipulation active:scale-90 ${
                    isMuted
                      ? 'bg-black/80 hover:bg-[#bd1616] text-zinc-300 hover:text-white border-white/20'
                      : 'bg-[#bd1616] text-white border-[#bd1616] shadow-md shadow-[#bd1616]/50'
                  }`}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-[#ffc800]" /> : <Volume2 className="w-4 h-4 text-white animate-pulse" />}
                </button>
                <span className="text-[11px] font-mono font-medium text-zinc-300 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                  {currentTime} / {durationTime}
                </span>
              </div>

              <button
                type="button"
                onClick={handleFullscreen}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleFullscreen(e);
                }}
                className="p-2 rounded-full bg-black/70 hover:bg-[#bd1616] border border-white/10 transition-colors cursor-pointer touch-manipulation active:scale-90"
                aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5 text-white" />
                )}
              </button>
            </div>

            {/* Interactive Scrub Bar */}
            <div
              onClick={handleScrub}
              className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-30 cursor-pointer hover:h-2.5 transition-all"
            >
              <div className="h-full bg-[#bd1616]" style={{ width: `${progress}%` }} />
            </div>
          </>
        ) : (
          /* Controlled Local Poster Fallback */
          <div className="relative w-full h-full bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
            {reel.posterUrl && !reel.posterUrl.includes('unsplash.com') && (
              <img
                src={reel.posterUrl}
                srcSet={getResponsiveImageSrcSet(reel.posterUrl, [360, 540, 720])}
                sizes="(max-width: 768px) 100vw, 400px"
                alt={reel.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
            <div className="relative z-20 flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-[#bd1616] flex items-center justify-center text-white mb-3 shadow-xl">
                <Film className="w-8 h-8" />
              </div>
              <h4 className="text-white text-base font-bold mb-1">{reel.title}</h4>
              <p className="text-zinc-400 text-xs max-w-xs">
                Full 4K Reel
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
