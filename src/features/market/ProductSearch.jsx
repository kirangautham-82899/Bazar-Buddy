import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaMicrophone, FaSearch, FaStop, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceSearch } from '../../hooks/useVoiceSearch';
import { CATEGORIES, CATEGORY_LABEL_KEYS } from '../../data/products';
import './ProductSearch.css';

const VOICE_ERROR_KEYS = { unsupported: 'voiceUnsupported', denied: 'voiceError', failed: 'voiceError' };

// Search box with voice input and category chips. Filtering itself lives in utils/search.
const ProductSearch = ({ query, onQueryChange, category, onCategoryChange, resultCount }) => {
  const { t, language } = useLanguage();
  const voice = useVoiceSearch({ language, onResult: onQueryChange });

  const chips = useMemo(() => ['all', ...CATEGORIES], []);

  return (
    <div className="product-search">
      <form className="search-bar" role="search" onSubmit={(e) => e.preventDefault()}>
        <FaSearch className="search-icon" aria-hidden="true" />
        <label htmlFor="product-search" className="visually-hidden">{t('searchLabel')}</label>
        <input
          id="product-search"
          type="search"
          className="search-input"
          placeholder={voice.listening ? t('listening') : t('searchPlaceholder')}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          autoComplete="off"
          enterKeyHint="search"
        />
        {query && (
          <button type="button" className="search-clear" onClick={() => onQueryChange('')} aria-label={t('close')}>
            <FaTimes aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          className={`search-voice ${voice.listening ? 'listening' : ''}`}
          onClick={voice.listening ? voice.stop : voice.start}
          aria-label={voice.listening ? t('listening') : t('voiceSearch')}
          aria-pressed={voice.listening}
          title={voice.supported ? t('voiceSearch') : t('voiceUnsupported')}
        >
          {voice.listening ? <FaStop aria-hidden="true" /> : <FaMicrophone aria-hidden="true" />}
        </button>
      </form>

      {voice.error && <p className="search-hint" role="alert">{t(VOICE_ERROR_KEYS[voice.error])}</p>}

      <div className="category-chips" role="group" aria-label={t('categoriesLabel')}>
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            className={`chip ${category === c ? 'active' : ''}`}
            aria-pressed={category === c}
            onClick={() => onCategoryChange(c)}
          >
            {category === c && (
              <motion.span layoutId="category-pill" className="chip-pill" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
            )}
            <span className="chip-label">{c === 'all' ? t('allCategories') : t(CATEGORY_LABEL_KEYS[c])}</span>
          </button>
        ))}
      </div>

      <p className="search-count muted" aria-live="polite">
        {resultCount === 0 && query ? t('noResults', { q: query }) : t('resultsCount', { n: resultCount })}
      </p>
    </div>
  );
};

export default ProductSearch;
