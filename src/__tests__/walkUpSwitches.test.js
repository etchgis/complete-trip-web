// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import kioskDefinitions from '../models/kiosk-definitions';
import { isWalkUpAvailable } from '../models/kiosk-walkup';
import {
  DEMO_CLOSED_TEXT,
  DEMO_NO_DRIVER_TEXT,
  demoAnswerForPhone,
  demoPinRequest,
} from '../services/transport/demoRides';

const tops = kioskDefinitions.topsjefferson;
const off = { enabledInBuild: false, demo: false, credential: null };

describe('isWalkUpAvailable', () => {
  test('with every switch off no kiosk offers the choice', () => {
    expect(isWalkUpAvailable(tops, off)).toBe(false);
    expect(isWalkUpAvailable(kioskDefinitions.summerbest, off)).toBe(false);
    expect(isWalkUpAvailable(tops)).toBe(false);
  });

  test('only the Tops site has the site switch', () => {
    expect(kioskDefinitions.topsjefferson.walkUpBooking).toBe(true);
    expect(kioskDefinitions.bgmclobby.walkUpBooking).toBeUndefined();
    expect(kioskDefinitions.summerbest.walkUpBooking).toBeUndefined();
  });

  test('the build, the site and a credential are all needed', () => {
    const on = { enabledInBuild: true, demo: false, credential: 'device-credential' };
    expect(isWalkUpAvailable(tops, on)).toBe(true);
    expect(isWalkUpAvailable(tops, { ...on, enabledInBuild: false })).toBe(false);
    expect(isWalkUpAvailable(tops, { ...on, credential: null })).toBe(false);
    expect(isWalkUpAvailable(kioskDefinitions.summerbest, on)).toBe(false);
  });

  test('the demo turns it on for any kiosk', () => {
    expect(isWalkUpAvailable(kioskDefinitions.summerbest, { ...off, demo: true })).toBe(true);
  });
});

describe('demo answers', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const outcome = async promise => {
    const settled = promise.then(v => ({ ok: v }), e => ({ error: e }));
    await vi.advanceTimersByTimeAsync(1500);
    return settled;
  };

  test('0101 and 0102 are gate refusals with the live text', async () => {
    const a = (await outcome(demoAnswerForPhone('+17165550101'))).error;
    expect([a.status, a.code, a.message]).toEqual([409, 'NO_DRIVER_ON_DUTY', DEMO_NO_DRIVER_TEXT]);
    const b = (await outcome(demoAnswerForPhone('+17165550102'))).error;
    expect([b.status, b.code, b.message]).toEqual([409, 'SERVICE_CLOSED', DEMO_CLOSED_TEXT]);
  });

  test('0103 is a 400 and 0104 is a 429', async () => {
    const a = (await outcome(demoAnswerForPhone('+17165550103'))).error;
    expect([a.status, a.message]).toEqual([400, 'invalid pin']);
    const b = (await outcome(demoAnswerForPhone('+17165550104'))).error;
    expect([b.status, b.code]).toEqual([429, 'TRY_LATER']);
  });

  test('0105 never answers the first time and books on the same key', async () => {
    let settled = false;
    demoAnswerForPhone('+17165550105', 'k1').then(() => { settled = true; }, () => { settled = true; });
    await vi.advanceTimersByTimeAsync(10000);
    expect(settled).toBe(false);
    expect((await outcome(demoAnswerForPhone('+17165550105', 'k1'))).ok.id).toBeTruthy();
  });

  test('any other number books', async () => {
    expect((await outcome(demoAnswerForPhone('+17165550123'))).ok.id).toBeTruthy();
  });

  test('the PIN path needs 1234 and then follows the phone rules', async () => {
    expect((await outcome(demoPinRequest({ phone: '+17165550123', pin: '0000' }))).error.message).toBe('invalid pin');
    expect((await outcome(demoPinRequest({ phone: '+17165550123', pin: '1234' }))).ok.id).toBeTruthy();
    expect((await outcome(demoPinRequest({ phone: '+17165550101', pin: '1234' }))).error.code).toBe('NO_DRIVER_ON_DUTY');
  });
});

// The demo build flag must change nothing outside a kiosk page.
describe('demo build on non-kiosk pages', () => {
  const availability = vi.fn();

  const load = async search => {
    vi.resetModules();
    vi.stubEnv('VITE_KIOSK_WALKUP_DEMO', 'true');
    window.history.pushState({}, '', `/map${search}`);
    vi.doMock('../services/transport/shuttle', () => ({
      default: { availability: (...a) => availability(...a) },
    }));
    const hook = await import('../hooks/useServiceAvailability');
    const rides = (await import('../services/transport/rides')).default;
    const config = (await import('../config')).default;
    return { hook, rides, config };
  };

  beforeEach(() => {
    availability.mockReset();
    availability.mockResolvedValue({ isAvailable: false, todayHours: [] });
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock('../services/transport/shuttle');
    window.history.pushState({}, '', '/');
  });

  test('call center: availability asks the service and rides.request uses the network', async () => {
    const { hook, rides, config } = await load('?mode=callcenter');
    const fetchSpy = vi.fn().mockResolvedValue({ status: 500, json: async () => ({ message: 'real' }) });
    vi.stubGlobal('fetch', fetchSpy);
    const v = await hook.checkServiceAvailability(config.HDS_SERVICE_ID);
    expect(availability).toHaveBeenCalled();
    expect(v).not.toBe('available');
    await expect(rides.request('org', 1, 'leave', {}, {}, null, 1, '+17165550123', '1234', 'k')).rejects.toThrow();
    expect(fetchSpy).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  test('web app with no mode behaves the same', async () => {
    const { hook, config } = await load('');
    await hook.checkServiceAvailability(config.HDS_SERVICE_ID);
    expect(availability).toHaveBeenCalled();
  });

  test('kiosk page: availability is always available and asks nothing', async () => {
    const { hook, config } = await load('?mode=kiosk&kiosk=topsjefferson');
    expect(await hook.checkServiceAvailability(config.HDS_SERVICE_ID)).toBe('available');
    expect(availability).not.toHaveBeenCalled();
  });
});
