/**
 * Prints the operating hours the availability check sends, in the reader's own
 * language.
 *
 * The check writes its `hoursDisplay` in English only, so the windows are
 * formatted here from their "HH:MM" parts instead. The call center card and the
 * trip planner both quote hours, and both print them the same way.
 */

import { readClock } from './shuttle-status';

function formatClock(t, time) {
  const clock = readClock(time);
  return clock ? t('shuttleStatus.clockTime', clock) : null;
}

/** One window, such as "10:30 AM - 2:30 PM", or null when it is not readable. */
export function formatWindow(t, window) {
  if (!window) return null;
  const start = formatClock(t, window.start);
  const end = formatClock(t, window.end);
  if (!start || !end) return null;
  return t('shuttleStatus.hoursWindow', { start, end });
}

/** Every window of a day, or null when none can be read. */
export function formatWindows(t, windows) {
  if (!Array.isArray(windows) || windows.length === 0) return null;
  const parts = windows.map(window => formatWindow(t, window)).filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

/**
 * When the service is next scheduled, so a rider can be told when to try again.
 *
 * The date is the service's own calendar date, so it is printed as given rather
 * than converted through the browser's time zone.
 *
 * @returns {object|null} { day, hours } or null when there is no next window
 */
export function readNextService(t, next) {
  if (!next) return null;
  const hours = formatWindow(t, next.window);
  if (!hours) return null;
  const [year, month, day] = next.date.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  let dayText;
  try {
    dayText = date.toLocaleDateString(t('shuttleStatus.dateLocale'), {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  } catch (e) {
    dayText = next.date;
  }
  return { day: dayText, hours };
}
