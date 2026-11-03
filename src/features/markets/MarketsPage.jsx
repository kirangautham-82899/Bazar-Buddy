import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaCrosshairs, FaDirections, FaMapMarkerAlt, FaPhoneAlt, FaSearchLocation, FaStore } from 'react-icons/fa';
import { t } from '../../content/strings';
import { useAuth } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import mandis, { MARKET_ITEMS } from '../../data/mandis';
import { currentPosition, fetchMandiPrices, fetchNearbyMarkets, findPlace } from '../../services/marketService';
import { directionsUrl, formatDistance, isKnownFor, marketsWithin } from '../../utils/markets';
import { openStatus } from '../../utils/openingHours';
import PageHead from '../../components/common/PageHead';
import { Skeleton, Stagger, staggerItem } from '../../components/motion';
import LivePrices from './LivePrices';
import MarketHours from './MarketHours';
import './markets.css';

const RADII_KM = [2, 5, 10, 20];
const DEFAULT_RADIUS_KM = 5;

const KIND_LABEL = {
  market: 'marketKindMarket',
  greengrocer: 'marketKindGreengrocer',
  wholesale: 'marketKindWholesale',
  grocery: 'marketKindGrocery',
  mandi: 'marketKindMandi',
};

// Directory mandis only have city-level positions, so their distance is approximate.
const DIRECTORY = mandis.map((m) => ({ ...m, kind: 'mandi', precise: false }));

