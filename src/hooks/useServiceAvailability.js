import { useEffect, useState } from 'react';

import { readAvailability } from '../models/shuttle-status';
import shuttle from '../services/transport/shuttle';

// How long a screen waits for the availability check before treating it as
// unanswered. Each caller decides what an unanswered check means for it.
export const AVAILABILITY_CHECK_TIMEOUT_MS = 5000;

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
export const checkServiceAvailability = async (
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
    return availabilityVerdict(readAvailability(body));
  } catch (e) {
    console.warn('[service-availability] availability request failed', e);
    return 'unknown';
  } finally {
    clearTimeout(timer);
  }
};

// The time the community shuttle leg of a plan picks the rider up, or null when
// the plan does not use the shuttle.
const shuttlePickupTime = plan => {
  const legs = plan && Array.isArray(plan.legs) ? plan.legs : [];
  const leg = legs.find(item => item && item.mode === 'HAIL');
  if (!leg) return null;
  return typeof leg.startTime === 'number' && isFinite(leg.startTime)
    ? leg.startTime
    : null;
};

/**
 * Drops trip plans whose community shuttle pickup falls at a time the
 * availability check says the shuttle is not running.
 *
 * The pickup time is only known once the planner has built a plan. For an
 * arrive-by trip it is earlier than the time the rider picked, and for a trip
 * that rides a bus first it is later, so each plan is checked at its own
 * pickup. A check that fails or does not answer keeps the plan, because these
 * are plans and nothing is booked from them.
 *
 * @param {object[]} plans the planner's results
 * @param {string} serviceId the shuttle service
 * @returns {Promise<object[]>} the plans that remain
 */
export const withoutClosedShuttlePickups = async (plans, serviceId) => {
  if (!Array.isArray(plans)) return plans;
  const pickups = [
    ...new Set(plans.map(shuttlePickupTime).filter(time => time !== null)),
  ];
  if (pickups.length === 0) return plans;

  const verdicts = new Map(
    await Promise.all(
      pickups.map(async time => [
        time,
        await checkServiceAvailability(serviceId, time),
      ])
    )
  );
  return plans.filter(plan => {
    const time = shuttlePickupTime(plan);
    return time === null || verdicts.get(time) !== 'unavailable';
  });
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
