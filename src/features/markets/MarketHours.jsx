import React from 'react';
import { FaClock } from 'react-icons/fa';
import { t } from '../../content/strings';
import { formatTime, openStatus, weeklyHours } from '../../utils/openingHours';

const statusText = (status) => {
  if (status.open) return status.allDay ? t('openAllDay') : t('openUntil', { time: formatTime(status.until) });
  const time = formatTime(status.opensAt);
  if (status.day === 0) return t('opensToday', { time });
  if (status.day === 1) return t('opensTomorrow', { time });
  return t('opensOn', { day: status.weekday, time });
};

// "Open now · closes 9:00 PM" plus the week's timetable, or the listed text
// when it's in a form we can't read, or a note when there are no timings.
const MarketHours = ({ market, now }) => {
  const status = openStatus(market.schedule, now);
  if (!market.schedule) {
    return (
      <p className="market-hours small muted">
        <FaClock aria-hidden="true" /> {market.hours || t('hoursNotListed')}
      </p>
    );
  }
  return (
    <div className="market-hours-block">
      <p className={`market-status small ${status?.open ? 'is-open' : 'is-closed'}`}>
        <FaClock aria-hidden="true" /> {status ? statusText(status) : t('closedAllWeek')}
      </p>
      <details className="market-week small">
        <summary>{t('allTimings')}</summary>
        <dl>
          {weeklyHours(market.schedule, now).map((row) => (
            <div key={row.day} className={row.today ? 'today' : ''}>
              <dt>{row.day}</dt>
              <dd>{row.text || t('closedDay')}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
};

export default MarketHours;
