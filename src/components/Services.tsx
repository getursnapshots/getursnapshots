import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { ServiceItem } from '../types';
import { getResponsiveImageSrcSet } from '../utils/imageUtils';

interface ServicesProps {
  onBookService: (serviceTitle: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onBookService }) => {
  const [filter, setFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'scroll' | 'grid'>('scroll');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const categories = ['All', 'Events', 'Weddings', 'Private', 'Corporate', 'E-Commerce', 'Branding', 'Stills'];

  const filteredServices =
    filter === 'All'
      ? siteConfig.services
      : siteConfig.services.filter((s) => s.category === filter);

  // Check scroll positions and update progress
  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)));
      // Approximate card index
      const cardWidth = 360;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(filteredServices.length - 1, Math.max(0, index)));
    } else {
      setScrollProgress(0);
      setActiveIndex(0);
    }
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollState, { passive: true });
      window.addEventListener('resize', updateScrollState);
    }
    return () => {
      if (el) el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [filteredServices.length, viewMode]);

  // Reset scroll on category filter change
  const handleFilterChange = (cat: string) => {
    setFilter(cat);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  // Scroll by direction
  const scrollByDirection = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardStep = Math.min(container.clientWidth * 0.8, 380);
    container.scrollBy({
      left: direction === 'left' ? -cardStep : cardStep,
      behavior: 'smooth',
    });
  };

  // Drag to scroll functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current || viewMode !== 'scroll') return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current || viewMode !== 'scroll') return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  return (
    <section id="services" className="bg-transparent py-10 sm:py-14 relative overflow-visible">
      {/* Background ambient accents */}
      <div
        className="absolute pointer-events-none -bottom-20 -left-20 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(189, 22, 22, 0.15) 0%, transparent 70%)',
          filter: 'blur(90px)',
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="uppercase text-[#bd1616] font-bold text-xs sm:text-sm tracking-widest">OUR SERVICES</p>
          <h2
            className="mt-2 text-center text-white font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight"
            id="services-title"
          >
            Crafted to Elevate Every Moment
          </h2>
          <p className="mt-3 text-center text-zinc-300 font-normal text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Specialized vertical video production, editorial photography, and creative storytelling across 9 dedicated categories.
          </p>

          {/* Category tabs - Smooth swipe track on mobile, wrapped on desktop */}
          <div className="mt-8 flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar py-1 px-2 -mx-4 sm:mx-0 sm:px-0 sm:flex-wrap gap-2 touch-pan-y sm:touch-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleFilterChange(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer shrink-0 ${
                  filter === cat
                    ? 'bg-[#bd1616] text-white shadow-md shadow-[#bd1616]/30 font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Scrolling Effect & Layout Controls */}
          <div className="mt-6 flex items-center justify-between max-w-6xl mx-auto px-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <span className="inline-block w-2 h-2 rounded-full bg-[#bd1616] animate-pulse" />
              <span>{filteredServices.length} Specialized Services Available</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Directional Scroll Arrows */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scrollByDirection('left')}
                    disabled={!canScrollLeft}
                    className={`h-9 w-9 flex items-center justify-center rounded-full border transition-all cursor-pointer ${
                      canScrollLeft
                        ? 'bg-zinc-900 hover:bg-[#bd1616] hover:text-white hover:border-[#bd1616] border-zinc-800 text-zinc-300 shadow-sm'
                        : 'bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed'
                    }`}
                    aria-label="Scroll services left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollByDirection('right')}
                    disabled={!canScrollRight}
                    className={`h-9 w-9 flex items-center justify-center rounded-full border transition-all cursor-pointer ${
                      canScrollRight
                        ? 'bg-[#bd1616] hover:bg-[#9e1212] text-white border-[#9e1212] shadow-sm hover:scale-105 active:scale-95'
                        : 'bg-zinc-950 border-zinc-900 text-zinc-600 cursor-not-allowed'
                    }`}
                    aria-label="Scroll services right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
            </div>
          </div>
        </div>

        {/* Services Cards Container with Scrolling Effect */}
        <div className="relative mt-8 max-w-6xl mx-auto">
          {/* Edge Fade Gradients for smooth horizontal scroll indicator */}
          {viewMode === 'scroll' && canScrollLeft && (
            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none z-20 transition-opacity" />
          )}
          {viewMode === 'scroll' && canScrollRight && (
            <div className="hidden md:block absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none z-20 transition-opacity" />
          )}

          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={
              viewMode === 'scroll'
                ? 'flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-4 px-2 sm:px-4 cursor-grab active:cursor-grabbing touch-pan-y sm:touch-auto'
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'
            }
            id="services-scroll-container"
          >
            {filteredServices.map((service: ServiceItem, idx: number) => (
              <div
                key={service.id}
                className={`group relative rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-[#bd1616]/70 overflow-hidden shadow-lg shadow-black/40 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between select-none ${
                  viewMode === 'scroll'
                    ? 'w-[84vw] max-w-[340px] sm:w-[350px] md:w-[370px] shrink-0 snap-start'
                    : 'w-full'
                }`}
                id={`service-card-${service.id}`}
              >
                <div>
                  {/* Image Banner */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-zinc-900">
                    <img
                      src={service.image}
                      srcSet={getResponsiveImageSrcSet(service.image, [360, 540, 720, 960])}
                      sizes="(max-width: 640px) 88vw, (max-width: 1024px) 350px, 370px"
                      width={370}
                      height={208}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/35 to-transparent" />

                    {/* Category Pill */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                        {service.category}
                      </span>
                    </div>

                    {/* Badge / Number */}
                    <div className="absolute top-3 right-3">
                      <span className="h-6 px-2 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-medium text-white/90 flex items-center justify-center">
                        0{idx + 1}
                      </span>
                    </div>

                    {/* Title on image */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-xl font-extrabold tracking-tight drop-shadow-md">
                        {service.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-5 sm:p-6">
                    <p className="text-xs font-semibold text-[#bd1616] leading-snug">
                      {service.tagline}
                    </p>
                    <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-3">
                      {service.description}
                    </p>

                    {/* Key Deliverables list */}
                    <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                        Deliverables Included
                      </span>
                      {service.deliverables.map((item, dIdx) => (
                        <div key={dIdx} className="flex items-center gap-2 text-xs text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-[#bd1616] flex-shrink-0" />
                          <span className="line-clamp-1">{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {service.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-medium text-zinc-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="p-5 sm:p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => onBookService(service.title)}
                    className="w-full h-10 rounded-full bg-[#bd1616] hover:bg-[#9e1212] active:bg-[#750d0d] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-lg hover:shadow-[#bd1616]/30"
                  >
                    <span>BOOK THIS SERVICE</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Progress Bar & Indicators (Scroll Mode Only) */}
          {viewMode === 'scroll' && filteredServices.length > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
              {/* Visual Progress Track */}
              <div className="w-full sm:w-64 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#bd1616] rounded-full transition-all duration-150"
                  style={{ width: `${Math.max(12, scrollProgress)}%` }}
                />
              </div>

              {/* Dot Indicators */}
              <div className="flex items-center gap-1.5">
                {filteredServices.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (!scrollRef.current) return;
                      const cardWidth = 370;
                      scrollRef.current.scrollTo({ left: i * cardWidth, behavior: 'smooth' });
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeIndex === i ? 'w-5 bg-[#bd1616]' : 'w-1.5 bg-zinc-800 hover:bg-zinc-700'
                    }`}
                    aria-label={`Go to service ${i + 1}`}
                  />
                ))}
              </div>

              {/* Drag/Swipe Hint */}
              <p className="text-[11px] text-zinc-500 font-medium hidden sm:block">
                Drag or use arrows to scroll through all services
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

