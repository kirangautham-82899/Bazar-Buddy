import { fromGooglePeriods, parseOsmHours } from '../../api/_lib/openingHours.js';
import { formatTime, openStatus, weeklyHours } from './openingHours';

// Wednesday 4 Nov 2026, local time.
const at = (hh, mm = 0, date = 4) => new Date(2026, 10, date, hh, mm);

describe('parseOsmHours', () => {
  it('reads day ranges, split shifts and closed days', () => {
    const week = parseOsmHours('Mo-Sa 06:00-13:00, 16:00-21:00; Su off');
    expect(week[3]).toEqual([[360, 780], [960, 1260]]);
    expect(week[0]).toEqual([]);
  });

  it('treats a time without days as every day and 24/7 as always open', () => {
    expect(parseOsmHours('05:00-11:00').every((d) => d[0][0] === 300)).toBe(true);
    expect(parseOsmHours('24/7')[2]).toEqual([[0, 1440]]);
  });

  it('carries late-night hours past midnight and ignores holiday rules', () => {
    expect(parseOsmHours('Fr 20:00-02:00; PH off')[5]).toEqual([[1200, 1560]]);
  });

  it('returns null for forms it cannot read', () => {
    expect(parseOsmHours('sunrise-sunset')).toBeNull();
    expect(parseOsmHours('')).toBeNull();
  });
});

describe('fromGooglePeriods', () => {
  it('builds the week, including overnight periods', () => {
    const week = fromGooglePeriods([
      { open: { day: 3, hour: 6, minute: 0 }, close: { day: 3, hour: 21, minute: 30 } },
      { open: { day: 5, hour: 22, minute: 0 }, close: { day: 6, hour: 2, minute: 0 } },
    ]);
    expect(week[3]).toEqual([[360, 1290]]);
    expect(week[5]).toEqual([[1320, 1560]]);
  });

  it('reads a single open period without a close as 24 hours', () => {
    expect(fromGooglePeriods([{ open: { day: 0, hour: 0, minute: 0 } }])[4]).toEqual([[0, 1440]]);
  });
});

describe('openStatus', () => {
  const week = parseOsmHours('Mo-Sa 06:00-13:00,16:00-21:00; Su off');

  it('says when an open market closes', () => {
    expect(openStatus(week, at(10))).toEqual({ open: true, until: 780 });
  });

  it('says when a closed market opens next', () => {
    expect(openStatus(week, at(14))).toMatchObject({ open: false, opensAt: 960, day: 0 });
    expect(openStatus(week, at(22))).toMatchObject({ open: false, opensAt: 360, day: 1 });
    // Saturday night: closed Sunday, opens Monday.
    expect(openStatus(week, at(22, 0, 7))).toMatchObject({ open: false, opensAt: 360, day: 2, weekday: 'Mon' });
  });

  it('counts the small hours of an overnight shift as open', () => {
    const late = parseOsmHours('Tu 20:00-02:00');
    expect(openStatus(late, at(1, 30))).toEqual({ open: true, until: 120 });
  });

  it('handles 24/7 and unknown timings', () => {
    expect(openStatus(parseOsmHours('24/7'), at(3))).toEqual({ open: true, allDay: true });
    expect(openStatus(null, at(3))).toBeNull();
  });
});

describe('weeklyHours', () => {
  it('lists the week from Monday and marks today', () => {
    const rows = weeklyHours(parseOsmHours('Mo-Sa 06:00-21:00; Su off'), at(9));
    expect(rows[0]).toEqual({ day: 'Mon', text: '6:00 AM – 9:00 PM', today: false });
    expect(rows[2].today).toBe(true);
    expect(rows[6].text).toBeNull();
  });

  it('formats times on a 12-hour clock', () => {
    expect(formatTime(0)).toBe('12:00 AM');
    expect(formatTime(750)).toBe('12:30 PM');
    expect(formatTime(1560)).toBe('2:00 AM');
  });
});