const MarketCard = ({ market, item, now }) => {
  const kind = t(KIND_LABEL[market.kind]);
  return (
    <motion.li variants={staggerItem} className="market-card">
      <div className="market-card-head">
        <span className={`market-icon kind-${market.kind}`} aria-hidden="true"><FaStore /></span>
        <div className="market-title">
          <h3>{market.name || kind}</h3>
          <p className="muted small">
            {market.name ? `${kind} · ` : ''}
            <strong className="market-distance">{market.precise ? '' : '~'}{formatDistance(market.distanceKm)}</strong>
          </p>
        </div>
      </div>
      {(market.area || market.city) && <p className="market-area small muted">{market.area || `${market.city}, ${market.state}`}</p>}
      <MarketHours market={market} now={now} />
      {market.known?.length > 0 && (
        <div className="market-known">
          <span className="small muted">{t('knownFor')}</span>
          <ul>
            {market.known.map((k) => (
              <li key={k} className={item && k.toLowerCase() === item.toLowerCase() ? 'match' : ''}>{k}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="market-actions">
        <a className="btn btn-sm btn-outline" href={directionsUrl(market)} target="_blank" rel="noopener noreferrer">
          <FaDirections aria-hidden="true" /> {t('directions')}
        </a>
        {market.phone && (
          <a className="btn btn-sm btn-ghost" href={`tel:${market.phone.replace(/[^\d+]/g, '')}`}>
            <FaPhoneAlt aria-hidden="true" /> {t('call')}
          </a>
        )}
      </div>
    </motion.li>
  );
};

const precisionNote = (place) => {
  if (place.precision === 'gps') return place.accuracy ? t('precisionGps', { m: Math.max(5, Math.round(place.accuracy)) }) : '';
  return t(place.precision === 'pin' ? 'precisionPin' : 'precisionAddress');
};

// Markets within a chosen distance of the user's exact spot: GPS first, or a
// PIN code / typed area geocoded to a point. Nothing further away is shown.
const MarketsPage = () => {
  const { profile } = useAuth();
  const [params, setParams] = useSearchParams();
  const item = params.get('item') || '';
  const openOnly = params.get('open') === '1';
  const radiusKm = RADII_KM.includes(Number(params.get('km'))) ? Number(params.get('km')) : DEFAULT_RADIUS_KM;
  const [query, setQuery] = useState(params.get('q') || profile?.address?.pincode || '');
  const [place, setPlace] = useState(null); // { lat, lng, label, district, state, precision, accuracy? }
  const [status, setStatus] = useState('idle'); // idle | locating | loading | done | error
  const [error, setError] = useState('');
  const [nearby, setNearby] = useState({ status: 'idle', source: null, markets: [] }); // loading | done | failed
  const [now, setNow] = useState(() => new Date());
  useDocumentMeta({ title: `${t('marketsTitle')} – ${t('appName')}` });

  // Keep "Open now" right while the page stays open.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const searchText = useCallback(async (value) => {
    const q = value.trim();
    if (q.length < 3) {
      setError(t('errPlaceNotFound'));
      setStatus('error');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      setPlace(await findPlace({ q }));
      setStatus('done');
    } catch (err) {
      setError(err.status === 404 || err.status === 400 ? t('errPlaceNotFound') : t('errMarketsUnavailable'));
      setStatus('error');
    }
  }, []);

  // Start from the place in the link or the saved delivery PIN code.
  useEffect(() => {
    if (query.trim().length >= 3) searchText(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on first load
  }, []);

  const useMyLocation = async () => {
    setStatus('locating');
    setError('');
    let point;
    try {
      point = await currentPosition();
    } catch (err) {
      setError(err.message === 'denied' ? t('errLocationDenied') : t('errLocationUnavailable'));
      setStatus('error');
      return;
    }
    // The area name and state (for prices) are nice to have; the point is what matters.
    const area = await findPlace(point).catch(() => null);
    setPlace({ ...area, label: area?.label || t('yourLocation'), lat: point.lat, lng: point.lng, accuracy: point.accuracy, precision: 'gps' });
    setStatus('done');
  };

  // Mapped markets around the point, refetched when the point or distance changes.
  useEffect(() => {
    if (!place) return undefined;
    let active = true;
    setNearby({ status: 'loading', source: null, markets: [] });
    fetchNearbyMarkets(place, radiusKm)
      .then(({ source, markets }) => active && setNearby({ status: 'done', source, markets }))
      .catch(() => active && setNearby({ status: 'failed', source: null, markets: [] }));
    return () => {
      active = false;
    };
  }, [place, radiusKm]);

  const results = useMemo(() => {
    if (!place || nearby.status === 'loading') return [];
    const mapped = nearby.markets.map((m) => ({ ...m, precise: true }));
    const all = marketsWithin(place, [...mapped, ...DIRECTORY], radiusKm);
    return openOnly ? all.filter((m) => openStatus(m.schedule, now)?.open) : all;
  }, [place, nearby, radiusKm, openOnly, now]);

  const nextRadius = RADII_KM.find((r) => r > radiusKm);
  const apiItem = MARKET_ITEMS.find((i) => i.label === item)?.api;
  const busy = status === 'loading' || status === 'locating';
  const showResults = status === 'done' && place;

  return (
    <div className="page markets-page">
      <PageHead title={t('marketsTitle')} subtitle={t('marketsSubtitle')} />

      <section className="markets-search" aria-label={t('findMarkets')}>
        <form
          className="markets-form"
          onSubmit={(e) => {
            e.preventDefault();
            setParam('q', query.trim());
            searchText(query);
          }}
        >
          <button type="button" className="btn markets-gps" onClick={useMyLocation} disabled={busy}>
            <FaCrosshairs aria-hidden="true" /> {t('useMyLocation')}
          </button>
          <label htmlFor="markets-place" className="visually-hidden">{t('placeLabel')}</label>
          <div className="markets-input">
            <FaMapMarkerAlt aria-hidden="true" />
            <input
              id="markets-place"
              className="input"
              autoComplete="postal-code"
              maxLength={120}
              placeholder={t('pinPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-outline" disabled={busy}>
            <FaSearchLocation aria-hidden="true" /> {t('findMarkets')}
          </button>
        </form>

        <div className="markets-filters">
          <div className="chip-row" role="group" aria-label={t('radiusLabel')}>
            {RADII_KM.map((km) => (
              <button
                key={km}
                type="button"
                className={`chip ${radiusKm === km ? 'active' : ''}`}
                aria-pressed={radiusKm === km}
                onClick={() => setParam('km', km === DEFAULT_RADIUS_KM ? '' : String(km))}
              >
                {radiusKm === km && <motion.span layoutId="market-radius-pill" className="chip-pill" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                <span className="chip-label">{t('withinKm', { km })}</span>
              </button>
            ))}
            <button
              type="button"
              className={`chip chip-toggle ${openOnly ? 'active' : ''}`}
              aria-pressed={openOnly}
              onClick={() => setParam('open', openOnly ? '' : '1')}
            >
              <span className="chip-label">{t('openNowOnly')}</span>
            </button>
          </div>
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
        </div>
      </section>

      <AnimatePresence mode="wait">
        {busy && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {status === 'locating' && <p className="muted" role="status">{t('locating')}</p>}
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

      {showResults && (
        <div className="markets-results">
          <section aria-labelledby="near-title">
            <div className="markets-results-head">
              <h2 id="near-title" className="shop-section-title">{t('marketsNear', { place: place.label })}</h2>
              {nearby.status !== 'loading' && <p className="muted small">{t(openOnly ? 'openMarketsCount' : 'marketsCount', { n: results.length, km: radiusKm })}</p>}
            </div>
            <p className="markets-precision small muted">
              <FaCrosshairs aria-hidden="true" /> {precisionNote(place)}
            </p>
            {nearby.status === 'failed' && <p className="markets-note small">{t('mapUnavailable')}</p>}
            {nearby.status === 'loading' ? (
              <Skeleton lines={4} />
            ) : results.length ? (
              <Stagger as="ul" className="market-grid" stagger={0.03}>
                {results.map((market) => (
                  <MarketCard key={market.id} market={market} item={item && isKnownFor(market, item) ? item : ''} now={now} />
                ))}
              </Stagger>
            ) : (
              <div className="empty-state">
                <p>{t(openOnly ? 'noOpenMarketsNearby' : 'noMarketsNearby', { km: radiusKm })}</p>
                {openOnly ? (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setParam('open', '')}>
                    {t('showAllMarkets')}
                  </button>
                ) : nextRadius && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setParam('km', String(nextRadius))}>
                    {t('widenSearch', { km: nextRadius })}
                  </button>
                )}
              </div>
            )}
            {nearby.source && <p className="markets-source small muted">{t(nearby.source === 'google' ? 'placesByGoogle' : 'placesByOsm')}</p>}
          </section>

          {place.state && <LivePrices area={place} commodity={apiItem} itemLabel={item} fetchPrices={fetchMandiPrices} />}
        </div>
      )}
    </div>
  );
};

export default MarketsPage;
