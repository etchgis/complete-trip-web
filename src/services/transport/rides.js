import config from '../../config';
import { GATE_REFUSAL_CODES, RideRequestError } from './rideRequestError';
import { getKioskDeviceCredential, isWalkUpDemoActive } from '../../models/kiosk-walkup';
import { demoPinRequest, demoWalkUpRequest } from './demoRides';

export { RideRequestError, GATE_REFUSAL_CODES };

const rides = {

  request(organizationId, datetime, direction, pickup, dropoff, driverId, passengers, phone, pin, idempotencyKey) {
    // Demo kiosk pages get canned answers and send nothing.
    if (isWalkUpDemoActive()) return demoPinRequest({ phone, pin, idempotencyKey });
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
      // A 409 with a gate refusal code is final instead: it carries the
      // rider-facing message and the same key must not be retried.
      if (response.status === 409) {
        const refusal = await response.json().catch(() => null);
        if (GATE_REFUSAL_CODES.includes(refusal?.code)) {
          throw new RideRequestError(refusal.message, {
            status: 409,
            code: refusal.code,
          });
        }
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

  // Books a ride for a rider at a trusted shared kiosk, using a name and phone
  // number instead of a PIN.
  //
  // NOT BUILT YET: the rides service has no /kiosk/request route today, so a
  // real call would fail. The switch that offers this flow must stay off
  // outside the demo. The Bearer device credential is what the server would
  // trust; the x-api-key is sent only because the gateway requires it, and it
  // is public, so it proves nothing about the caller.
  requestWalkUp({ firstName, lastName, phone, email, dropoff, passengers, language, idempotencyKey }) {
    if (isWalkUpDemoActive()) return demoWalkUpRequest({ phone, idempotencyKey });
    const credential = getKioskDeviceCredential();
    if (!credential) {
      return Promise.reject(new RideRequestError('device not trusted', { status: 401, code: 'DEVICE_NOT_TRUSTED' }));
    }
    const body = {
      firstName,
      lastName,
      phone,
      dropoff,
      passengers: passengers || 1,
      language,
    };
    if (email) body.email = email;
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': config.SERVICES.rides.xApiKey,
      Authorization: `Bearer ${credential}`,
    };
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
    return fetch(`${config.SERVICES.rides.url}/kiosk/request`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    }).then(async (response) => {
      if (response.status === 200) return response.json();
      if (response.status === 409) {
        const refusal = await response.json().catch(() => null);
        if (GATE_REFUSAL_CODES.includes(refusal?.code)) {
          throw new RideRequestError(refusal.message, { status: 409, code: refusal.code });
        }
        throw new RideRequestError('ride request still processing', { status: 409, retryable: true });
      }
      if (response.status === 429) {
        throw new RideRequestError('too many requests', { status: 429, code: 'TRY_LATER' });
      }
      if (response.status === 401) {
        throw new RideRequestError('device not trusted', { status: 401, code: 'DEVICE_NOT_TRUSTED' });
      }
      const json = await response.json().catch(() => null);
      throw new RideRequestError(json?.message || json?.error?.message, { status: response.status });
    }).catch((err) => {
      if (err instanceof RideRequestError) throw err;
      throw new RideRequestError(err?.message, { retryable: true });
    });
  },

};

export default rides;
