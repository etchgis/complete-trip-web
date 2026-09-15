import { useEffect, useState } from 'react';

import { readAvailability } from '../models/shuttle-status';
import shuttle from '../services/transport/shuttle';

/**
 * Reduces an availability check to the answer a booking screen needs.
 *
 * 'unknown' covers a check that failed and a service the check holds no hours
 * for. A booking screen offers the service in that case: telling a rider the
 * shuttle is unavailable because a request failed on our side would be a claim
 * nobody checked.
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
 * @returns {Promise<'available'|'unavailable'|'unknown'>}
 */
export const checkServiceAvailability = async (serviceId, at) => {
  try {
    return availabilityVerdict(
      readAvailability(await shuttle.availability(serviceId, at))
    );
  } catch (e) {
    console.warn('[service-availability] availability request failed', e);
    return 'unknown';
  }
};

/**
 * Whether a service runs at the time a rider has picked, kept up to date as the
 * time changes.
 *
 * The time is compared to the minute, because the published hours are in whole
 * minutes, so editing the seconds of a time does not ask again.
 *
 * @param {string} serviceId the service to ask about
 * @param {Date|number|string} when the time to ask about
 * @returns {'loading'|'available'|'unavailable'|'unknown'}
 */
const useServiceAvailability = (serviceId, when) => {
  const time = when === undefined || when === null ? NaN : new Date(when).getTime();
  const minute = isFinite(time) ? Math.floor(time / 60000) : null;
  const key = `${serviceId}|${minute}`;

  const [answer, setAnswer] = useState({ key: null, verdict: 'loading' });

  useEffect(() => {
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
  }, [serviceId, minute, key]);

  // An answer about a different time is not an answer about this one.
  return answer.key === key ? answer.verdict : 'loading';
};

export default useServiceAvailability;
