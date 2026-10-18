import React, { useRef, useState } from 'react';
import { Play, Eye, Sparkles, Volume2, VolumeX, Instagram, ArrowUpRight } from 'lucide-react';
import { ReelWorkItem } from '../types';
import { isValidInstagramUrl, getCleanInstagramUrl } from '../utils/instagram';
import { siteConfig } from '../config/siteConfig';
import { getResponsiveImageSrcSet } from '../utils/imageUtils';

interface PortfolioCardProps {
  reel: ReelWorkItem;
  onSelect: (reel: ReelWorkItem) => void;
  index: number;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({ reel, onSelect }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const [isVideoError, setIsVideoError] = useState(false);

  const isInstagram = Boolean(reel.isInstagram || reel.instagramUrl || (reel.videoUrl && (reel.videoUrl.includes('instagram.com/reel') || reel.videoUrl.includes('instagram.com/p/'))));
  const isDirectVideo = !isInstagram && !isVideoError && Boolean(
    reel.videoUrl &&
    (reel.videoUrl.endsWith('.mp4') ||
     reel.videoUrl.endsWith('.webm') ||
     reel.videoUrl.startsWith('blob:') ||
     reel.videoUrl.includes('.mp4'))
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isDirectVideo && videoRef.current) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (isDirectVideo && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const toggleSound = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const targetInstagramUrl = isValidInstagramUrl(reel.instagramUrl)
    ? getCleanInstagramUrl(reel.instagramUrl)
    : siteConfig.business.instagram;

  return (
    <div className="relative group">
      {/* Ambient Red Aura Glow on Hover Popup */}
      <div
        className={`absolute -inset-1.5 rounded-3xl bg-[#bd1616] opacity-0 transition-opacity duration-300 blur-lg pointer-events-none -z-10 ${
          isHovered ? 'opacity-35' : 'opacity-0'
        }`}
      />

      {/* Main Reel Card with Popup & Play Effect */}
      <div
        onClick={() => onSelect(reel)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`relative cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden aspect-[9/16] bg-zinc-950 border transition-all duration-300 ease-out select-none ${
          isHovered
            ? 'scale-[1.05] sm:scale-[1.07] -translate-y-2.5 z-30 shadow-2xl shadow-black/80 border-[#bd1616] ring-2 ring-[#bd1616]'
            : 'scale-100 translate-y-0 z-10 shadow-lg border-zinc-800'
        }`}
        id={`portfolio-reel-${reel.id}`}
      >
        {/* Visual Element: Direct Video or 9:16 High-Res Poster */}
        {isDirectVideo ? (
          <video
            ref={videoRef}
            src={reel.videoUrl}
            poster={reel.posterUrl}
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onError={() => setIsVideoError(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 transform-gpu will-change-transform"
          />
        ) : reel.posterUrl ? (
          <img
            src={reel.posterUrl}
            srcSet={getResponsiveImageSrcSet(reel.posterUrl, [320, 480, 640, 800])}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            width={360}
            height={640}
            loading="lazy"
            decoding="async"
            alt={reel.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 transform-gpu will-change-transform"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-zinc-900" />
        )}

        {/* Subtle Gradient Overlays */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
            isHovered
              ? 'bg-gradient-to-t from-black/95 via-black/30 to-black/50'
              : 'bg-gradient-to-t from-black/90 via-black/25 to-black/40'
          }`}
        />

        {/* Top Header info */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/10 uppercase tracking-wider">
              {reel.category}
            </span>
            {isInstagram && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#bd1616] border border-[#9e1212] text-white text-[10px] font-bold tracking-wide shadow-xs">
                <Instagram className="w-3 h-3 text-white" />
                <span>Reel</span>
              </span>
            )}
            {isDirectVideo && isHovered && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#bd1616] text-white text-[10px] font-bold uppercase tracking-wider animate-pulse shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>Playing</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Sound Toggle Button during direct video preview */}
            {isDirectVideo && (
              <button
                type="button"
                onClick={toggleSound}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  toggleSound(e);
                }}
                className="flex items-center justify-center h-7 w-7 rounded-full bg-black/70 hover:bg-[#bd1616] hover:text-white text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-md touch-manipulation active:scale-90"
                title={isMuted ? 'Unmute preview' : 'Mute preview'}
                aria-label={isMuted ? 'Unmute preview' : 'Mute preview'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#ffc800]" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
              </button>
            )}

            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-medium text-white/90">
              <Eye className="w-3 h-3 text-white" />
              <span>{reel.views}</span>
            </span>
          </div>
        </div>

        {/* Center Overlay / Action Button */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center p-4 z-20 transition-all duration-300 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-90 scale-95'
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(reel);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white text-xs font-bold uppercase tracking-wider shadow-2xl shadow-black/80 border border-[#9e1212] transition-all hover:scale-105 active:scale-95 cursor-pointer group/btn"
            title="Watch video on website"
          >
            <Play className="w-3.5 h-3.5 fill-white text-white group-hover/btn:scale-110 transition-transform" />
            <span>PLAY REEL</span>
          </button>
        </div>

        {/* Live Video Scrub/Progress Bar when hovered for direct video */}
        {isDirectVideo && isHovered && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20 overflow-hidden">
            <div
              className="h-full bg-[#bd1616] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Bottom Information */}
        <div className="absolute bottom-3 left-3 right-3 text-left z-20">
          <div className="flex items-center gap-1 text-[10px] font-bold text-white uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-[#bd1616]" />
            <span>{reel.eventDate || (isInstagram ? 'Instagram Reel' : 'Same-Day Reel')}</span>
          </div>
          <h3 className="text-white text-sm sm:text-base font-bold leading-snug drop-shadow-md group-hover:text-[#bd1616] transition-colors">
            {reel.title}
          </h3>
          <p className="text-zinc-300 text-xs mt-0.5 line-clamp-1 drop-shadow-sm font-normal">
            {reel.client} &bull; {reel.duration}
          </p>

          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/80">
            <span className="text-white/90 font-semibold flex items-center gap-1">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Play className="w-2.5 h-2.5 fill-[#bd1616] text-[#bd1616]" />
                <span>Tap to play on website</span>
              </span>
            </span>
            <span className="font-mono">{reel.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
