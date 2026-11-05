import { useEffect, useState } from 'react';

import {
  readMarkedRides,
  readTimeline,
  readVerdict,
} from '../models/presence-status';
import presence from '../services/transport/presence';

export const PRESENCE_POLL_MS = 10000;

const startOfDay = (now, timeZone) => {
  // The service day is the local day at the shuttle, not the agent's browser.
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(now));
  const get = type => Number(parts.find(p => p.type === type).value) % 24;
  return now - ((get('hour') * 60 + get('minute')) * 60 + get('second')) * 1000;
};

/**
 * Polls the presence verdict, today's timeline and the marked rides for one
 * vehicle. Each read stands alone: one that fails leaves the others showing and
 * is reported as unavailable, never as an empty answer.
 *
 * @param {object} options
 * @param {boolean} options.enabled
 * @param {string} options.vehicleId
 * @param {string} options.timeZone the time zone of the service day
 * @param {Function} [options.getToken] resolves the signed in agent's token
 * @param {boolean} [options.ridesEnabled] whether to read the marked rides
 * @returns {object} { loading, verdict, timeline, rides, signedIn, now }
 */
const usePresence = ({ enabled, vehicleId, timeZone, getToken, ridesEnabled = false }) => {
  const [answer, setAnswer] = useState({
    loading: true,
    verdict: null,
    timeline: null,
    rides: null,
    signedIn: false,
  });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled || !vehicleId) return undefined;
    let canceled = false;
    let inFlight = false;

    const attempt = async fn => {
      try {
        return await fn();
      } catch (e) {
        console.warn('[presence] request failed', e);
        return null;
      }
    };

    // The anonymous status. A vehicle that is not on the allowlist answers 404,
    // which reads as "not listed" rather than as a failure.
    const readPublic = async () => {
      try {
        return await presence.publicStatus(vehicleId);
      } catch (e) {
        if (e && e.status === 404) {
          return { state: 'unknown', reason: 'not_listed', side: null };
        }
        console.warn('[presence] request failed', e);
        return null;
      }
    };

    const tick = async () => {
      if (document.visibilityState === 'hidden') return;
      if (inFlight) {
        setNow(Date.now());
        return;
      }
      inFlight = true;
      try {
        const token = getToken ? await attempt(getToken) : null;
        const at = Date.now();
        const publicOnly = async () => {
          const pub = await readPublic();
          if (canceled) return;
          const readAt = Date.now();
          setAnswer({
            loading: false,
            verdict: readVerdict(pub, readAt),
            timeline: null,
            rides: null,
            signedIn: false,
          });
          setNow(readAt);
        };
        if (!token) {
          // Not signed in: only the anonymous status is read, so nothing
          // about the shift, the tablet or the rides is requested.
          await publicOnly();
          return;
        }
        const from = startOfDay(at, timeZone);
        const [verdict, timeline, rides] = await Promise.all([
          attempt(() => presence.verdict(vehicleId, token)),
          attempt(() => presence.timeline(vehicleId, from, at, token)),
          ridesEnabled ? attempt(() => presence.rides(vehicleId, token)) : null,
        ]);
        if (canceled) return;
        if (!verdict) {
          // The token was not accepted or the read failed; the anonymous
          // status still says whether the tablet is reporting.
          await publicOnly();
          return;
        }
        const readAt = Date.now();
        setAnswer({
          loading: false,
          verdict: readVerdict(verdict, readAt),
          timeline: readTimeline(timeline),
          rides: rides ? readMarkedRides(rides) : null,
          signedIn: true,
        });
        setNow(readAt);
      } finally {
        inFlight = false;
      }
    };

    tick();
    const id = setInterval(tick, PRESENCE_POLL_MS);
    return () => {
      canceled = true;
      clearInterval(id);
    };
  }, [enabled, vehicleId, timeZone, getToken, ridesEnabled]);

  return { ...answer, now };
};

export default usePresence;
