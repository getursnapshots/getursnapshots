import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface AnimatedStatCounterProps {
  value: string;
  duration?: number;
  className?: string;
  triggerKey?: number;
}

export const AnimatedStatCounter: React.FC<AnimatedStatCounterProps> = ({
  value,
  duration = 2000,
  className = '',
  triggerKey = 0,
}) => {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  // Detects when the number enters the user's viewport (animates once, stays stable)
  const isInView = useInView(containerRef, { amount: 0.15, once: true });

  // Parse raw value string: e.g. "5,000+" -> target: 5000, prefix: "", suffix: "+", decimals: 0
  // "4.9★" -> target: 4.9, prefix: "", suffix: "★", decimals: 1
  // "24h" -> target: 24, prefix: "", suffix: "h", decimals: 0
  const parsed = React.useMemo(() => {
    const match = value.match(/^([^0-9.]*)([0-9,]+(?:\.[0-9]+)?)(.*)$/);
    if (!match) {
      return { prefix: '', target: 0, suffix: value, decimals: 0, hasCommas: false };
    }
    const prefix = match[1] || '';
    const numStr = match[2];
    const suffix = match[3] || '';
    const hasCommas = numStr.includes(',');
    const cleanNumStr = numStr.replace(/,/g, '');
    const target = parseFloat(cleanNumStr) || 0;
    const decimalParts = cleanNumStr.split('.');
    const decimals = decimalParts.length > 1 ? decimalParts[1].length : 0;
    return { prefix, target, suffix, decimals, hasCommas };
  }, [value]);

  const [displayNum, setDisplayNum] = useState<number>(0);

  // Animate count-up whenever visible in viewport or triggered
  useEffect(() => {
    if (!isInView) {
      setDisplayNum(0);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const startVal = 0;
    const endVal = parsed.target;
    const diff = endVal - startVal;

    setDisplayNum(0);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out cubic for realistic, satisfying counting up
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const val = startVal + diff * easeOut;

      setDisplayNum(val);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayNum(endVal);
      }
    };

    // Tiny 100ms delay so user catches the animation starting from 0
    const timer = setTimeout(() => {
      animationFrameId = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isInView, triggerKey, parsed.target, duration]);

  // Format display string
  const formatDisplay = () => {
    if (parsed.decimals > 0) {
      return `${parsed.prefix}${displayNum.toFixed(parsed.decimals)}${parsed.suffix}`;
    }

    const rounded = Math.round(displayNum);
    const formattedNum = parsed.hasCommas ? rounded.toLocaleString('en-US') : rounded.toString();
    return `${parsed.prefix}${formattedNum}${parsed.suffix}`;
  };

  return (
    <span ref={containerRef} className={className}>
      {formatDisplay()}
    </span>
  );
};
