// Open/closed status and a readable timetable from a weekly schedule:
// 7 lists (Sunday = 0) of [startMin, endMin], ends past 1440 run past midnight
// (built by api/_lib/openingHours.js). Uses the device's clock.

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first

export const formatTime = (min) => {
  const m = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const suffix = h < 12 ? 'AM' : 'PM';
  return `${h % 12 || 12}:${String(m % 60).padStart(2, '0')} ${suffix}`;
};

const isAllDay = (schedule) => schedule.every((day) => day.some(([s, e]) => s === 0 && e >= 1440));

// { open, allDay, until } when open; { open: false, opensAt, day } when closed
// (day: 0 today, 1 tomorrow, more = weekday); null when never open.
export const openStatus = (schedule, now = new Date()) => {
  if (!schedule) return null;
  if (isAllDay(schedule)) return { open: true, allDay: true };
  const today = now.getDay();
  const min = now.getHours() * 60 + now.getMinutes();
  const yesterday = (today + 6) % 7;
  const current =
    schedule[today].find(([s, e]) => s <= min && min < e) ||
    schedule[yesterday].map(([s, e]) => [s - 1440, e - 1440]).find(([s, e]) => s <= min && min < e);
  if (current) return { open: true, until: current[1] };
  for (let ahead = 0; ahead < 8; ahead += 1) {
    const day = (today + ahead) % 7;
    const next = schedule[day].filter(([s]) => ahead > 0 || s > min).sort((a, b) => a[0] - b[0])[0];
    if (next) return { open: false, opensAt: next[0], day: ahead, weekday: DAY_NAMES[day] };
  }
  return null;
};

// [{ day: 'Mon', text: '6:00 AM – 9:00 PM', today: true }, ...]
export const weeklyHours = (schedule, now = new Date()) =>
  DAY_ORDER.map((d) => ({
    day: DAY_NAMES[d],
    today: d === now.getDay(),
    text: schedule[d].length
      ? schedule[d].map(([s, e]) => (s === 0 && e >= 1440 ? 'Open 24 hours' : `${formatTime(s)} – ${formatTime(e)}`)).join(', ')
      : null,
  }));
