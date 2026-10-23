import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from 'lucide-react';
import { getResponsiveImageSrcSet } from '../utils/imageUtils';
import {
  galleryImages,
  galleryFullImages,
  galleryItems,
} from '../config/galleryConfig';
import { useGalleryPreload } from '../hooks/useGalleryPreload';

interface PastEventGalleryCarouselProps {
  onBookClick?: (category?: string) => void;
}

const GALLERY_IMAGES = galleryImages;

interface GalleryImageCardProps {
  imgUrl: string;
  originalIndex: number;
  itemIndex: number;
  onOpenModal: (index: number) => void;
}

const GalleryImageCard: React.FC<GalleryImageCardProps> = ({
  imgUrl,
  originalIndex,
  itemIndex,
  onOpenModal,
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const item = galleryItems[originalIndex] || {
    id: `portfolio-${originalIndex + 1}`,
    thumb: imgUrl,
    full: imgUrl,
    fallback: imgUrl,
    alt: `Snap Shots portfolio showcase ${originalIndex + 1}`,
  };

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [imgUrl]);

  // Eager load and give high fetch priority to initial visible cards (first 6)
  const isPriority = itemIndex < 6;

  return (
    <div
      onClick={() => onOpenModal(originalIndex)}
      className="relative shrink-0 w-48 sm:w-64 md:w-72 aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-[#bd1616]/60 shadow-lg hover:shadow-2xl hover:shadow-[#bd1616]/10 transition-all duration-300 cursor-pointer group hover:scale-[1.03] select-none"
      style={{
        transform: 'translateZ(0)',
        contain: 'paint layout',
      }}
    >
      {/* Loading Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-800 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white/40 animate-spin opacity-60" />
        </div>
      )}

      {/* Main Image with responsive picture element */}
      {!hasError && (
        <picture className="w-full h-full block">
          {item.thumb?.endsWith('.webp') && (
            <source type="image/webp" srcSet={item.thumb} />
          )}
          <img
            ref={imgRef}
            src={item.thumb || item.fallback}
            srcSet={getResponsiveImageSrcSet(imgUrl, [320, 480, 640, 800])}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 280px, 320px"
            alt={item.alt || `Snap Shots portfolio showcase ${originalIndex + 1}`}
            loading={isPriority ? 'eager' : 'lazy'}
            fetchPriority={isPriority ? 'high' : 'auto'}
            decoding={isPriority ? 'sync' : 'async'}
            draggable={false}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ease-out group-hover:scale-108 pointer-events-none will-change-transform ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transform: 'translateZ(0)',
              imageRendering: 'auto',
            }}
          />
        </picture>
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
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState<boolean>(true);

  // Triple set enables completely seamless infinite wrapping in both directions
  const duplicatedImages = [...GALLERY_IMAGES, ...GALLERY_IMAGES, ...GALLERY_IMAGES];

  // Animation & Smooth Physics Drag Refs
  const isHoveredRef = useRef<boolean>(false);
  const isInteractingRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragScrollStartRef = useRef<number>(0);
  const dragDistanceRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const lastDragTimeRef = useRef<number>(0);
  const lastDragXRef = useRef<number>(0);
  const currentSpeedRef = useRef<number>(36); // gentle luxury auto-glide px/sec
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Intersection observer to pause calculations when off-screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '150px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Initialize scroll position to the middle set for fluid bidirectional scrolling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const initScroll = () => {
      if (container.scrollWidth > 0) {
        container.scrollLeft = container.scrollWidth / 3;
      }
    };
    initScroll();
    const timer = setTimeout(initScroll, 250);
    return () => clearTimeout(timer);
  }, []);

  // 60/120Hz Smooth Gliding Loop with continuous physics & momentum
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.08); // clamp frame delta
      lastTime = now;

      const container = scrollContainerRef.current;
      if (container && isInView && modalImageIndex === null) {
        const singleSetWidth = container.scrollWidth / 3;

        if (!isDraggingRef.current) {
          // Apply momentum fling decay
          if (Math.abs(velocityRef.current) > 1) {
            container.scrollLeft += velocityRef.current * dt;
            velocityRef.current *= Math.pow(0.88, dt * 60);
            if (Math.abs(velocityRef.current) < 1) {
              velocityRef.current = 0;
            }
          }

          // Smoothly ramp speed down when hovering/interacting, and back up when idle
          const targetSpeed =
            isHoveredRef.current || isInteractingRef.current ? 0 : 36;
          currentSpeedRef.current +=
            (targetSpeed - currentSpeedRef.current) * (targetSpeed === 0 ? 0.12 : 0.04);

          if (Math.abs(currentSpeedRef.current) > 0.05) {
            container.scrollLeft += currentSpeedRef.current * dt;
          }

          // Seamless loop boundary wrapping
          if (singleSetWidth > 0) {
            if (container.scrollLeft >= singleSetWidth * 2) {
              container.scrollLeft -= singleSetWidth;
            } else if (container.scrollLeft <= 10) {
              container.scrollLeft += singleSetWidth;
            }
          }
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isInView, modalImageIndex]);

  // Pointer drag events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    lastDragXRef.current = e.clientX;
    lastDragTimeRef.current = performance.now();
    velocityRef.current = 0;
    dragDistanceRef.current = 0;
    isInteractingRef.current = true;

    const container = scrollContainerRef.current;
    if (container) {
      dragScrollStartRef.current = container.scrollLeft;
    }
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const currentX = e.clientX;
    const delta = currentX - dragStartXRef.current;
    dragDistanceRef.current = Math.abs(delta);

    const container = scrollContainerRef.current;
    if (container) {
      container.scrollLeft = dragScrollStartRef.current - delta;

      // Handle wrapping during active drag
      const singleSetWidth = container.scrollWidth / 3;
      if (singleSetWidth > 0) {
        if (container.scrollLeft >= singleSetWidth * 2) {
          container.scrollLeft -= singleSetWidth;
          dragScrollStartRef.current -= singleSetWidth;
        } else if (container.scrollLeft <= 10) {
          container.scrollLeft += singleSetWidth;
          dragScrollStartRef.current += singleSetWidth;
        }
      }
    }

    const now = performance.now();
    const dt = (now - lastDragTimeRef.current) / 1000;
    if (dt > 0.005) {
      velocityRef.current = -(currentX - lastDragXRef.current) / dt;
      lastDragXRef.current = currentX;
      lastDragTimeRef.current = now;
    }
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 1800);
  };

  // Wheel horizontal scrolling support
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) > 0 || e.shiftKey) {
      isInteractingRef.current = true;
      if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
      interactionTimeoutRef.current = setTimeout(() => {
        isInteractingRef.current = false;
      }, 1600);
    }
  };

  // Smooth scroll directional nudge
  const handleSmoothScrollBy = (offset: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    isInteractingRef.current = true;
    container.scrollBy({ left: offset, behavior: 'smooth' });

    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 2200);
  };

  // Safe card click (ignores drag releases)
  const handleCardClick = (index: number) => {
    if (dragDistanceRef.current > 7) return;
    setModalImageIndex(index);
  };

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

  // Hook to automatically preload upcoming gallery images when nearing the viewport boundary
  const { sentinelRef, preloadSurrounding } = useGalleryPreload({
    containerRef: scrollContainerRef,
    images: GALLERY_IMAGES,
    thresholdPx: 800,
    thresholdRatio: 0.65,
    batchSize: 4,
    direction: 'horizontal',
    loop: true,
  });

  // Preload adjacent images when a user opens the lightbox modal
  useEffect(() => {
    if (modalImageIndex !== null) {
      preloadSurrounding(modalImageIndex, 2);
      const nextIdx = (modalImageIndex + 1) % galleryFullImages.length;
      const prevIdx = (modalImageIndex - 1 + galleryFullImages.length) % galleryFullImages.length;
      const targetFulls = [galleryFullImages[modalImageIndex], galleryFullImages[nextIdx], galleryFullImages[prevIdx]].filter(Boolean);
      targetFulls.forEach((src) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = src;
      });
    }
  }, [modalImageIndex, preloadSurrounding]);

  return (
    <section
      id="past-work"
      ref={sectionRef}
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
          Candid celebrations, authentic emotions, and signature shots captured by our certified creators. Drag or use arrows to explore.
        </p>
      </div>

      <div className="relative w-full max-w-[100vw] overflow-hidden group/scroller">
        {/* Left & Right Cinematic Vignette Fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 md:w-36 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 md:w-36 bg-gradient-to-l from-black via-black/80 to-transparent z-10" />

        {/* Smooth Scroll Navigation Arrows (Brand red #bd1616 hover/active) */}
        <button
          type="button"
          onClick={() => handleSmoothScrollBy(-360)}
          aria-label="Scroll gallery left"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/80 hover:bg-[#bd1616] active:bg-[#750d0d] text-white flex items-center justify-center border border-white/20 backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 group/arrow focus:outline-hidden focus:ring-2 focus:ring-[#bd1616]"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover/arrow:-translate-x-0.5" />
        </button>

        <button
          type="button"
          onClick={() => handleSmoothScrollBy(360)}
          aria-label="Scroll gallery right"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/80 hover:bg-[#bd1616] active:bg-[#750d0d] text-white flex items-center justify-center border border-white/20 backdrop-blur-md shadow-xl transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 group/arrow focus:outline-hidden focus:ring-2 focus:ring-[#bd1616]"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover/arrow:translate-x-0.5" />
        </button>

        {/* Continuous Smooth Scrolling Track (Target Selected Element) */}
        <div
          ref={scrollContainerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onMouseEnter={() => {
            isHoveredRef.current = true;
          }}
          onMouseLeave={() => {
            isHoveredRef.current = false;
            handlePointerUp();
          }}
          onWheel={handleWheel}
          className="relative overflow-x-auto no-scrollbar py-2 cursor-grab active:cursor-grabbing will-change-scroll select-none"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y',
            overscrollBehaviorX: 'contain',
            contentVisibility: 'auto',
            containIntrinsicSize: '340px 100vw',
            transform: 'translateZ(0)',
          }}
        >
          <div className="flex items-center gap-3 sm:gap-5 w-max px-4">
            {duplicatedImages.map((imgUrl, idx) => {
              const originalIndex = idx % GALLERY_IMAGES.length;
              return (
                <GalleryImageCard
                  key={`${imgUrl}-${idx}`}
                  imgUrl={imgUrl}
                  originalIndex={originalIndex}
                  itemIndex={idx}
                  onOpenModal={handleCardClick}
                />
              );
            })}
            {/* Viewport Boundary Sentinel for Native Intersection Preloading */}
            <div
              ref={sentinelRef}
              className="w-1 h-full shrink-0 pointer-events-none opacity-0"
              aria-hidden="true"
            />
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

            {/* Modal Image with high-speed picture element */}
            <div className="flex flex-col items-center max-w-full">
              <picture className="max-h-[80vh] max-w-full flex items-center justify-center">
                {(galleryFullImages[modalImageIndex] || GALLERY_IMAGES[modalImageIndex])?.endsWith('.webp') && (
                  <source
                    type="image/webp"
                    srcSet={galleryFullImages[modalImageIndex] || GALLERY_IMAGES[modalImageIndex]}
                  />
                )}
                <img
                  src={galleryFullImages[modalImageIndex] || galleryItems[modalImageIndex]?.full || galleryItems[modalImageIndex]?.fallback || GALLERY_IMAGES[modalImageIndex]}
                  alt={`Enlarged portfolio showcase ${modalImageIndex + 1}`}
                  loading="eager"
                  fetchPriority="high"
                  decoding="sync"
                  className="max-h-[80vh] max-w-full rounded-xl sm:rounded-2xl object-contain shadow-2xl border border-zinc-800"
                />
              </picture>
              <div className="mt-3 px-3 py-1 rounded-full bg-black/70 border border-white/10 text-xs text-zinc-300 font-medium tracking-wide">
                Photo {modalImageIndex + 1} of {GALLERY_IMAGES.length}
              </div>
            </div>

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
