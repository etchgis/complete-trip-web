import config from '../../config';

/**
 * The two shuttle reads the call center card needs.
 *
 * These are separate questions with separate answers. Whether the service is
 * meant to be running comes from the schedule and the driver's duty signal;
 * where the shuttle is comes from the vehicle feed. One can be true while the
 * other is not, and an agent on the phone needs to see both.
 *
 * Neither endpoint takes a token. They are scoped by the service id in the
 * path. The organization header is advisory: the service resolves the
 * organization from the service id and overrides whatever the header said. It
 * is sent anyway, and with the same organization every other skids call in this
 * app sends, so a request that turns up in a log is attributable.
 */
const shuttle = {
  /**
   * Whether the service is running, per the published operating hours, any
   * service alert, and whether a driver is on duty. The driver duty part only
   * applies to times within a few minutes of now.
   *
   * @param {string} serviceId the shuttle service
   * @param {number} [at] the time to ask about, in epoch milliseconds; now when
   *   left out
   * @returns {Promise<object>} the availability check body
   */
  availability(serviceId, at) {
    const query = typeof at === 'number' && isFinite(at) ? `?timestamp=${at}` : '';
    return fetch(
      `${config.SERVICES.skids.url}/services/availability/${serviceId}/check${query}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    ).then(async response => {
      const json = await response.json();
      if (response.status === 200) return json;
      throw json?.message || 'Could not read shuttle availability';
    });
  },

  /**
   * The shuttle's position.
   *
   * `includeStale` is what keeps a parked shuttle on screen. The driver app
   * only transmits while the vehicle is moving, so without it the feed drops a
   * vehicle one minute after it stops and the card has nothing to show. With
   * it the feed keeps reporting for five minutes and adds `ageSeconds` and
   * `lastSeenTs`, so the card can say how old the position is instead of
   * calling it unknown. Five minutes is the service's own cap; there is no
   * parameter for asking it to go back further.
   *
   * The trip id scopes the request but not the answer: the feed replies with
   * every vehicle the organization's drivers are signed into, so the caller has
   * to choose among them.
   *
   * @param {string} serviceId the shuttle service
   * @param {string} tripId the trip within that service
   * @param {string} organizationId the organization the service belongs to
   * @returns {Promise<object>} the trips feed body
   */
  vehicles(serviceId, tripId, organizationId) {
    const uri =
      `${config.SERVICES.skids.url}/feed/${serviceId}/trips/${tripId}` +
      `?includeStale=true&timestamp=${Date.now()}`;
    return fetch(uri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Organization-Id': organizationId,
      },
    }).then(async response => {
      const json = await response.json();
      if (response.status === 200) return json;
      throw json?.message || 'Could not read the shuttle vehicle feed';
    });
  },
};

export default shuttle;
