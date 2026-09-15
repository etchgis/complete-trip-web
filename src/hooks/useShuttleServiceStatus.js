import { useEffect, useRef, useState } from 'react';

import {
  carryReportAge,
  deriveStatus,
  readAvailability,
  readVehicle,
} from '../models/shuttle-status';
import { geocoder } from '../services/transport';
import shuttle from '../services/transport/shuttle';

// The feeds are polled on this cadence and the displayed age is advanced on the
// same beat, so one timer serves both. Ten seconds costs nothing next to the
// requests it already makes, and the card shows whole minutes, so the age on
// screen is never more than ten seconds behind the truth.
export const POLL_INTERVAL_MS = 10000;

// After a failed request the next one waits this multiple of the last wait, up
// to the cap. A feed that is down stays down for minutes at a time, and every
// agent with the page open is asking the same service, so hammering it every
// ten seconds only makes the outage harder to come back from.
const BACKOFF_FACTOR = 2;
export const MAX_BACKOFF_MS = 2 * 60 * 1000;

// Two positions this close together get the same street address, so there is no
// reason to ask the geocoder again. Four decimal places is about eleven meters,
// which is inside one address, and coarse enough that a shuttle working the
// same loop keeps hitting the addresses it already resolved.
const COORDINATE_PRECISION = 4;

// How long to wait for a street address before showing the coordinates
// instead. The lookup runs beside the status poll, never in front of it.
export const GEOCODE_TIMEOUT_MS = 5000;

// How many resolved addresses to keep. A route's worth of stops and corners
// fits comfortably, and the oldest is dropped once it does not.
const TITLE_CACHE_LIMIT = 200;

// Tracks failures for one endpoint, so a broken endpoint only slows down the
// requests to itself.
const createBackoff = () => ({ failures: 0, nextAttemptAt: 0 });

const recordAttempt = (backoff, succeeded) => {
  if (succeeded) {
    backoff.failures = 0;
    backoff.nextAttemptAt = 0;
    return;
  }
  backoff.failures += 1;
  backoff.nextAttemptAt =
    Date.now() +
    Math.min(POLL_INTERVAL_MS * BACKOFF_FACTOR ** backoff.failures, MAX_BACKOFF_MS);
};

/**
 * Polls the shuttle service and vehicle feeds and reports what a call center
 * agent can honestly be told about the service right now.
 *
 * The hook keeps the last position it was served. The feed withholds anything
 * older than a few minutes, so that memory is what lets the card go on showing
 * a last known location once the feed has stopped answering for it.
 *
 * @param {object} options
 * @param {boolean} options.enabled whether to poll at all
 * @param {string} options.serviceId the shuttle service
 * @param {string} options.tripId the trip within that service
 * @param {string} options.organizationId the org the service belongs to
 * @param {Function} [options.onFeature] receives a GeoJSON FeatureCollection of
 *   the shuttle for the map, empty when the feed answered and reported nothing
 * @returns {object} the status object the card renders
 */
