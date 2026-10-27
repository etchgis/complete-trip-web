import config from '../../config';

/**
 * Reads for the All Access Loop (AAL), the self-driving shuttle: its route
 * with stops, and the live position of a vehicle.
 *
 * Neither read takes a token. The organization header is sent with the same
 * value every other skids call in this app sends.
 */
function getJson(path, organizationId, errorMessage) {
  return fetch(`${config.SERVICES.skids.url}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Organization-Id': organizationId,
    },
  }).then(async response => {
    const json = await response.json();
    if (response.status === 200) return json;
    throw json?.message || errorMessage;
  });
}

const aal = {
  /**
   * The route of a service, with its path and stops.
   *
   * @param {string} serviceId the AAL service
   * @param {string} organizationId the organization the service belongs to
   * @returns {Promise<object>} the routes feed body
   */
  route(serviceId, organizationId) {
    return getJson(
      `/feed/routes?serviceIds=${serviceId}`,
      organizationId,
      'Could not read the AAL route'
    );
  },

  /**
   * The latest position of one vehicle. The body is empty when the vehicle is
   * not running. The timestamp param keeps a cache from serving an old
   * position.
   *
   * @param {string} vehicleId the vehicle to read
   * @param {string} organizationId the organization the service belongs to
   * @returns {Promise<object>} the vehicle position body
   */
  vehiclePosition(vehicleId, organizationId) {
    return getJson(
      `/ubshuttle/vehicleposition/${vehicleId}?timestamp=${Date.now()}`,
      organizationId,
      'Could not read the AAL vehicle position'
    );
  },
};

export default aal;
