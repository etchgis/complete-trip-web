import config from '../../config';

// Raised when the ride request does not come back as a created ride. It carries
// the HTTP status when the server answered, and `retryable` says whether the
// caller may send the same idempotency key again. A 409 means another request
// with this key is still being processed, and a dropped connection or an
// unreadable reply leaves the ride's outcome unknown; both are retryable
// because the key lets the server dedupe the retry. Any other answer is a
// definitive refusal.
export class RideRequestError extends Error {
  constructor(message, { status = null, retryable = false } = {}) {
    super(message);
    this.name = 'RideRequestError';
    this.status = status;
    this.retryable = retryable;
  }
}

const rides = {

  request(organizationId, datetime, direction, pickup, dropoff, driverId, passengers, phone, pin, idempotencyKey) {
    const body = {
      organization: organizationId,
      passengers: passengers || 1,
      datetime,
      direction,
      pickup,
      dropoff,
      status: 'scheduled',
      phone,
      pin
    };
    if (driverId) {
      body.driver = driverId;
    }
    const headers = {
      // Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'x-api-key': config.SERVICES.rides.xApiKey,
    };
    // The caller sends one key per booking and reuses it when it retries, so a
    // retry after a lost reply returns the first ride instead of booking again.
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    return fetch(`${config.SERVICES.rides.url}/request`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    }).then(async (response) => {
      if (response.status === 200) {
        const json = await response.json();
        fetch(`${config.SERVICES.plans.url}/ride/${json.id}`, {
          method: 'PATCH',
          headers: {
            // Authorization: `Bearer ${accessToken}`,
            'X-Organization-Id': organizationId,
            // 'x-api-key': config.SERVICES.plans.xApiKey,
          },
        });
        return json;
      }
      // A 409 means a request with the same key is still being processed.
      // Retrying with that key resolves to its ride once it records, so the
      // caller is told to keep the key rather than treat this as a failure.
      if (response.status === 409) {
        throw new RideRequestError('ride request still processing', {
          status: 409,
          retryable: true,
        });
      }
      const json = await response.json().catch(() => null);
      throw new RideRequestError(json?.message || json?.error?.message, {
        status: response.status,
      });
    }).catch((err) => {
      // A definitive refusal is passed through unchanged. Anything else is a
      // dropped connection or a reply we could not read, which leaves the
      // ride's outcome unknown, so it is marked retryable with the same key.
      if (err instanceof RideRequestError) throw err;
      throw new RideRequestError(err?.message, { retryable: true });
    });
  },

};

export default rides;
