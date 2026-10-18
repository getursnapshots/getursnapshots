import React, { useEffect, useState, useRef, useCallback } from 'react';

interface AnimatedPriceCountdownProps {
  startPrice: number;
  targetPrice: number;
  currencySymbol: string;
  currencyCode?: string;
  duration?: number;
  className?: string;
  countDirection?: 'down' | 'up';
  triggerKey?: number;
}

export const AnimatedPriceCountdown: React.FC<AnimatedPriceCountdownProps> = ({
  startPrice,
  targetPrice,
  currencySymbol,
  currencyCode = 'INR',
  duration = 1600,
  className = '',
  countDirection = 'down',
  triggerKey = 0,
}) => {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const [isInView, setIsInView] = useState<boolean>(false);
  const [displayValue, setDisplayValue] = useState<number>(() =>
    countDirection === 'down' ? startPrice : 0
  );
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [hasLanded, setHasLanded] = useState<boolean>(false);
  const [manualCountTrigger, setManualCountTrigger] = useState<number>(0);

  // Trigger counting when scrolled into viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const runCountAnimation = useCallback(() => {
    let animationFrameId: number;
    let startTime: number | null = null;
    setIsCounting(true);
    setHasLanded(false);

    const fromVal = countDirection === 'down' ? startPrice : 0;
    const toVal = targetPrice;
    const totalDiff = toVal - fromVal;

    setDisplayValue(fromVal);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth cubic ease-out for realistic counter deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(fromVal + totalDiff * easeOut);

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(toVal);
        setIsCounting(false);
        setHasLanded(true);
        setTimeout(() => setHasLanded(false), 1200);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [countDirection, startPrice, targetPrice, duration]);

  useEffect(() => {
    if (!isInView) return;
    const cleanup = runCountAnimation();
    return () => {
      if (cleanup) cleanup();
    };
  }, [isInView, runCountAnimation, triggerKey, manualCountTrigger]);

  const handleManualReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setManualCountTrigger((prev) => prev + 1);
  };

  const formattedNumber =
    currencyCode === 'INR'
      ? displayValue.toLocaleString('en-IN')
      : displayValue.toLocaleString('en-US');

  return (
    <span
      ref={containerRef}
      onClick={handleManualReplay}
      className={`inline-flex items-baseline font-black tracking-tight select-none cursor-pointer group transition-all duration-300 ${className}`}
      title="Click to replay counting animation"
    >
      {/* Currency Symbol */}
      <span className="text-2xl sm:text-3xl font-extrabold mr-0.5 text-zinc-200 group-hover:text-white transition-colors">
        {currencySymbol}
      </span>

      {/* Animated Counting Number Element (Target of CSS Selector) */}
      <span
        className={`tabular-nums font-black tracking-tight inline-block transition-transform duration-100 ${
          isCounting
            ? 'text-white scale-105 text-shadow-glow'
            : hasLanded
            ? 'text-white scale-100'
            : 'text-white'
        }`}
        style={{
          fontVariantNumeric: 'tabular-nums',
          textShadow: isCounting
            ? '0 0 16px rgba(255, 200, 0, 0.6), 0 0 24px rgba(189, 22, 22, 0.5)'
            : hasLanded
            ? '0 0 14px rgba(189, 22, 22, 0.5)'
            : 'none',
        }}
      >
        {formattedNumber}
      </span>

      {/* Counting Indicator */}
      {isCounting && (
        <span
          className="ml-1.5 inline-flex items-center text-[10px] font-extrabold uppercase tracking-widest text-[#ffc800] animate-pulse"
          title="Counting..."
        >
          {countDirection === 'down' ? '▼' : '▲'}
        </span>
      )}
    </span>
  );
};
