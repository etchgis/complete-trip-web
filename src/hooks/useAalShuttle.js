import { useEffect, useRef, useState } from 'react';

import {
  AAL_VEHICLE_IDS,
  readAalRoute,
  readAalVehicle,
  toAalVehicleFeatures,
} from '../models/aal-shuttle';
import aal from '../services/transport/aal';

// How often the vehicle positions are asked for. This matches the rider app.
export const AAL_POLL_INTERVAL_MS = 5000;

// The route is fetched once. If that fails, the next try waits twice as long as
// the last wait, up to this cap, so a service that is down is not hammered.
const ROUTE_BACKOFF_FACTOR = 2;
export const AAL_MAX_ROUTE_BACKOFF_MS = 60 * 1000;

const EMPTY_VEHICLES = { type: 'FeatureCollection', features: [] };

/**
 * Loads the All Access Loop route once and polls its vehicle position, handing
 * both to the map.
 *
 * @param {object} options
 * @param {boolean} options.enabled whether to fetch anything at all
 * @param {string} options.serviceId the shuttle service
 * @param {string} options.organizationId the org the service belongs to
 * @param {Function} [options.onRoute] receives { route, stops } once the route
 *   is known
 * @param {Function} [options.onVehicles] receives a FeatureCollection of the
 *   vehicles, empty when the service answered and nothing is running
 * @returns {object} { route, vehicles, loading, error }
 */
const useAalShuttle = ({
  enabled,
  serviceId,
  organizationId,
  onRoute,
  onVehicles,
}) => {
  const [route, setRoute] = useState(null);
  const [vehicles, setVehicles] = useState(EMPTY_VEHICLES);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const routeHandlerRef = useRef(onRoute);
  const vehicleHandlerRef = useRef(onVehicles);

  useEffect(() => {
    routeHandlerRef.current = onRoute;
    vehicleHandlerRef.current = onVehicles;
  }, [onRoute, onVehicles]);

  useEffect(() => {
    if (!enabled) return undefined;

    let canceled = false;
    // One round of requests at a time, so a slow answer cannot be overtaken by
    // the next tick and then land on top of a newer position.
    let inFlight = false;
    let routeLoaded = false;
    let routeFailures = 0;
    let routeNextAttemptAt = 0;

    const callHandler = (ref, value) => {
      const handler = ref.current;
      if (!handler) return;
      try {
        handler(value);
      } catch (e) {
        // The map can refuse an update, for example before its layers exist.
        console.warn('[aal-shuttle] the map did not accept the update', e);
      }
    };

    const loadRoute = async () => {
      try {
        const result = readAalRoute(await aal.route(serviceId, organizationId));
        routeLoaded = true;
        routeFailures = 0;
        if (canceled) return;
        if (result) {
          setRoute(result);
          callHandler(routeHandlerRef, result);
        }
      } catch (e) {
        routeFailures += 1;
        routeNextAttemptAt =
          Date.now() +
          Math.min(
            AAL_POLL_INTERVAL_MS * ROUTE_BACKOFF_FACTOR ** routeFailures,
            AAL_MAX_ROUTE_BACKOFF_MS
          );
        console.warn('[aal-shuttle] route request failed', e);
      }
    };

    const loadVehicles = async () => {
      const results = await Promise.allSettled(
        AAL_VEHICLE_IDS.map(async id =>
          readAalVehicle(await aal.vehiclePosition(id, organizationId), id)
        )
      );
      if (canceled) return;

      const answered = results.filter(r => r.status === 'fulfilled');
      results
        .filter(r => r.status === 'rejected')
        .forEach(r =>
          console.warn('[aal-shuttle] vehicle request failed', r.reason)
        );

      // Only an answer changes the map. A request that failed says nothing
      // about where the shuttle is, so the marker stays where it was.
      if (answered.length === 0) {
        setError('vehicle request failed');
        return;
      }
      const features = toAalVehicleFeatures(
        answered.map(r => r.value).filter(Boolean)
      );
      setError(null);
      setVehicles(features);
      callHandler(vehicleHandlerRef, features);
    };

    const tick = () => {
      // Nobody is looking at a hidden tab, so there is nothing to keep fresh.
      if (document.visibilityState === 'hidden' || inFlight) return;

      inFlight = true;
      const work = [loadVehicles()];
      if (!routeLoaded && Date.now() >= routeNextAttemptAt) {
        work.push(loadRoute());
      }
      Promise.all(work)
        .catch(e => {
          console.warn('[aal-shuttle] the update failed', e);
        })
        .finally(() => {
          inFlight = false;
          if (!canceled) setLoading(false);
        });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      routeNextAttemptAt = 0;
      tick();
    };

    tick();
    const intervalId = setInterval(tick, AAL_POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      canceled = true;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      // Leaving call center mode removes the marker rather than freezing it.
      callHandler(vehicleHandlerRef, EMPTY_VEHICLES);
    };
  }, [enabled, serviceId, organizationId]);

  return { route, vehicles, loading, error };
};

export default useAalShuttle;
