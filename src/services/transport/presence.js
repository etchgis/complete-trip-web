import config from '../../config';

/**
 * The driver tablet presence reads for the call center card.
 *
 * The presence service takes an org-scoped user token. The call center page
 * has no shuttle credentials of its own, so a token is sent when the agent is
 * signed in and the request goes without one otherwise.
 *
 * The rides read is the list of today's rides for the vehicle with their
 * at-risk and notice marks. It is off until an endpoint serves it.
 */
// An error that keeps the HTTP status, so a caller can tell a vehicle that is
// not listed (404) from one that could not be read.
const requestError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const get = async (path, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${config.PRESENCE.url}${path}`, {
    method: 'GET',
    headers,
  });
  let json = null;
  try {
    json = await response.json();
  } catch (e) {
    json = null;
  }
  if (response.status === 200) return json;
  // When the service itself is unhealthy it still says so as a verdict
  // (state unknown, side ours), which the card can show.
  if (response.status === 503 && json && typeof json.state === 'string') return json;
  throw requestError(
    (json && (json.error || json.message)) || 'Could not read driver tablet presence',
    response.status
  );
};

const presence = {
  // Anonymous. Returns only state, reason, since, evaluatedAt, side and
  // lastHeardAt, so it is what a page that is not signed in reads.
  publicStatus(vehicleId) {
    return get(`/presence/public/vehicles/${encodeURIComponent(vehicleId)}/status`, null);
  },

  verdict(vehicleId, token) {
    return get(`/presence/vehicles/${encodeURIComponent(vehicleId)}/verdict`, token);
  },

  timeline(vehicleId, from, to, token) {
    return get(
      `/presence/vehicles/${encodeURIComponent(vehicleId)}/timeline?from=${from}&to=${to}`,
      token
    );
  },

  // There is no endpoint for this yet; the call is only made when
  // config.PRESENCE.ridesEnabled is on.
  rides(vehicleId, token) {
    return get(`/presence/vehicles/${encodeURIComponent(vehicleId)}/rides`, token);
  },
};

export default presence;
