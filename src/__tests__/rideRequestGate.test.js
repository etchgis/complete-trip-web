import { afterEach, describe, expect, test, vi } from 'vitest';

import rides, { RideRequestError } from '../services/transport/rides';

const reply = (status, body) =>
  Promise.resolve({
    status,
    json: () => (body === undefined ? Promise.reject(new Error('no body')) : Promise.resolve(body)),
  });

const send = () =>
  rides.request('org', Date.now(), 'leave', {}, {}, null, 1, '+15551234567', '1234', 'key-1');

const rejection = async () => {
  try {
    await send();
  } catch (e) {
    return e;
  }
  throw new Error('expected a rejection');
};

afterEach(() => vi.unstubAllGlobals());

describe('ride request 409 handling', () => {
  test.each(['NO_DRIVER_ON_DUTY', 'SERVICE_CLOSED'])('%s is a final refusal with its message', async code => {
    vi.stubGlobal('fetch', vi.fn(() => reply(409, { code, message: 'No driver right now' })));
    const e = await rejection();
    expect(e).toBeInstanceOf(RideRequestError);
    expect(e.retryable).toBe(false);
    expect(e.status).toBe(409);
    expect(e.code).toBe(code);
    expect(e.message).toBe('No driver right now');
  });

  test('a 409 with no gate code stays retryable', async () => {
    vi.stubGlobal('fetch', vi.fn(() => reply(409, { message: 'in flight' })));
    const e = await rejection();
    expect(e.retryable).toBe(true);
    expect(e.code).toBe(null);
  });

  test('a 409 with an unreadable body stays retryable', async () => {
    vi.stubGlobal('fetch', vi.fn(() => reply(409)));
    expect((await rejection()).retryable).toBe(true);
  });

  test('a 409 with an unknown code stays retryable', async () => {
    vi.stubGlobal('fetch', vi.fn(() => reply(409, { code: 'SOMETHING_ELSE', message: 'x' })));
    expect((await rejection()).retryable).toBe(true);
  });
});
