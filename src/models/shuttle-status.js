/**
 * Turns the shuttle service and vehicle feeds into the handful of facts a call
 * center agent needs while a rider is on the phone.
 *
 * Everything here is pure. The component decides when to poll and when to tick
 * the clock; this file decides what the numbers mean, and refuses to state
 * anything the feeds do not actually support.
 *
 * Two questions are kept apart on purpose. Whether the service is running comes
 * from the schedule and the driver's duty signal. Where the shuttle is comes
 * from the vehicle feed. Either can be true while the other is not.
 */

// The vehicle feed marks a position stale once it reaches this age, and the
// card applies the same rule to a position it is still holding. It has to,
// because polls are not evenly spaced: a failed request backs the next one off,
// so a position that arrived fresh can sit on screen for minutes before
// anything replaces it.
//
// Must match VEHICLE_TTL_SECONDS in skids (src/flex-fleet.ts), which is what
// sets `isStale` on the entries this card reads.
export const CONTACT_STALE_MS = 60 * 1000;

// How far back the vehicle feed will answer for. Asking for stale positions
// widens it from one minute to this, and there is no parameter to ask for more:
// the cap is a constant in the feed service. Anything older is withheld even
// though the position is still held for thirty minutes, so an empty answer
// means "nothing in this window", never "nothing today".
//
// Must match PublicGhostMaxAgeSeconds in skids (src/routers/feed.ts). Nothing
// links the two, so a change there has to be copied here by hand.
export const FEED_REPORT_WINDOW_MS = 5 * 60 * 1000;

// Past this we stop quoting a number. "1,447 minutes ago" reads as a bug and
// invites an agent to repeat it to a rider.
export const MAX_REPORTABLE_AGE_MS = 24 * 60 * 60 * 1000;

// The prefix of the alert id the availability check uses when every driver has
// gone off duty.
const OFF_DUTY_ALERT_PREFIX = 'driver-off-duty';

/**
 * Picks the shuttle out of a feed response and normalizes it. Fields the feed
 * does not send come back as null, so callers can tell absent from zero.
 *
 * The feed answers with every vehicle in the organization's driver-app fleet,
 * not just the one running this trip, in whatever order the position store
 * happens to hand them over. Asking for stale positions widens that to vehicles
 * that stopped reporting minutes ago, so at a shift change a parked vehicle and
 * the one carrying riders are both in the list.
 *
 * A vehicle whose driver has reported off duty is not carrying riders, so it
 * only stands for the shuttle when no other vehicle can. Any vehicle that has
 * not reported off duty and is still inside the feed window comes first, and
 * the freshest of those is chosen: it is the shuttle an agent can tell a rider
 * about. A vehicle that sends no duty state at all, as older driver apps do,
 * counts as working, because silence about duty is not an off-duty report.
 * Only when every vehicle on offer is off duty or outside the window is the
 * freshest entry of all chosen, and an entry the feed has not heard from in
 * minutes never displaces a fresher one.
 *
 * Two ages arrive here and they mean different things. `ageSeconds` is measured
 * by the server against its own receive time, so it says how long since anyone
 * heard from the vehicle. `location.timestamp` is stamped by the driver's
 * device when it took the fix. A device with a frozen GPS keeps reporting, so
 * the first can be small while the second is large.
 *
 * @param {object} response the parsed body of the trips feed request
 * @returns {object|null} the normalized vehicle, or null when none is reported
 */
export function readVehicle(response) {
  const vehicles = response && Array.isArray(response.vehicles)
    ? response.vehicles
    : null;
  if (!vehicles || vehicles.length === 0) return null;

  const reported = vehicles
    .map(normalizeVehicle)
    .filter(vehicle => vehicle !== null);
  if (reported.length === 0) return null;

  const working = reported.filter(
    vehicle => vehicle.onDuty !== false && insideFeedWindow(vehicle)
  );
  return freshest(working.length > 0 ? working : reported);
}

function freshest(vehicles) {
  return vehicles.reduce((best, candidate) =>
    contactRank(candidate) < contactRank(best) ? candidate : best
  );
}

// An entry with no age was still served by the feed, which only serves
// positions inside its window, so it counts as inside.
function insideFeedWindow(vehicle) {
  return vehicle.contactAgeMs === null || vehicle.contactAgeMs <= FEED_REPORT_WINDOW_MS;
}

