import { useEffect, useState } from 'react';

import config from '../config';
import { readAvailability } from '../models/shuttle-status';
import shuttle from '../services/transport/shuttle';

// How long a screen waits for the availability check before treating it as
// unanswered. Each caller decides what an unanswered check means for it.
export const AVAILABILITY_CHECK_TIMEOUT_MS = 5000;

// How many availability checks a single trip search has out at once. A search
// can produce a dozen shuttle legs, and every agent and kiosk asks the same
// service, so they go out a few at a time rather than all together.
export const MAX_PARALLEL_CHECKS = 4;

/**
 * The services a trip plan can ride, and how a leg says it is riding one.
 *
 * A plan can use more than one of these, so each leg is checked against the
 * service it actually uses. `name` is the locale key the copy names it by.
 */
export const PLAN_SHUTTLE_SERVICES = [
  {
    key: 'hail',
    serviceId: config.HDS_SERVICE_ID,
    name: 'settingsPreferences.hail',
    usedBy: leg => leg.mode === 'HAIL',
  },
  {
    key: 'ubshuttle',
    serviceId: config.UB_SHUTTLE_SERVICE_ID,
    name: 'settingsPreferences.ubshuttle',
    usedBy: leg => leg.mode === 'ubshuttle',
  },
];

/**
 * Reduces an availability check to the answer a booking screen needs.
 *
 * 'unknown' covers a check that failed, a check that did not answer in time,
 * and a service the check holds no hours for. Each screen chooses what to do
 * with it: the trip planner still offers the shuttle and says the hours could
 * not be confirmed, while the kiosk refuses to send one.
 *
 * @param {object|null} availability the result of readAvailability
 * @returns {'available'|'unavailable'|'unknown'}
 */
export const availabilityVerdict = availability => {
  if (!availability || availability.configured === false) return 'unknown';
  return availability.running ? 'available' : 'unavailable';
};

/**
 * Asks the availability check whether a service runs at a given time.
 *
 * @param {string} serviceId the service to ask about
 * @param {number} [at] epoch milliseconds; now when left out
 * @param {object} [options]
 * @param {number} [options.timeoutMs] how long to wait before giving up
 * @returns {Promise<'available'|'unavailable'|'unknown'>}
 */
export const checkServiceAvailability = async (serviceId, at, options) =>
  (await readServiceAvailability(serviceId, at, options)).verdict;

/**
 * The same check as `checkServiceAvailability`, keeping the answer the service
 * gave so a caller can say why it is closed and when it reopens.
 *
 * @returns {Promise<object>} { verdict, availability } where availability is
 *   the reading of the check's answer, or null when there is none
 */
export const readServiceAvailability = async (
  serviceId,
  at,
  { timeoutMs = AVAILABILITY_CHECK_TIMEOUT_MS } = {}
) => {
  let timer;
  try {
    const timeout = new Promise((resolve, reject) => {
      timer = setTimeout(
        () => reject(new Error(`no answer after ${timeoutMs} ms`)),
        timeoutMs
      );
    });
    const body = await Promise.race([shuttle.availability(serviceId, at), timeout]);
    const availability = readAvailability(body);
    return { verdict: availabilityVerdict(availability), availability };
  } catch (e) {
    console.warn('[service-availability] availability request failed', e);
    return { verdict: 'unknown', availability: null };
  } finally {
    clearTimeout(timer);
  }
};

// The published hours are in whole minutes, so two pickups in the same minute
// get the same answer and are asked about once.
const pickupMinute = time => Math.floor(time / 60000) * 60000;

// Every shuttle service a plan rides, with the minute it is picked up at. A
// plan can ride more than one, and a plan can ride the same one twice.
const shuttleRides = plan => {
  const legs = plan && Array.isArray(plan.legs) ? plan.legs : [];
  const rides = [];
  legs.forEach(leg => {
    if (!leg || typeof leg.startTime !== 'number' || !isFinite(leg.startTime)) {
      return;
    }
    const service = PLAN_SHUTTLE_SERVICES.find(candidate => candidate.usedBy(leg));
    if (service) rides.push({ service, at: pickupMinute(leg.startTime) });
  });
  return rides;
};

// Runs the checks a few at a time, in the order they were asked for.
const inBatches = async (items, size, run) => {
  const results = [];
  for (let i = 0; i < items.length; i += size) {
    // eslint-disable-next-line no-await-in-loop
    results.push(...(await Promise.all(items.slice(i, i + size).map(run))));
  }
  return results;
};

