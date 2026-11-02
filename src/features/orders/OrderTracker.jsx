import React from 'react';
import { motion } from 'framer-motion';
import { t } from '../../content/strings';
import { STAGES, STATUS_LABEL_KEYS } from '../../utils/orderStatus';

// Five steps joined by a bar that fills up to the current status.
const OrderTracker = ({ status }) => {
  const current = STAGES.indexOf(status);
  return (
    <div className="tracker" aria-label={t('trackingLabel')}>
      <div className="tracker-bar" aria-hidden="true">
        <motion.span
          className="tracker-bar-fill"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: Math.max(0, current) / (STAGES.length - 1) }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <ol className="tracker-steps">
        {STAGES.map((s, i) => (
          <li key={s} className={`${i <= current ? 'done' : ''} ${i === current ? 'current' : ''}`} aria-current={i === current ? 'step' : undefined}>
            <span className="tracker-dot" aria-hidden="true" />
            <span className="tracker-label">{t(STATUS_LABEL_KEYS[s])}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default OrderTracker;