function normalizeVehicle(vehicle) {
  if (!vehicle) return null;

  const location = vehicle.location || {};
  const raw = Array.isArray(location.coordinates)
    ? location.coordinates
    : Array.isArray(vehicle.coordinates)
      ? vehicle.coordinates
      : null;
  if (!raw || raw.length < 2) return null;

  // A coordinate that is not a real number cannot be put on the map, looked up
  // as an address or printed, so the entry is treated as carrying no position.
  const lng = finiteOrNull(raw[0]);
  const lat = finiteOrNull(raw[1]);
  if (lng === null || lat === null) return null;

  const ageSeconds = finiteOrNull(vehicle.ageSeconds);

  return {
    coordinates: [lng, lat],
    fixTimestamp: finiteOrNull(location.timestamp) ?? finiteOrNull(vehicle.timestamp),
    lastSeenTs: finiteOrNull(vehicle.lastSeenTs),
    contactAgeMs: ageSeconds === null ? null : Math.max(0, ageSeconds * 1000),
    stale: vehicle.stale === true || vehicle.isStale === true,
    onDuty: typeof vehicle.onDuty === 'boolean' ? vehicle.onDuty : null,
  };
}

// An entry the feed gave no age for cannot be compared, so it only wins when
// nothing that carries an age is on offer.
function contactRank(vehicle) {
  return vehicle.contactAgeMs === null ? Infinity : vehicle.contactAgeMs;
}

/**
 * Whether two vehicle entries describe the same report from the driver app,
 * as opposed to a newer report that happens to be in the same place.
 *
 * The server's receive time is the best key because it changes with every
 * report. The device fix time is next. With neither, the same coordinates are
 * all there is to go on.
 */
function sameReport(a, b) {
  if (!a || !b) return false;
  if (a.lastSeenTs !== null && b.lastSeenTs !== null) {
    return a.lastSeenTs === b.lastSeenTs;
  }
  if (a.fixTimestamp !== null && b.fixTimestamp !== null) {
    return a.fixTimestamp === b.fixTimestamp;
  }
  return (
    a.coordinates[0] === b.coordinates[0] &&
    a.coordinates[1] === b.coordinates[1]
  );
}

/**
 * Keeps the age of a report from moving backward between polls.
 *
 * Each poll's age is the server's measurement plus the time since that request
 * went out. A request that took longer to answer counts more of its round trip
 * as age, so two polls of the same report can disagree by the difference in
 * their latency, and the later one can read younger. When the new poll carries
 * the same report as the previous one, the new vehicle keeps whichever age is
 * larger at the moment the new request went out. Both then advance at the same
 * rate, so the age on screen only ever counts up until a new report arrives.
 *
 * @param {object|null} previous { vehicle, requestedAt } from the last answer
 * @param {object|null} next { vehicle, requestedAt } from the new answer
 * @returns {object|null} the vehicle to keep for the new answer
 */
export function carryReportAge(previous, next) {
  if (!next || !next.vehicle) return next ? next.vehicle : null;
  const vehicle = next.vehicle;
  if (!previous || !sameReport(previous.vehicle, vehicle)) {
    return { ...vehicle, firstSeenAt: next.requestedAt };
  }

  const firstSeenAt = finiteOrNull(previous.vehicle.firstSeenAt) ?? previous.requestedAt;
  const carried = advanceAge(
    previous.vehicle.contactAgeMs,
    previous.requestedAt,
    next.requestedAt
  );
  const contactAgeMs =
    carried !== null && vehicle.contactAgeMs !== null
      ? Math.max(carried, vehicle.contactAgeMs)
      : vehicle.contactAgeMs;

  return { ...vehicle, contactAgeMs, firstSeenAt };
}

/**
 * Normalizes the service availability check.
 *
 * The check already folds in the published hours, any service alert, and
 * whether a driver has reported off duty, so it is the authoritative answer to
 * "is the service running right now". A driver-duty stoppage arrives as a
 * service alert with a known id, which is worth separating out because it is
 * the one an agent will be asked about.
 *
 * A dispatcher alert that does not stop service, such as a detour or reduced
 * service, arrives on a running answer with no details, so its text is read
 * from the alert itself.
 *
 * The check's own `hoursDisplay` string is not kept. It is English only, and
 * when there are no windows it is a stand-in such as "Closed today". The card
 * formats the windows in `todayHours` in the agent's language instead.
 *
 * @param {object} response the parsed body of the availability check
 * @returns {object|null} { running, configured, reason, details, notice,
 *   todayHours, nextAvailable }
 */
