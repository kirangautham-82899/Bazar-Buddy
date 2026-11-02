import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaCrosshairs, FaDirections, FaMapMarkerAlt, FaSearchLocation, FaStore } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useAuth } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import mandis, { MARKET_ITEMS } from '../../data/mandis';
import { currentPosition, fetchMandiPrices, lookupPincode } from '../../services/marketService';
import { directionsUrl, formatDistance, isKnownFor, marketsForPlace, nearestMarkets } from '../../utils/markets';
import PageHead from '../../components/common/PageHead';
import { Skeleton, Stagger, staggerItem } from '../../components/motion';
import LivePrices from './LivePrices';
import './markets.css';

const PIN_RE = /^[1-9]\d{5}$/;

const MarketCard = ({ market, item }) => (
  <motion.li variants={staggerItem} className="market-card">
    <div className="market-card-head">
      <span className="market-icon" aria-hidden="true"><FaStore /></span>
      <div className="market-title">
        <h3>{market.name}</h3>
        <p className="muted small">
          {market.city}, {market.state}
          {market.distanceKm !== undefined && <> · {formatDistance(market.distanceKm)}</>}
        </p>
      </div>
    </div>
    <div className="market-known">
      <span className="small muted">{t('knownFor')}</span>
      <ul>
        {market.known.map((k) => (
          <li key={k} className={item && k.toLowerCase() === item.toLowerCase() ? 'match' : ''}>{k}</li>
        ))}
      </ul>
    </div>
    <a className="btn btn-sm btn-outline market-directions" href={directionsUrl(market)} target="_blank" rel="noopener noreferrer">
      <FaDirections aria-hidden="true" /> {t('directions')}
    </a>
  </motion.li>
);

// Enter a PIN code (or use GPS) to see nearby mandis and what they sell.
const MarketsPage = () => {
  const { profile } = useAuth();
  const [params, setParams] = useSearchParams();
  const item = params.get('item') || '';
  const [pin, setPin] = useState(params.get('pin') || profile?.address?.pincode || '');
  const [place, setPlace] = useState(null); // { label, state, district } or { label, point }
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [error, setError] = useState('');
  useDocumentMeta({ title: `${t('marketsTitle')} – ${t('appName')}` });

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const searchPin = useCallback(async (value) => {
    if (!PIN_RE.test(value)) {
      setError(t('errPincode'));
      setStatus('error');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const found = await lookupPincode(value);
      setPlace({ label: `${found.district}, ${found.state}`, state: found.state, district: found.district });
      setStatus('done');
    } catch (err) {
      setError(err.status === 404 ? t('errPinNotFound') : t('errMarketsUnavailable'));
      setStatus('error');
    }
  }, []);

  // Start from the PIN in the link or the saved delivery address.
  useEffect(() => {
    if (PIN_RE.test(pin)) searchPin(pin);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on first load
  }, []);

  const useMyLocation = async () => {
    setStatus('loading');
    setError('');
    try {
      const point = await currentPosition();
      setPlace({ label: t('yourLocation'), point });
      setStatus('done');
    } catch (err) {
      setError(err.message === 'denied' ? t('errLocationDenied') : t('errLocationUnavailable'));
      setStatus('error');
    }
  };

  const results = useMemo(() => {
    if (!place) return { markets: [], matched: null };
    if (place.point) return { markets: nearestMarkets(place.point, mandis, { item }), matched: 'gps' };
    return marketsForPlace(place, mandis, { item });
  }, [place, item]);

  // For GPS results, live prices use the state of the nearest market.
  const priceArea = place?.point ? (results.markets[0] ? { state: results.markets[0].state, district: results.markets[0].district } : null) : place;
  const apiItem = MARKET_ITEMS.find((i) => i.label === item)?.api;
  const knownCount = item ? results.markets.filter((m) => isKnownFor(m, item)).length : 0;

  return (
    <div className="page markets-page">
      <PageHead title={t('marketsTitle')} subtitle={t('marketsSubtitle')} />

      <section className="markets-search" aria-label={t('findMarkets')}>
        <form
          className="markets-form"
          onSubmit={(e) => {
            e.preventDefault();
            setParam('pin', pin);
            searchPin(pin);
          }}
        >
          <label htmlFor="markets-pin" className="visually-hidden">{t('addressPincode')}</label>
          <div className="markets-input">
            <FaMapMarkerAlt aria-hidden="true" />
            <input
              id="markets-pin"
              className="input"
              inputMode="numeric"
              maxLength={6}
              placeholder={t('pinPlaceholder')}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <button type="submit" className="btn" disabled={status === 'loading'}>
            <FaSearchLocation aria-hidden="true" /> {t('findMarkets')}
          </button>
          <button type="button" className="btn btn-outline" onClick={useMyLocation} disabled={status === 'loading'}>
            <FaCrosshairs aria-hidden="true" /> {t('useMyLocation')}
          </button>
        </form>

        <div className="chip-row" role="group" aria-label={t('marketItemLabel')}>
          {['', ...MARKET_ITEMS.map((i) => i.label)].map((label) => (
            <button
              key={label || 'all'}
              type="button"
              className={`chip ${item === label ? 'active' : ''}`}
              aria-pressed={item === label}
              onClick={() => setParam('item', label)}
            >
              {item === label && <motion.span layoutId="market-item-pill" className="chip-pill" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
              <span className="chip-label">{label || t('allProduce')}</span>
            </button>
          ))}
        </div>
      </section>

      <AnimatePresence mode="wait">
        {status === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Skeleton lines={4} />
          </motion.div>
        )}
        {status === 'error' && (
          <motion.p key="error" className="markets-error" role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {error}
          </motion.p>
        )}
        {status === 'idle' && (
          <motion.div key="idle" className="empty-state markets-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <span className="empty-icon"><FaSearchLocation aria-hidden="true" /></span>
            <p>{t('marketsIdle')}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {status === 'done' && (
        <div className="markets-results">
          <section aria-labelledby="near-title">
            <div className="markets-results-head">
              <h2 id="near-title" className="shop-section-title">{t('marketsNear', { place: place.label })}</h2>
              {item && <p className="muted small">{t('knownForCount', { n: knownCount, item })}</p>}
            </div>
            {results.markets.length ? (
              <Stagger as="ul" className="market-grid" stagger={0.04}>
                {results.markets.map((market) => (
                  <MarketCard key={market.id} market={market} item={item} />
                ))}
              </Stagger>
            ) : (
              <p className="empty-state">{t('noMarketsFound')}</p>
            )}
          </section>

          {priceArea && <LivePrices area={priceArea} commodity={apiItem} itemLabel={item} fetchPrices={fetchMandiPrices} />}
        </div>
      )}
    </div>
  );
};

export default MarketsPage;
