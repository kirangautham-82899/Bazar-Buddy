// Opening hours from OpenStreetMap's opening_hours text or Google's periods,
// turned into one weekly schedule: 7 lists (Sunday = 0) of [startMin, endMin]
// in minutes from that day's midnight. An end past 1440 runs past midnight.
// Rules we can't read return null, and the page shows the original text.

const DAYS = { Su: 0, Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6 };
const WEEK = 7 * 1440;
const emptyWeek = () => Array.from({ length: 7 }, () => []);

const minutes = (hhmm) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m || Number(m[1]) > 24 || Number(m[2]) > 59) return null;
  return Number(m[1]) * 60 + Number(m[2]);
};

// "Mo-Fr,Su" -> [1, 2, 3, 4, 5, 0]
const parseDays = (text) => {
  const days = [];
  for (const part of text.split(',')) {
    const [from, to] = part.split('-');
    if (!(from in DAYS) || (to !== undefined && !(to in DAYS))) return null;
    if (to === undefined) days.push(DAYS[from]);
    else for (let d = DAYS[from]; ; d = (d + 1) % 7) {
      days.push(d);
      if (d === DAYS[to]) break;
    }
  }
  return days;
};

// "06:00-13:00,16:00-21:00" -> [[360, 780], [960, 1260]]
const parseTimes = (text) => {
  const spans = [];
  for (const part of text.split(',')) {
    const [a, b] = part.split('-').map((s) => minutes(s.trim()));
    if (a === null || b === null || a === undefined || b === undefined) return null;
    spans.push([a, b > a ? b : b + 1440]);
  }
  return spans;
};

export const parseOsmHours = (text) => {
  if (!text || typeof text !== 'string') return null;
  const value = text.trim();
  if (value === '24/7') return Array.from({ length: 7 }, () => [[0, 1440]]);
  const week = emptyWeek();
  // Public and school holiday rules ("PH off") don't change the weekly pattern.
  for (const rule of value.split(';').map((r) => r.trim()).filter((r) => r && !/^(PH|SH)\b/.test(r))) {
    const match = /^(?:([A-Za-z,-]+)\s+)?(.+)$/.exec(rule);
    // Rule without a day list: "06:00-21:00" means every day.
    const dayText = match[1] && /^[A-Z][a-z]/.test(match[1]) ? match[1] : null;
    const rest = dayText ? match[2] : rule;
    const days = dayText ? parseDays(dayText) : [0, 1, 2, 3, 4, 5, 6];
    if (!days) return null;
    if (/^(off|closed)$/i.test(rest)) {
      days.forEach((d) => (week[d] = []));
      continue;
    }
    const spans = parseTimes(rest.replace(/\s+/g, ''));
    if (!spans) return null;
    days.forEach((d) => (week[d] = spans)); // later rules override earlier ones
  }
  return week;
};

// Google Places periods: [{ open: { day, hour, minute }, close: { day, hour, minute } }]
export const fromGooglePeriods = (periods) => {
  if (!Array.isArray(periods) || !periods.length) return null;
  if (periods.length === 1 && !periods[0].close) return Array.from({ length: 7 }, () => [[0, 1440]]);
  const week = emptyWeek();
  for (const { open, close } of periods) {
    if (!open || !close) return null;
    const start = open.hour * 60 + (open.minute || 0);
    let end = ((close.day - open.day + 7) % 7) * 1440 + close.hour * 60 + (close.minute || 0);
    if (end <= start) end += WEEK;
    week[open.day].push([start, Math.min(end, start + 2 * 1440)]);
  }
  return week;
};
