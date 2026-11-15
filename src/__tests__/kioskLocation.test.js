// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';


const getCurrentPosition = vi.fn((ok) =>
  ok({ coords: { latitude: 1, longitude: 2, accuracy: 3 } })
);

const openAddress = search => window.history.replaceState({}, '', `/${search}`);

describe('location lookup and mode', () => {
  // The mode is remembered when the module loads, so each test loads it fresh.
  let getLocation, initialUx, isKioskMode;
  const load = async search => {
    openAddress(search);
    vi.resetModules();
    ({ getLocation } = await import('../utils/getLocation'));
    ({ initialUx, isKioskMode } = await import('../utils/kioskMode'));
  };

  beforeEach(() => {
    getCurrentPosition.mockClear();
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition },
      configurable: true,
    });
  });

  afterEach(() => openAddress(''));

  test('never asks for the device location when the address has mode=kiosk', async () => {
    await load('?mode=kiosk');
    expect(await getLocation()).toEqual({});
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  test('asks for the device location in normal web mode', async () => {
    await load('');
    expect(await getLocation()).toEqual({ center: [2, 1], precision: 3 });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  test('stays in kiosk mode after the address loses the query string', async () => {
    await load('?mode=kiosk');
    openAddress('');
    expect(isKioskMode()).toBe(true);
    expect(await getLocation()).toEqual({});
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  test('decides the mode from the address', async () => {
    await load('?mode=kiosk');
    expect(isKioskMode()).toBe(true);
    expect(initialUx()).toBe('kiosk');
    await load('?mode=callcenter');
    expect(isKioskMode()).toBe(false);
    expect(initialUx()).toBe('callcenter');
    await load('');
    expect(initialUx()).toBe('webapp');
  });
});
