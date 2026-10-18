import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';

export const OfferCountdownTimer: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const now = Date.now();
    const storageKey = 'snapshot_offer_countdown_24h';
    const storedEnd = sessionStorage.getItem(storageKey);
    let target = storedEnd ? parseInt(storedEnd, 10) : 0;

    // Reset to a rolling 24-hour window if expired, absent, or less than 12 hours remaining
    if (!target || target <= now || target - now < 12 * 3600 * 1000) {
      target = now + (23 * 3600 + 59 * 60 + 59) * 1000;
      sessionStorage.setItem(storageKey, target.toString());
    }

    const updateTimer = () => {
      const remaining = Math.max(0, target - Date.now());
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });

      if (remaining <= 0) {
        const nextTarget = Date.now() + 24 * 3600 * 1000;
        sessionStorage.setItem(storageKey, nextTarget.toString());
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-[#bd1616]/40 shadow-md ${className}`}
      id="pricing-offer-countdown"
    >
      <div className="flex items-center gap-1.5 text-[#ffc800] text-xs font-bold uppercase tracking-wider">
        <Flame className="w-3.5 h-3.5 fill-[#ffc800] text-[#ffc800] animate-pulse" />
        <span>Price Drop Offer Ends In:</span>
      </div>

      <div className="flex items-center gap-1 font-mono font-bold text-xs tabular-nums text-white">
        <span className="bg-black/60 px-1.5 py-0.5 rounded border border-zinc-800 text-white">
          {pad(timeLeft.hours)}h
        </span>
        <span className="text-[#bd1616] font-black animate-pulse">:</span>
        <span className="bg-black/60 px-1.5 py-0.5 rounded border border-zinc-800 text-white">
          {pad(timeLeft.minutes)}m
        </span>
        <span className="text-[#bd1616] font-black animate-pulse">:</span>
        <span className="bg-black/60 px-1.5 py-0.5 rounded border border-zinc-800 text-[#ffc800]">
          {pad(timeLeft.seconds)}s
        </span>
      </div>
    </div>
  );
};