export function readAvailability(response) {
  if (!response || typeof response.isAvailable !== 'boolean') return null;

  const alert = response.activeAlert || null;
  const alertId = alert && alert.id;
  const offDuty =
    typeof alertId === 'string' && alertId.indexOf(OFF_DUTY_ALERT_PREFIX) === 0;

  const todayHours = readWindows(response.todayHours);

  // The check answers "available" with no hours at all when it holds no
  // configuration for the service, so a service whose configuration failed to
  // load is indistinguishable from a running one. A service that really is
  // inside its hours always sends the window it is inside, so an available
  // answer carrying no windows means we were never told the hours and must not
  // be repeated to a rider as "the shuttle is running".
  const configured = !(response.isAvailable === true && todayHours.length === 0);

  const details = typeof response.details === 'string' ? response.details : null;

  return {
    running: response.isAvailable,
    configured,
    reason: response.isAvailable
      ? 'running'
      : offDuty
        ? 'no-driver'
        : response.reason || 'unavailable',
    details,
    // The driver duty alert is already said by the "no driver" line, so it is
    // not repeated as a notice.
    notice: offDuty ? null : readNotice(alert, response.reason, details),
    todayHours,
    nextAvailable: readNextAvailable(response.nextAvailable),
  };
}

// Text a dispatcher wrote for the service, either a stoppage or a warning.
function readNotice(alert, reason, details) {
  const header = alert ? translatedText(alert.headerText) : null;
  const description = alert ? translatedText(alert.descriptionText) : null;
  if (header || description) return { header, description };
  if (reason === 'service_alert' && details) {
    return { header: null, description: details };
  }
  return null;
}

function translatedText(value) {
  return value && typeof value.text === 'string' && value.text.trim() !== ''
    ? value.text
    : null;
}

const CLOCK_TIME = /^(\d{1,2}):(\d{2})$/;

function readWindows(windows) {
  if (!Array.isArray(windows)) return [];
  return windows.filter(
    window =>
      window &&
      readClock(window.start) !== null &&
      readClock(window.end) !== null
  );
}

function readNextAvailable(next) {
  if (!next || typeof next.date !== 'string') return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(next.date)) return null;
  if (readWindows([next.window]).length === 0) return null;
  return { date: next.date, window: next.window };
}

/**
 * Splits an "HH:MM" time from the schedule into the pieces the copy needs, so
 * each language can print it its own way.
 *
 * @returns {object|null} { hour, hour12, minute, meridiem }
 */
export function readClock(time) {
  if (typeof time !== 'string') return null;
  const match = CLOCK_TIME.exec(time);
  if (!match) return null;
  const hour = Number(match[1]);
  if (hour > 23) return null;
  return {
    hour,
    hour12: hour % 12 || 12,
    minute: match[2],
    meridiem: hour < 12 ? 'AM' : 'PM',
  };
}

/**
 * Age of a timestamp measured against the browser clock.
 *
 * The timestamp comes off the driver's device and the clock is the agent's
 * browser, so the two are not the same clock and the result carries whatever
 * they disagree by. A device running ahead would give an age in the future,
 * which is clamped to zero and reported, because "less than a minute ago" from
 * a device with a wrong clock is a number an agent will read out loud.
 *
 * @returns {number|null} milliseconds, or null when there is no timestamp
 */
export function ageOf(timestamp, now) {
  const at = finiteOrNull(timestamp);
  if (at === null) return null;
  if (now < at) {
    console.warn(
      '[shuttle-status] a timestamp is in the future by',
      at - now,
      'ms; the age shown is clamped to zero'
    );
    return 0;
  }
  return now - at;
}

/**
 * Advances a server-measured age to the present.
 *
 * The server said the vehicle was `baseMs` old when it answered. Only the time
 * since we asked is added here, so the result carries none of the difference
 * between the server's clock and the browser's.
 *
 * `requestedAt` is when the request went out, not when the answer came back,
 * which counts the round trip as part of the age. A slow answer then reads as
 * slightly older than it is, which is the safe direction: an agent may be told
 * a position is staler than it is, never fresher.
 *
 * @returns {number|null} milliseconds
 */
export function advanceAge(baseMs, requestedAt, now) {
  const base = finiteOrNull(baseMs);
  if (base === null) return null;
  if (now < requestedAt) {
    console.warn(
      '[shuttle-status] a request appears to have been sent in the future by',
      requestedAt - now,
      'ms; the age shown is clamped to the server measurement'
    );
    return base;
  }
  return base + (now - requestedAt);
}

