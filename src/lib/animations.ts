import { Variants } from "framer-motion";

// Page transitions
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

// Fade in with scale
export const fadeInScale: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, scale: 0.95 },
};

// Staggered container for children
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Staggered item (slides in from right)
export const staggerItem: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

// Option card variants (hover, tap, selected states)
export const optionVariants: Variants = {
  rest: {
    scale: 1,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
  selected: {
    scale: 1,
    boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.3)",
    transition: { duration: 0.2 },
  },
};

// Results bar animation (race from 0 to percentage)
export const barVariants: Variants = {
  initial: { width: 0, opacity: 0 },
  animate: (percentage: number) => ({
    width: `${percentage}%`,
    opacity: 1,
    transition: {
      width: { duration: 1, ease: "easeOut", delay: 0.3 },
      opacity: { duration: 0.3 },
    },
  }),
};

// Checkmark draw animation
export const checkmarkVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.4, ease: "easeInOut" },
      opacity: { duration: 0.2 },
    },
  },
};

// Welcome screen typewriter effect (for text reveal)
export const typewriterContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.5,
    },
  },
};

export const typewriterLetter: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.1 },
  },
};

// Logo bounce animation
export const logoVariants: Variants = {
  initial: { y: -50, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      delay: 0.2,
    },
  },
};

// Pulse animation for CTA button
export const pulseVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Confetti burst (for thank you screen trigger)
export const celebrationVariants: Variants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10,
    },
  },
};

// Progress bar variants
export const progressVariants: Variants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: { duration: 0.5, ease: "easeOut" },
  }),
};

// Slide up with fade
export const slideUpFade: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
};

// Number counter animation helper
export const springConfig = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
};

// Ripple effect coordinates type
export interface RippleEffect {
  x: number;
  y: number;
  id: number;
}

// Success state animation
export const successVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

// Card flip animation
export const cardFlipVariants: Variants = {
  front: {
    rotateY: 0,
    transition: { duration: 0.4 },
  },
  back: {
    rotateY: 180,
    transition: { duration: 0.4 },
  },
};

// Shake animation (for errors)
export const shakeVariants: Variants = {
  initial: { x: 0 },
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  },
};
