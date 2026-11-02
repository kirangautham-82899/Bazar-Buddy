import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaMicrophone, FaSearch, FaStop, FaTimes } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useVoiceSearch } from '../../hooks/useVoiceSearch';

const VOICE_ERROR_KEYS = { unsupported: 'voiceUnsupported', denied: 'voiceError', failed: 'voiceError' };

// On most pages it's a link that opens search; on the search page it's the real input.
const SearchBox = ({ query = '', onQueryChange, asLink = false, autoFocus = false }) => {
  const inputRef = useRef(null);
  const voice = useVoiceSearch({ onResult: (text) => onQueryChange?.(text) });

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  if (asLink) {
    return (
      <Link to="/shop/search" className="search-bar search-link" aria-label={t('searchLabel')}>
        <FaSearch className="search-icon" aria-hidden="true" />
        <span className="search-placeholder">{t('searchPlaceholder')}</span>
        <span className="search-voice" aria-hidden="true"><FaMicrophone /></span>
      </Link>
    );
  }

  return (
    <div className="search-wrap">
      <form className="search-bar" role="search" onSubmit={(e) => e.preventDefault()}>
        <FaSearch className="search-icon" aria-hidden="true" />
        <label htmlFor="product-search" className="visually-hidden">{t('searchLabel')}</label>
        <input
          ref={inputRef}
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
          <button type="button" className="search-clear" onClick={() => onQueryChange('')} aria-label={t('clearSearch')}>
            <FaTimes aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          className={`search-voice ${voice.listening ? 'listening' : ''}`}
          onClick={voice.listening ? voice.stop : voice.start}
          aria-label={voice.listening ? t('listening') : t('voiceSearch')}
          aria-pressed={voice.listening}
        >
          {voice.listening ? <FaStop aria-hidden="true" /> : <FaMicrophone aria-hidden="true" />}
        </button>
      </form>
      {voice.error && <p className="search-hint" role="alert">{t(VOICE_ERROR_KEYS[voice.error])}</p>}
    </div>
  );
};

export default SearchBox;