/**
 * Drops trip plans that ride a shuttle at a time its service says it is closed,
 * and reports what was dropped so the rider can be told why.
 *
 * A pickup time is only known once the planner has built a plan. For an
 * arrive-by trip it is earlier than the time the rider picked, and for a trip
 * that rides a bus first it is later, so every shuttle leg is checked at its
 * own pickup time, against the service that leg rides.
 *
 * A check that fails or does not answer makes the whole of that service's
 * results unconfirmed: every plan riding it is kept and the screen says the
 * hours could not be confirmed. Dropping a 2:35 pickup the check called closed
 * while keeping a 2:40 pickup whose check timed out would show the rider a
 * later shuttle than the one that was taken away, which reads as a mistake and
 * cannot be explained. Keeping them all is the same fail-open these plans
 * already use, and nothing is booked from a plan: a kiosk summon asks again
 * before it creates a ride.
 *
 * @param {object[]} plans the planner's results
 * @returns {Promise<object>} { plans, closed, unconfirmed } where `closed`
 *   describes the earliest dropped pickup and `unconfirmed` names the services
 *   whose checks failed
 */
export const screenShuttlePickups = async plans => {
  const empty = { plans, closed: null, unconfirmed: [] };
  if (!Array.isArray(plans)) return empty;

  const rides = plans.flatMap(shuttleRides);
  const asked = new Map();
  rides.forEach(ride => {
    asked.set(`${ride.service.key}|${ride.at}`, ride);
  });
  if (asked.size === 0) return empty;

  const answers = new Map();
  const questions = [...asked.entries()];
  const results = await inBatches(
    questions,
    MAX_PARALLEL_CHECKS,
    async ([, ride]) => readServiceAvailability(ride.service.serviceId, ride.at)
  );
  questions.forEach(([key], i) => answers.set(key, results[i]));

  const unanswered = new Set(
    questions
      .filter(([key]) => answers.get(key).verdict === 'unknown')
      .map(([, ride]) => ride.service.key)
  );

  const dropped = [];
  const kept = plans.filter(plan => {
    const closed = shuttleRides(plan).find(ride => {
      if (unanswered.has(ride.service.key)) return false;
      return answers.get(`${ride.service.key}|${ride.at}`).verdict === 'unavailable';
    });
    if (closed) {
      dropped.push({
        ...closed,
        availability: answers.get(`${closed.service.key}|${closed.at}`).availability,
      });
    }
    return !closed;
  });

  const keptRides = kept.flatMap(shuttleRides);
  return {
    plans: kept,
    // The earliest dropped pickup, which is the one a rider asked for closest
    // to the time they picked.
    closed: dropped.sort((a, b) => a.at - b.at)[0] || null,
    unconfirmed: [
      ...new Set(
        keptRides
          .filter(ride => unanswered.has(ride.service.key))
          .map(ride => ride.service.key)
      ),
    ],
  };
};

/**
 * Whether a service runs at the time a rider has picked, kept up to date as the
 * time changes.
 *
 * The time is compared to the minute, because the published hours are in whole
 * minutes, so editing the seconds of a time does not ask again. Leaving the
 * time out asks nothing and answers 'not-asked'.
 *
 * @param {string} serviceId the service to ask about
 * @param {Date|number|string|null} when the time to ask about
 * @returns {'not-asked'|'loading'|'available'|'unavailable'|'unknown'}
 */
const useServiceAvailability = (serviceId, when) => {
  const skip = when === undefined || when === null;
  const time = skip ? NaN : new Date(when).getTime();
  const minute = isFinite(time) ? Math.floor(time / 60000) : null;
  const key = `${serviceId}|${skip ? 'skip' : minute}`;

  const [answer, setAnswer] = useState({ key: null, verdict: 'loading' });

  useEffect(() => {
    if (skip) return undefined;
    if (minute === null) {
      setAnswer({ key, verdict: 'unknown' });
      return undefined;
    }
    let canceled = false;
    checkServiceAvailability(serviceId, minute * 60000).then(verdict => {
      if (!canceled) setAnswer({ key, verdict });
    });
    return () => {
      canceled = true;
    };
  }, [serviceId, minute, key, skip]);

  if (skip) return 'not-asked';
  // An answer about a different time is not an answer about this one.
  return answer.key === key ? answer.verdict : 'loading';
};

export default useServiceAvailability;
