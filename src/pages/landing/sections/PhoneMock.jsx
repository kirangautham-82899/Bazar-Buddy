import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FaMicrophone, FaSearch } from 'react-icons/fa';
import { t } from '../../../content/strings';
import starterCatalog from '../../../data/starterCatalog';
import { searchProducts } from '../../../utils/search';
import { formatRupees } from '../../../utils/format';
import ProductIcon from '../../../components/common/ProductIcon';

const QUERIES = ['onion', 'tomato', 'potato', 'chilli'];

// Types each query letter by letter, pauses, deletes it, then moves on.
const useTypewriter = (words, { typeMs = 110, holdMs = 1600 } = {}) => {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  // Always start empty so the pre-rendered HTML matches the first browser render.
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) {
      setText(words[0]);
      return undefined;
    }
    const word = [...words[index]];
    const current = [...text];
    let delay = deleting ? typeMs / 2 : typeMs;
    if (!deleting && current.length === word.length) delay = holdMs;
    const id = setTimeout(() => {
      if (!deleting && current.length === word.length) setDeleting(true);
      else if (deleting && current.length === 0) {
        setDeleting(false);
        setIndex((i) => (i + 1) % words.length);
      } else {
        setText(word.slice(0, current.length + (deleting ? -1 : 1)).join(''));
      }
    }, delay);
    return () => clearTimeout(id);
  }, [text, deleting, index, words, typeMs, holdMs, reduce]);

  return text;
};

const PhoneMock = () => {
  const query = useTypewriter(QUERIES);
  const results = useMemo(() => searchProducts(starterCatalog, query).slice(0, 3), [query]);

  return (
    <div className="phone">
      <div className="phone-notch" aria-hidden="true" />
      <div className="phone-screen">
        <div className="phone-search">
          <FaSearch aria-hidden="true" />
          <span className="phone-query">
            {query}
            <span className="caret" aria-hidden="true" />
          </span>
          <span className="phone-mic" aria-hidden="true">
            <FaMicrophone />
          </span>
        </div>

        <p className="phone-label">{t('mockTitle')}</p>
        <motion.ul layout className="phone-results">
          <AnimatePresence mode="popLayout" initial={false}>
            {results.map((p) => {
              return (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="phone-row"
                >
                  <ProductIcon icon={p.icon} category={p.category} size="sm" />
                  <span className="phone-row-name">
                    {p.name}
                    <span className="phone-row-unit">{formatRupees(p.price)}{t('perUnit', { unit: p.unit })}</span>
                  </span>
                  <span className="phone-add">{t('add')}</span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>

        <div className="phone-order">
          <div className="phone-order-head">
            <span>{t('mockOrderTitle')}</span>
            <span className="phone-eta">32 min</span>
          </div>
          <div className="phone-progress">
            <motion.span
              className="phone-progress-bar"
              initial={{ width: '8%' }}
              animate={{ width: ['8%', '62%', '62%', '100%', '100%'] }}
              transition={{ duration: 6, times: [0, 0.35, 0.6, 0.85, 1], repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <div className="phone-steps" aria-hidden="true">
            <span>{t('statusPlaced')}</span>
            <span>{t('statusOutForDelivery')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneMock;
