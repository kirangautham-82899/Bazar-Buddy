// Reusable motion primitives. All of them respect the OS "reduce motion"
// setting through <MotionConfig reducedMotion="user"> in App.jsx.
import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './motion.css';

const EASE_OUT = [0.22, 1, 0.36, 1];

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

const CONFETTI_COLORS = ['#2fb36a', '#e8553d', '#f4b12e', '#157a43', '#ff8a5b'];

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
