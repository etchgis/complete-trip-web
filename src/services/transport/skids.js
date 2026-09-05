import config from '../../config';

/**
 * Client for the skids transit API. Every request is scoped to an
 * organization, which callers pass in as config.ORGANIZATION.
 */

/**
 * @param {string} path
 * @param {string} organizationId
 * @param {string} errorMessage thrown when the body parses as JSON and the
 *   status is not 200. A response that is not JSON at all rejects earlier, with
 *   the parse error.
 */
function getJson(path, organizationId, errorMessage) {
  return fetch(`${config.SERVICES.skids}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Organization-Id': organizationId,
    },
  }).then(async response => {
    const json = await response.json();
    if (response.status === 200) {
      return json;
    }
    throw errorMessage;
  });
}

// Responses carrying live vehicle or arrival times are cached upstream, so
// they get a changing query param to force a fresh read.
function cacheBuster() {
  return `timestamp=${Date.now()}`;
}

/**
 * skids returns bare coordinate arrays. Add the matching GeoJSON geometry so
 * callers can hand the result straight to the map.
 */
function addFeedGeometry(json) {
  const feed = json;
  if (json.coordinates) {
    feed.geometry = {
      type: 'LineString',
      coordinates: json.coordinates,
    };
  }
  if (json.stops) {
    for (let i = 0; i < json.stops.length; i++) {
      const stop = json.stops[i];
      if (stop.coordinates) {
        feed.stops[i].geometry = {
          type: 'Point',
          coordinates: stop.coordinates,
        };
      }
    }
  }
  return feed;
}

/**
 * The nearby-services response carries each service's location as a bare
 * coordinate pair. Add the matching GeoJSON geometry, as addFeedGeometry does
 * for a pattern.
 */
function addServiceGeometry(services) {
  return services.map(service => {
    if (service?.location?.coordinates) {
      service.location.geometry = {
        type: 'Point',
        coordinates: service.location.coordinates,
      };
    }
    return service;
  });
}

const feeds = {
  /**
   * Get one pattern of a service: its shape, its stops, and the current and
   * next stop times.
   * @param {string} id service id
   * @param {string} patternId
   * @param {string} organizationId
   */
  get: (id, patternId, organizationId) =>
    getJson(
      `/feed/${id}/patterns/${patternId}?${cacheBuster()}`,
      organizationId,
      'Unknown Skids error: feeds'
    ).then(addFeedGeometry),
};

const services = {
  /**
   * Get the services running within a radius of a point.
   * @param {number} longitude
   * @param {number} latitude
   * @param {number} kilometers
   * @param {string} organizationId
   */
  byDistance: (longitude, latitude, kilometers, organizationId) =>
    getJson(
      `/nearby/services?lon=${longitude}&lat=${latitude}&kilometers=${kilometers}`,
      organizationId,
      'Unknown Skids error: services.byDistance'
    ).then(json => addServiceGeometry(json?.services || [])),
};

const trips = {
  /**
   * Get one trip of a service, including the vehicles currently running it.
   *
   * A driver app only reports while the vehicle moves, so a shuttle waiting at
   * a stop sends nothing and drops out of the response. Pass includeStale to
   * get its last known position back instead. Those vehicles come marked
   * `stale` with an `ageSeconds`, and must be shown as a last known location
   * rather than a live one.
   *
   * @param {string} id service id
   * @param {string} tripId
   * @param {string} organizationId
   * @param {{includeStale?: boolean}} [options]
   */
  get: (id, tripId, organizationId, options = {}) => {
    const stale = options.includeStale ? '&includeStale=true' : '';
    return getJson(
      `/feed/${id}/trips/${tripId}?${cacheBuster()}${stale}`,
      organizationId,
      'Unknown Skids error: trips'
    );
  },
};

const skids = {
  feeds,
  services,
  trips,
};

export default skids;