/**
 * Breaks an age into the pieces the copy needs, so the wording and the
 * pluralization live in the locale file rather than here.
 *
 * @returns {object|null} { unit, minutes, hours }
 */
export function describeAge(ageMs) {
  if (typeof ageMs !== 'number' || !isFinite(ageMs) || ageMs < 0) return null;
  if (ageMs >= MAX_REPORTABLE_AGE_MS) return { unit: 'overADay' };
  if (ageMs < 60 * 1000) return { unit: 'moment' };

  const totalMinutes = Math.floor(ageMs / 60000);
  if (totalMinutes < 60) return { unit: 'minutes', minutes: totalMinutes };
  return {
    unit: 'hoursMinutes',
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
}

/**
 * Today's on-duty stretches, cleaned up for display.
 *
 * Nothing renders this. The vehicle feed carries no duty history, so there is
 * no honest section to put it in; this waits for the feed to start sending it.
 *
 * A missing list is reported as unavailable rather than as an empty day. The
 * difference matters: an empty day means the shuttle never started, and saying
 * that when we simply were not told would be a guess.
 *
 * An entry with no end is still running, and is shown that way.
 *
 * @param {*} periods the list from the feed, if any
 * @param {number} now browser time
 * @returns {object} { available, segments, totalMs, ongoing }
 */
export function summarizeDutyPeriods(periods, now) {
  if (!Array.isArray(periods)) {
    return { available: false, segments: [], totalMs: 0, ongoing: false };
  }

  const segments = periods
    .map(period => {
      if (!period) return null;
      const start = finiteOrNull(period.start);
      if (start === null) return null;
      const rawEnd = finiteOrNull(period.end);
      // A stretch cannot end in the future. Clamping keeps a server clock that
      // runs fast from producing a total larger than the day so far.
      const end = rawEnd === null ? null : Math.min(rawEnd, now);
      if (end !== null && end <= start) return null;
      return { start, end };
    })
    .filter(segment => segment !== null)
    .sort((a, b) => a.start - b.start);

  const totalMs = segments.reduce((total, segment) => {
    const end = segment.end === null ? now : segment.end;
    return total + Math.max(0, end - segment.start);
  }, 0);

  return {
    available: true,
    segments,
    totalMs,
    ongoing: segments.some(segment => segment.end === null),
  };
}

/**
 * The single call the card renders from.
 *
 * `poll` is the most recent completed pair of requests, `history` is what this
 * page has seen since it opened, and `now` is the browser clock. `history` is
 * how we separate "we lost contact while you were watching" from "no position
 * has ever arrived", which the feeds cannot tell us because they only describe
 * the current moment.
 *
 * @returns {object} { service, position }
 */
export function deriveStatus({ poll, history, now }) {
  return {
    service: deriveService(poll),
    position: derivePosition(poll, history, now),
  };
}

// Position states that mean the shuttle has dropped off the vehicle feed, so
// nothing is hearing from it at all.
const LOST_POSITION = ['no-contact', 'no-report'];

/**
 * The one line at the top of the card, answering the question an agent actually
 * has: can I tell this rider the shuttle is coming?
 *
 * The schedule and the vehicle feed answer different questions and can
 * disagree. The schedule's "running" survives a tablet that died hours ago,
 * because the duty signal it rests on only ever hears drivers sign on. So when
 * the schedule says running and the shuttle has dropped off the feed, the
 * verdict says both halves at once rather than letting the reassuring half
 * stand alone as the only colored thing on the card.
 *
 * A position the feed is still serving but that has not changed in over a
 * minute is not that alarm. The driver app does not report while the vehicle
 * is standing still, so every layover, timed stop and long red light produces
 * one. The verdict only notes how old the position is.
 *
 * When the page could not reach the vehicle feed it cannot see the shuttle at
 * all, so the verdict says the tracking is unavailable rather than repeating
 * the schedule's "running" as if the shuttle had been seen.
 *
 * @returns {object} { state, ageMs } where ageMs is the age of the position the
 *   verdict mentions, or null when it mentions none
 */
export function deriveVerdict(service, position) {
  if (!service) return { state: 'unknown', ageMs: null };
  if (service.state === 'running' && position) {
    if (position.state === 'unreachable') {
      return { state: 'running-tracking-unavailable', ageMs: null };
    }
    if (LOST_POSITION.indexOf(position.state) !== -1) {
      return { state: 'running-no-contact', ageMs: finiteOrNull(position.ageMs) };
    }
    if (position.state === 'out-of-date') {
      return { state: 'running-position-old', ageMs: finiteOrNull(position.ageMs) };
    }
    // The schedule still counts the service as running, but the only shuttle
    // in the feed has a driver who reported off duty. readVehicle picks a
    // working vehicle whenever one is reporting, so this means none is, and a
    // rider cannot be told a shuttle is coming.
    if (position.state === 'off-duty') {
      return { state: 'running-driver-off-duty', ageMs: finiteOrNull(position.ageMs) };
    }
  }
  return { state: service.state, ageMs: null };
}

function deriveService(poll) {
  if (!poll) return { state: 'loading' };
  if (!poll.availability || poll.availability.configured === false) {
    // Either the schedule could not be read or the service has no schedule to
    // read. Saying nothing is better than implying the service is stopped, and
    // better than a green badge nobody checked.
    return { state: 'unknown' };
  }
  const availability = poll.availability;
  const shared = {
    reason: availability.reason,
    details: availability.details,
    notice: availability.notice || null,
    todayHours: availability.todayHours || [],
    nextAvailable: availability.nextAvailable || null,
  };
  if (availability.running) {
    return { state: 'running', ...shared };
  }
  return {
    state: availability.reason === 'no-driver' ? 'no-driver' : 'not-running',
    ...shared,
  };
}

function derivePosition(poll, history, now) {
  const empty = { location: null, ageMs: null, ageBasis: null };

  if (!poll) return { ...empty, state: 'loading' };

  if (!poll.vehicleFeedOk) {
    // The page could not reach the vehicle feed. That is a fault on our side
    // and must not be reported as the shuttle having stopped.
    return { ...empty, state: 'unreachable', ...lastKnown(history, now) };
  }

  if (poll.vehicle) {
    const age = currentAge(poll.vehicle, poll.requestedAt, now);
    const location = {
      title: poll.title || null,
      coordinates: poll.vehicle.coordinates,
    };

    // The feed withholds anything older than its window, so a position past
    // it is one the shuttle would already have dropped off the feed with. This
    // comes before the duty flag, because an off-duty report that old says
    // nothing about what the driver is doing now.
    if (age.ageMs !== null && age.ageMs > FEED_REPORT_WINDOW_MS) {
      return { ...empty, state: 'no-contact', location, ...age };
    }

    if (poll.vehicle.onDuty === false) {
      // An explicit off-duty report is the only trustworthy way to say the
      // driver is on a break rather than out of contact.
      return { ...empty, state: 'off-duty', location, ...age };
    }

    const outOfDate =
      poll.vehicle.stale ||
      (age.ageMs !== null && age.ageMs > CONTACT_STALE_MS);
    return {
      ...empty,
      state: outOfDate ? 'out-of-date' : 'reporting',
      location,
      ...age,
    };
  }

  // A position the feed served before it aged out is still the best answer we
  // have, however long ago it arrived, so it is shown with its real age. Only
  // when there is no such position does the card fall back to saying the feed
  // has nothing inside its window.
  const previous = lastKnown(history, now);
  if (previous.location) {
    return { ...empty, state: 'no-contact', ...previous };
  }
  return { ...empty, state: 'no-report' };
}

function currentAge(vehicle, requestedAt, now) {
  // The server's own measurement is preferred because it carries no clock
  // difference: the server measured the base and the browser measures only the
  // time since we asked.
  const contact = advanceAge(vehicle.contactAgeMs, requestedAt, now);
  if (contact !== null) return { ageMs: contact, ageBasis: 'contact' };

  // The device's own clock, which is not the browser's, so this age is only as
  // good as the two of them agreeing.
  const fix = ageOf(vehicle.fixTimestamp, now);
  if (fix !== null) return { ageMs: fix, ageBasis: 'fix' };

  // Neither age is available, so the only one we can defend is how long ago
  // this page first saw this report.
  const seenAt = finiteOrNull(vehicle.firstSeenAt) ?? requestedAt;
  return { ageMs: ageOf(seenAt, now), ageBasis: 'observation' };
}

function lastKnown(history, now) {
  if (!history || !history.lastVehicle) return { location: null };
  return {
    location: {
      title: history.lastTitle || null,
      coordinates: history.lastVehicle.coordinates,
    },
    ...currentAge(history.lastVehicle, history.lastAskedAt, now),
  };
}

function finiteOrNull(value) {
  return typeof value === 'number' && isFinite(value) ? value : null;
}
