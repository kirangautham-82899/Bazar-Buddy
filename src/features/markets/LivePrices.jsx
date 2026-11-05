import React, { useEffect, useMemo, useState } from 'react';
import { FaChartLine, FaInfoCircle } from 'react-icons/fa';
import { t } from '../../content/strings';
import { formatRupees } from '../../utils/format';
import { Skeleton } from '../../components/motion';

const MAX_ROWS = 40;

// Today's Agmarknet arrivals and prices for the area (and item, if chosen).
const LivePrices = ({ area, commodity, itemLabel, fetchPrices }) => {
  const [state, setState] = useState({ status: 'loading', data: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ status: 'loading', data: null });
    fetchPrices({ state: area.state, district: area.district, commodity })
      .then((data) => active && setState({ status: 'done', data }))
      .catch(() => active && setState({ status: 'error', data: null }));
    return () => {
      active = false;
    };
  }, [area.state, area.district, commodity, fetchPrices, attempt]);

  const rows = useMemo(
    () => (state.data?.records || []).slice().sort((a, b) => a.commodity.localeCompare(b.commodity) || a.modalPerKg - b.modalPerKg).slice(0, MAX_ROWS),
    [state.data]
  );

  const scopeLabel = state.data?.scope === 'district' ? area.district : area.state;

  return (
    <section className="live-prices" aria-labelledby="live-title">
      <div className="markets-results-head">
        <h2 id="live-title" className="shop-section-title">
          <FaChartLine aria-hidden="true" /> {itemLabel ? t('livePricesItem', { item: itemLabel }) : t('livePrices')}
        </h2>
        {state.status === 'done' && rows.length > 0 && <p className="muted small">{t('livePricesScope', { place: scopeLabel })}</p>}
      </div>

      {state.status === 'loading' && <Skeleton lines={3} />}

      {state.status === 'error' && (
        <div className="markets-note">
          <span>{t('pricesUnavailable')}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAttempt((n) => n + 1)}>
            {t('tryAgain')}
          </button>
        </div>
      )}

      {state.status === 'done' && !state.data.configured && (
        <p className="markets-note">
          <FaInfoCircle aria-hidden="true" /> {t('livePricesSoon')}
        </p>
      )}

      {state.status === 'done' && state.data.configured && !rows.length && (
        <p className="markets-note">{t('noLivePrices', { place: area.state })}</p>
      )}

      {rows.length > 0 && (
        <div className="price-table-wrap">
          <table className="price-table">
            <thead>
              <tr>
                <th scope="col">{t('market')}</th>
                <th scope="col">{t('produce')}</th>
                <th scope="col">{t('modalPrice')}</th>
                <th scope="col">{t('priceRange')}</th>
                <th scope="col">{t('date')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.market}-${r.commodity}-${r.variety}-${i}`}>
                  <td>
                    <strong>{r.market}</strong>
                    <span className="muted small">{r.district}</span>
                  </td>
                  <td>
                    {r.commodity}
                    {r.variety && r.variety !== 'Other' && <span className="muted small">{r.variety}</span>}
                  </td>
                  <td><strong>{formatRupees(r.modalPerKg)}</strong>/kg</td>
                  <td className="muted">{formatRupees(r.minPerKg)}–{formatRupees(r.maxPerKg)}</td>
                  <td className="muted">{r.arrivalDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted small price-source">{t('priceSource')}</p>
        </div>
      )}
    </section>
  );
};

export default LivePrices;
