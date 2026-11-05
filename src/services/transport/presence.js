import config from '../../config';

/**
 * The driver tablet presence reads for the call center card.
 *
 * The presence service takes an org-scoped user token. The call center page
 * has no shuttle credentials of its own, so a token is sent when the agent is
 * signed in and the request goes without one otherwise.
 *
 * The rides read is the list of today's rides for the vehicle with their
 * at-risk and notice marks.
 */
const get = async (path, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${config.PRESENCE.url}${path}`, {
    method: 'GET',
    headers,
  });
  const json = await response.json();
  if (response.status === 200) return json;
  throw json?.message || 'Could not read driver tablet presence';
};

const presence = {
  verdict(vehicleId, token) {
    return get(`/presence/vehicles/${encodeURIComponent(vehicleId)}/verdict`, token);
  },

  timeline(vehicleId, from, to, token) {
    return get(
      `/presence/vehicles/${encodeURIComponent(vehicleId)}/timeline?from=${from}&to=${to}`,
      token
    );
  },

  rides(vehicleId, token) {
    return get(`/presence/vehicles/${encodeURIComponent(vehicleId)}/rides`, token);
  },
};

export default presence;
