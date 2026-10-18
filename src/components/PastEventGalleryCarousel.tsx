import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from 'lucide-react';
import { getResponsiveImageSrcSet } from '../utils/imageUtils';

interface PastEventGalleryCarouselProps {
  onBookClick?: (category?: string) => void;
}

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop',
];

interface GalleryImageCardProps {
  imgUrl: string;
  originalIndex: number;
  onOpenModal: (index: number) => void;
}

const GalleryImageCard: React.FC<GalleryImageCardProps> = ({
  imgUrl,
  originalIndex,
  onOpenModal,
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  return (
    <div
      onClick={() => onOpenModal(originalIndex)}
      className="relative shrink-0 w-48 sm:w-64 md:w-72 aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-[#bd1616]/60 shadow-lg hover:shadow-2xl hover:shadow-[#bd1616]/10 transition-all duration-300 cursor-pointer group hover:scale-[1.03] select-none"
    >
      {/* Loading Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-800 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white/40 animate-spin opacity-60" />
        </div>
      )}

      {/* Main Image */}
      {!hasError && (
        <img
          src={imgUrl}
          srcSet={getResponsiveImageSrcSet(imgUrl, [320, 480, 640, 800])}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 280px, 320px"
          alt="Snap Shots past event capture"
          loading="lazy"
          decoding="async"
          draggable={false}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-108 pointer-events-none ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-zinc-950 flex items-center justify-center text-zinc-600 text-xs">
          Preview unavailable
        </div>
      )}

      {/* Subtle Aesthetic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15 opacity-50 group-hover:opacity-20 transition-opacity pointer-events-none" />

      {/* Expand Icon Button */}
      <div
        className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/70 group-hover:bg-[#bd1616] active:bg-[#750d0d] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-md cursor-pointer group-hover:scale-105"
        aria-hidden="true"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};

export const PastEventGalleryCarousel: React.FC<PastEventGalleryCarouselProps> = () => {
  const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
  const [isUserHovering, setIsUserHovering] = useState<boolean>(false);

  // Duplicated list to create infinite seamless loop without jump
  const duplicatedImages = [...GALLERY_IMAGES, ...GALLERY_IMAGES];

  // Modal navigation
  const handleModalPrev = useCallback(() => {
    setModalImageIndex((prev) =>
      prev !== null ? (prev > 0 ? prev - 1 : GALLERY_IMAGES.length - 1) : null
    );
  }, []);

  const handleModalNext = useCallback(() => {
    setModalImageIndex((prev) =>
      prev !== null ? (prev < GALLERY_IMAGES.length - 1 ? prev + 1 : 0) : null
    );
  }, []);

  // Modal key listeners
  useEffect(() => {
    if (modalImageIndex === null) return;
    const handleModalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalImageIndex(null);
      if (e.key === 'ArrowLeft') handleModalPrev();
      if (e.key === 'ArrowRight') handleModalNext();
    };
    window.addEventListener('keydown', handleModalKeyDown);
    return () => window.removeEventListener('keydown', handleModalKeyDown);
  }, [modalImageIndex, handleModalPrev, handleModalNext]);

  const shouldPauseAnimation = isUserHovering || modalImageIndex !== null;

  return (
    <section
      id="past-work"
      className="relative py-8 sm:py-14 bg-transparent overflow-hidden select-none"
      aria-label="Wall of Snap Shots continuous image gallery"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto px-4 mb-6 sm:mb-8">
        <div className="flex justify-center mb-3.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#bd1616]/15 border border-[#bd1616]/30 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-[#bd1616] animate-ping" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#bd1616]">
              CURATED GALLERY
            </span>
          </div>
        </div>
        <h2
          className="mt-1 text-center text-white font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight"
          id="past-work-title"
        >
          Wall of Snap Shots
        </h2>
        <p className="mt-2.5 text-center text-zinc-400 font-normal text-xs sm:text-sm max-w-lg mx-auto">
          Candid celebrations, authentic emotions, and signature shots captured by our certified creators.
        </p>
      </div>

      <div className="relative w-full max-w-[100vw] overflow-hidden">
        {/* Left & Right Cinematic Vignette Fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 md:w-36 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 md:w-36 bg-gradient-to-l from-black via-black/80 to-transparent z-10" />

        {/* Continuous Scrolling Track (Marquee / Infinite Loop) */}
        <div
          className="relative overflow-hidden py-2"
          onMouseEnter={() => setIsUserHovering(true)}
          onMouseLeave={() => setIsUserHovering(false)}
          onTouchStart={() => setIsUserHovering(true)}
          onTouchEnd={() => setIsUserHovering(false)}
        >
          <div
            className="animate-gallery-continuous flex items-center gap-3 sm:gap-5"
            style={{
              animationPlayState: shouldPauseAnimation ? 'paused' : 'running',
            }}
          >
            {duplicatedImages.map((imgUrl, idx) => {
              const originalIndex = idx % GALLERY_IMAGES.length;
              return (
                <GalleryImageCard
                  key={`${imgUrl}-${idx}`}
                  imgUrl={imgUrl}
                  originalIndex={originalIndex}
                  onOpenModal={(i) => setModalImageIndex(i)}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox Modal (High-Resolution Preview with Prev/Next Navigation) */}
      {modalImageIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-md animate-fade-in"
          onClick={() => setModalImageIndex(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setModalImageIndex(null)}
              className="absolute -top-12 right-0 sm:top-2 sm:right-2 z-30 w-10 h-10 rounded-full bg-black/80 hover:bg-[#bd1616] active:bg-[#750d0d] text-white flex items-center justify-center border border-white/20 transition cursor-pointer shadow-lg"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Prev Button */}
            <button
              type="button"
              onClick={handleModalPrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-[#bd1616] active:bg-[#750d0d] text-white flex items-center justify-center border border-white/20 transition cursor-pointer shadow-lg hover:scale-105"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <img
              src={GALLERY_IMAGES[modalImageIndex]}
              alt="Enlarged past work event photograph"
              className="max-h-[85vh] max-w-full rounded-xl sm:rounded-2xl object-contain shadow-2xl border border-zinc-800"
            />

            {/* Modal Next Button */}
            <button
              type="button"
              onClick={handleModalNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-[#bd1616] active:bg-[#750d0d] text-white flex items-center justify-center border border-white/20 transition cursor-pointer shadow-lg hover:scale-105"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
