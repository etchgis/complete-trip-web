// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { getLocation } from '../utils/getLocation';
import { initialUx, isKioskMode } from '../utils/kioskMode';

const getCurrentPosition = vi.fn((ok) =>
  ok({ coords: { latitude: 1, longitude: 2, accuracy: 3 } })
);

const openAddress = search => window.history.replaceState({}, '', `/${search}`);

describe('location lookup and mode', () => {
  beforeEach(() => {
    getCurrentPosition.mockClear();
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition },
      configurable: true,
    });
  });

  afterEach(() => openAddress(''));

  test('never asks for the device location when the address has mode=kiosk', async () => {
    openAddress('?mode=kiosk');
    expect(await getLocation()).toEqual({});
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  test('asks for the device location in normal web mode', async () => {
    openAddress('');
    expect(await getLocation()).toEqual({ center: [2, 1], precision: 3 });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  test('decides the mode from the address', () => {
    openAddress('?mode=kiosk');
    expect(isKioskMode()).toBe(true);
    expect(initialUx()).toBe('kiosk');
    openAddress('?mode=callcenter');
    expect(isKioskMode()).toBe(false);
    expect(initialUx()).toBe('callcenter');
    openAddress('');
    expect(initialUx()).toBe('webapp');
  });
});
