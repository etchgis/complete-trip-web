import { afterEach, describe, expect, test, vi } from 'vitest';

import config from '../config';
import presence from '../services/transport/presence';

const reply = (status, body) => ({ status, json: async () => body });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the presence service client', () => {
  test('is routed at /presence on the gateway host', async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply(200, { state: 'live' }));
    vi.stubGlobal('fetch', fetchMock);
    await presence.verdict('veh 1', 'tok');
    expect(config.PRESENCE.url).toMatch(/^https:\/\/api(-stage)?\.etch\.app$/);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${config.PRESENCE.url}/presence/vehicles/veh%201/verdict`);
    expect(init.headers.Authorization).toBe('Bearer tok');
  });

  test('sends the anonymous status without a token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply(200, { state: 'live' }));
    vi.stubGlobal('fetch', fetchMock);
    await presence.publicStatus('v1');
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/presence\/public\/vehicles\/v1\/status$/);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  test('sends the timeline range as milliseconds', async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply(200, { events: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await presence.timeline('v1', 1000, 2000, 'tok');
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/timeline\?from=1000&to=2000$/);
  });

  test('keeps the status and the service error message on a refusal', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply(404, { error: 'no status for this vehicle' })));
    await expect(presence.publicStatus('v1')).rejects.toMatchObject({
      status: 404,
      message: 'no status for this vehicle',
    });
  });

  test('passes on the unknown verdict the service sends when it is unhealthy', async () => {
    const body = { error: 'presence is unavailable', state: 'unknown', reason: 'db_unhealthy', side: 'ours' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(reply(503, body)));
    await expect(presence.verdict('v1', 'tok')).resolves.toEqual(body);
  });
});
