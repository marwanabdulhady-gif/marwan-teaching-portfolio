import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useLocale } from '../LocaleContext';

type From = 'bottom' | 'start' | 'end';

interface RevealProps {
  children: ReactNode;
  /** Seconds of stagger. */
  delay?: number;
  from?: From;
  className?: string;
}

/**
 * Scroll-triggered entrance. `start` / `end` are logical directions, so the
 * same call sites animate from the correct side in both LTR and RTL.
 */
export default function Reveal({ children, delay = 0, from = 'bottom', className }: RevealProps) {
  const { isRtl } = useLocale();

  const offset = (() => {
    if (from === 'bottom') return { x: 0, y: 34 };
    // Logical start = left in LTR, right in RTL.
    const magnitude = 34;
    return { x: isRtl ? magnitude : -magnitude, y: 0 };
  })();

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-90px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