const useShuttleServiceStatus = ({
  enabled,
  serviceId,
  tripId,
  organizationId,
  onFeature,
}) => {
  const [poll, setPoll] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const historyRef = useRef({});
  const titleCacheRef = useRef(new Map());
  const featureHandlerRef = useRef(onFeature);

  useEffect(() => {
    featureHandlerRef.current = onFeature;
  }, [onFeature]);

  useEffect(() => {
    if (!enabled) return undefined;

    let canceled = false;
    // One request at a time. A slow answer would otherwise have the next tick
    // start another, and the two could land out of order and put a position
    // back that the card had already moved on from.
    let inFlight = false;
    const serviceBackoff = createBackoff();
    const vehicleBackoff = createBackoff();

    // The latest answer from each endpoint. When one endpoint is waiting out a
    // backoff, its last answer is shown alongside a fresh answer from the other.
    let serviceAnswer;
    let feedAnswer = null;

    const publishFeature = (vehicle, title) => {
      const handler = featureHandlerRef.current;
      if (!handler) return;
      try {
        handler({
          type: 'FeatureCollection',
          features: vehicle
            ? [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: vehicle.coordinates },
                properties: { title, icon: 'shuttle-live' },
              },
            ]
            : [],
        });
      } catch (e) {
        // The map can refuse the update, for example before its shuttle layer
        // exists. The card is still right, so the failure stays with the map.
        console.warn('[shuttle-status] the map did not accept the shuttle', e);
      }
    };

    const coordinateKey = coordinates =>
      coordinates.map(value => value.toFixed(COORDINATE_PRECISION)).join(',');

    // Addresses being looked up right now, so a slow lookup is not started a
    // second time by the next poll.
    const pendingTitles = new Set();

    const lookUpTitle = async coordinates => {
      let timer;
      try {
        const timeout = new Promise((resolve, reject) => {
          timer = setTimeout(
            () => reject(new Error(`no answer after ${GEOCODE_TIMEOUT_MS} ms`)),
            GEOCODE_TIMEOUT_MS
          );
        });
        const results = await Promise.race([
          geocoder.reverse({ lat: coordinates[1], lng: coordinates[0] }),
          timeout,
        ]);
        return {
          ok: true,
          title:
            Array.isArray(results) && results.length > 0 ? results[0].title : null,
        };
      } catch (e) {
        // The address we hold belongs to a different place than the one we were
        // just asked about, so reusing it would put an old street name under a
        // new position. The card shows the coordinates instead, which are at
        // least true.
        console.warn('[shuttle-status] reverse geocode failed', e);
        return { ok: false, title: null };
      } finally {
        clearTimeout(timer);
      }
    };

    // Looks up the address for a position and, when it arrives, puts it on the
    // card if the card is still showing that position. Nothing waits on this.
    const resolveTitle = async coordinates => {
      const key = coordinateKey(coordinates);
      if (pendingTitles.has(key)) return;
      pendingTitles.add(key);
      const { ok, title } = await lookUpTitle(coordinates);
      pendingTitles.delete(key);
      if (canceled || !ok) return;

      const cache = titleCacheRef.current;
      if (cache.size >= TITLE_CACHE_LIMIT) {
        cache.delete(cache.keys().next().value);
      }
      cache.set(key, title);

      const history = historyRef.current;
      if (history.lastVehicle && coordinateKey(history.lastVehicle.coordinates) === key) {
        historyRef.current = { ...history, lastTitle: title };
      }
      if (
        !feedAnswer ||
        !feedAnswer.vehicle ||
        coordinateKey(feedAnswer.vehicle.coordinates) !== key
      ) {
        return;
      }
      feedAnswer = { ...feedAnswer, title };
      setPoll(current =>
        current && current.vehicle && coordinateKey(current.vehicle.coordinates) === key
          ? { ...current, title }
          : current
      );
    };

    const readService = async () => {
      try {
        return readAvailability(await shuttle.availability(serviceId));
      } catch (e) {
        console.warn('[shuttle-status] availability request failed', e);
        return null;
      }
    };

    const readPosition = async () => {
      try {
        const response = await shuttle.vehicles(serviceId, tripId, organizationId);
        return { ok: true, vehicle: readVehicle(response) };
      } catch (e) {
        console.warn('[shuttle-status] vehicle feed request failed', e);
        return { ok: false, vehicle: null };
      }
    };

    const fetchStatus = async (askService, askVehicles) => {
      const requestedAt = Date.now();
      const [availability, feed] = await Promise.all([
        askService ? readService() : undefined,
        askVehicles ? readPosition() : undefined,
      ]);
      if (canceled) return;

      if (askService) {
        recordAttempt(serviceBackoff, availability !== null);
        serviceAnswer = availability;
      }

      let published = false;
      let lookUp = null;
      if (askVehicles) {
        recordAttempt(vehicleBackoff, feed.ok);
        if (feed.ok) {
          const history = historyRef.current;
          const vehicle = carryReportAge(
            history.lastVehicle
              ? { vehicle: history.lastVehicle, requestedAt: history.lastAskedAt }
              : null,
            { vehicle: feed.vehicle, requestedAt }
          );
          // A known address is used straight away. An unknown one is looked up
          // on the side and filled in when it arrives.
          const key = vehicle ? coordinateKey(vehicle.coordinates) : null;
          const cache = titleCacheRef.current;
          const title = key !== null && cache.has(key) ? cache.get(key) : null;
          if (key !== null && !cache.has(key)) lookUp = vehicle.coordinates;

          feedAnswer = { ok: true, vehicle, title, requestedAt };
          if (vehicle) {
            historyRef.current = {
              ...historyRef.current,
              lastVehicle: vehicle,
              lastAskedAt: requestedAt,
              lastTitle: title,
            };
          }
          published = true;
        } else {
          feedAnswer = { ok: false, vehicle: null, title: null, requestedAt };
        }
      }

      // The card is updated before the map, so a map that throws cannot leave
      // the card stuck on its last state.
      setPoll({
        availability: serviceAnswer ?? null,
        vehicleFeedOk: feedAnswer.ok,
        vehicle: feedAnswer.vehicle,
        title: feedAnswer.title,
        requestedAt: feedAnswer.requestedAt,
      });
      setNow(Date.now());

      // Only an answer clears the map. A request that failed says nothing about
      // where the shuttle is, and wiping the marker would tell an agent it has
      // gone when all that happened is that we could not ask.
      if (published) publishFeature(feedAnswer.vehicle, feedAnswer.title);
      if (lookUp) resolveTitle(lookUp);
    };

    const tick = () => {
      // A tab nobody is looking at has nobody to mislead, and this page is open
      // on every agent's desk all day. Its clock stands still too, so a
      // position is not aged on screen by minutes in which nobody asked for a
      // newer one.
      if (document.visibilityState === 'hidden') return;

      const at = Date.now();
      const askService = serviceAnswer === undefined || at >= serviceBackoff.nextAttemptAt;
      const askVehicles = feedAnswer === null || at >= vehicleBackoff.nextAttemptAt;

      if (inFlight || (!askService && !askVehicles)) {
        // Nothing new to ask for, but the age on screen keeps counting up
        // instead of freezing at the last good poll.
        setNow(at);
        return;
      }

      inFlight = true;
      fetchStatus(askService, askVehicles)
        .catch(e => {
          console.warn('[shuttle-status] the status update failed', e);
        })
        .finally(() => {
          inFlight = false;
        });
    };

    // Coming back to the tab should show the shuttle now, not up to ten seconds
    // from now. Someone has just looked, so any backoff is dropped and both
    // endpoints are asked straight away.
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      serviceBackoff.nextAttemptAt = 0;
      vehicleBackoff.nextAttemptAt = 0;
      tick();
    };

    tick();
    const intervalId = setInterval(tick, POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      canceled = true;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [enabled, serviceId, tripId, organizationId]);

  return deriveStatus({ poll, history: historyRef.current, now });
};

export default useShuttleServiceStatus;
