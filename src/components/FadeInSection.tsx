import React, { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface FadeInSectionProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  id?: string;
  duration?: number;
  yOffset?: number;
}

/**
 * Reusable subtle scroll entrance animation component using Framer Motion.
 * Fades in sections gently when scrolled into view without abrupt jumping or layout shift.
 */
export const FadeInSection: React.FC<FadeInSectionProps> = ({
  children,
  delay = 0,
  className = '',
  id,
  duration = 0.65,
  yOffset = 28,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -70px 0px', amount: 0.08 }}
      transition={{
        duration,
        ease: [0.22, 1, 0.36, 1], // Smooth cubic-bezier for subtle premium feel
        delay,
      }}
      style={{ willChange: 'opacity, transform' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
