// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import rides from '../services/transport/rides';
import config from '../config';

const call = () =>
  rides.requestWalkUp({
    firstName: 'Ana',
    lastName: 'Diaz',
    phone: '+17165550123',
    email: '',
    dropoff: { title: 'x' },
    passengers: 1,
    language: 'en',
    idempotencyKey: 'key-1',
  });

const reply = (status, body) => vi.fn().mockResolvedValue({ status, json: async () => body });

beforeEach(() => localStorage.setItem('kioskDeviceCredential', 'cred-abc'));
afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe('rides.requestWalkUp', () => {
  test('posts to the kiosk route with Bearer and Idempotency-Key', async () => {
    const fetchSpy = reply(200, { id: 'r1' });
    vi.stubGlobal('fetch', fetchSpy);
    expect(await call()).toEqual({ id: 'r1' });
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${config.SERVICES.rides.url}/kiosk/request`);
    expect(init.headers.Authorization).toBe('Bearer cred-abc');
    expect(init.headers['Idempotency-Key']).toBe('key-1');
    expect(JSON.parse(init.body).email).toBeUndefined();
  });

  test('429 maps to TRY_LATER and 401 to DEVICE_NOT_TRUSTED', async () => {
    vi.stubGlobal('fetch', reply(429, {}));
    await expect(call()).rejects.toMatchObject({ status: 429, code: 'TRY_LATER' });
    vi.stubGlobal('fetch', reply(401, {}));
    await expect(call()).rejects.toMatchObject({ status: 401, code: 'DEVICE_NOT_TRUSTED' });
  });

  test('409 gate refusal is final and a plain 409 is retryable', async () => {
    vi.stubGlobal('fetch', reply(409, { code: 'SERVICE_CLOSED', message: 'closed' }));
    await expect(call()).rejects.toMatchObject({ code: 'SERVICE_CLOSED', retryable: false, message: 'closed' });
    vi.stubGlobal('fetch', reply(409, {}));
    await expect(call()).rejects.toMatchObject({ status: 409, retryable: true });
  });

  test('without a credential nothing is sent', async () => {
    localStorage.clear();
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    await expect(call()).rejects.toMatchObject({ code: 'DEVICE_NOT_TRUSTED' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
