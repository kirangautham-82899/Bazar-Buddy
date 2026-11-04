// Reusable motion primitives. All of them respect the OS "reduce motion"
// setting through <MotionConfig reducedMotion="user"> in App.jsx.
import React, { useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import './motion.css';

const EASE_OUT = [0.22, 1, 0.36, 1];

// Fades and lifts content in the first time it scrolls into view.
export const Reveal = ({ children, delay = 0, y = 24, as = 'div', className, ...rest }) => {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

const staggerParent = (stagger, delay) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE_OUT } },
};

// Children using `variants={staggerItem}` animate in one after another.
export const Stagger = ({ children, as = 'div', stagger = 0.08, delay = 0, inView = false, className, ...rest }) => {
  const Tag = motion[as];
  const trigger = inView
    ? { whileInView: 'show', viewport: { once: true, margin: '-60px' } }
    : { animate: 'show' };
  return (
    <Tag className={className} variants={staggerParent(stagger, delay)} initial="hidden" {...trigger} {...rest}>
      {children}
    </Tag>
  );
};

// Headline that rises in word by word from behind a mask.
export const WordReveal = ({ text, as = 'h1', className, delay = 0 }) => {
  const Tag = motion[as];
  const words = text.split(' ');
  return (
    <Tag className={className} aria-label={text} initial="hidden" animate="show" variants={staggerParent(0.07, delay)}>
      {words.map((word, i) => (
        // The space must sit outside the inline-block mask or the browser drops it.
        <React.Fragment key={`${word}-${i}`}>
          <span className="word-mask" aria-hidden="true">
            <motion.span
              className="word"
              variants={{
                hidden: { y: '110%', rotate: 4 },
                show: { y: '0%', rotate: 0, transition: { duration: 0.8, ease: EASE_OUT } },
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </Tag>
  );
};

// Pulls slightly toward the pointer, then springs back.
export const Magnetic = ({ children, strength = 0.3, className }) => {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 250, damping: 18 });
  const y = useSpring(0, { stiffness: 250, damping: 18 });

  const onMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span ref={ref} className={`magnetic ${className || ''}`} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.span>
  );
};

// Drifting gradient blobs plus a faint grid, drawn entirely in CSS.
export const Aurora = ({ variant = 'light' }) => (
  <div className={`aurora aurora-${variant}`} aria-hidden="true">
    <span className="aurora-blob blob-1" />
    <span className="aurora-blob blob-2" />
    <span className="aurora-blob blob-3" />
    <span className="aurora-grid" />
  </div>
);

// Circle and tick that draw themselves.
export const SuccessCheck = ({ size = 88 }) => (
  <motion.svg width={size} height={size} viewBox="0 0 52 52" className="success-check" initial="hidden" animate="show" aria-hidden="true">
    <motion.circle
      cx="26"
      cy="26"
      r="24"
      fill="none"
      strokeWidth="3"
      variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } } }}
    />
    <motion.path
      d="M15 27 l7 7 l15 -16"
      fill="none"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.4, delay: 0.5, ease: 'easeOut' } } }}
    />
  </motion.svg>
);

const CONFETTI_COLORS = ['#7cb867', '#c2523b', '#eebf55', '#3d6b33', '#f0a07a'];

// A short burst of CSS shapes; nothing renders when motion is reduced.
export const Confetti = ({ count = 26 }) => {
  const reduce = useReducedMotion();
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 320,
      y: -(80 + Math.random() * 160),
      rotate: Math.random() * 540 - 270,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      round: i % 3 === 0,
      delay: Math.random() * 0.15,
    }))
  );
  if (reduce) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className={`confetti-piece ${p.round ? 'round' : ''}`}
          style={{ background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 260], opacity: [1, 1, 0], rotate: p.rotate, scale: 1 }}
          transition={{ duration: 1.6, delay: p.delay, ease: 'easeOut', times: [0, 0.35, 1] }}
        />
      ))}
    </div>
  );
};

// Loading placeholder with a shimmer sweep.
export const Skeleton = ({ lines = 3 }) => (
  <div className="skeleton-group" role="status" aria-busy="true">
    {Array.from({ length: lines }, (_, i) => (
      <span key={i} className="skeleton" style={{ width: `${92 - i * 14}%` }} />
    ))}
  </div>
);
