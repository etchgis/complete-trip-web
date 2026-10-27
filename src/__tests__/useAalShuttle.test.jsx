// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { cleanup, renderHook } from '@testing-library/react';

import useAalShuttle, { AAL_POLL_INTERVAL_MS } from '../hooks/useAalShuttle';

const route = vi.fn();
const vehiclePosition = vi.fn();

vi.mock('../services/transport/aal', () => ({
  default: {
    route: (...args) => route(...args),
    vehiclePosition: (...args) => vehiclePosition(...args),
  },
}));

const ROUTE_JSON = {
  routes: [
    {
      longName: 'All Access Loop',
      color: '005bbb',
      textColor: 'ffffff',
      patterns: [
        {
          coordinates: [
            [-78.86, 42.89],
            [-78.87, 42.9],
          ],
          stops: [{ stopId: 's1', name: 'Stop', coordinates: [-78.86, 42.89] }],
        },
      ],
    },
  ],
};

const vehicleJson = (longitude, latitude) => ({
  entity: [
    {
      vehicle: {
        vehicle: { id: '0' },
        position: { latitude, longitude, bearing: 90 },
        timestamp: 1700000000,
      },
    },
  ],
});

const options = (overrides = {}) => ({
  enabled: true,
  serviceId: 'service',
  organizationId: 'org',
  onRoute: vi.fn(),
  onVehicles: vi.fn(),
  ...overrides,
});

const settle = async () => {
  for (let i = 0; i < 5; i += 1) {
    await vi.advanceTimersByTimeAsync(0);
  }
};

beforeEach(() => {
  vi.useFakeTimers();
  route.mockReset().mockResolvedValue(ROUTE_JSON);
  vehiclePosition.mockReset().mockResolvedValue(vehicleJson(-78.86, 42.89));
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('useAalShuttle', () => {
  test('does nothing when disabled', async () => {
    const opts = options({ enabled: false });
    renderHook(o => useAalShuttle(o), { initialProps: opts });
    await vi.advanceTimersByTimeAsync(AAL_POLL_INTERVAL_MS * 3);

    expect(route).not.toHaveBeenCalled();
    expect(vehiclePosition).not.toHaveBeenCalled();
    expect(opts.onRoute).not.toHaveBeenCalled();
    expect(opts.onVehicles).not.toHaveBeenCalled();
  });

  test('fetches the route once and publishes it', async () => {
    const opts = options();
    renderHook(o => useAalShuttle(o), { initialProps: opts });
    await settle();
    await vi.advanceTimersByTimeAsync(AAL_POLL_INTERVAL_MS * 2);

    expect(route).toHaveBeenCalledTimes(1);
    expect(opts.onRoute).toHaveBeenCalledTimes(1);
    const published = opts.onRoute.mock.calls[0][0];
    expect(published.route.features[0].geometry.type).toBe('LineString');
    expect(published.stops.features).toHaveLength(1);
  });

  test('publishes the vehicles on every tick', async () => {
    const opts = options();
    renderHook(o => useAalShuttle(o), { initialProps: opts });
    await settle();
    expect(opts.onVehicles).toHaveBeenCalledTimes(1);
    expect(opts.onVehicles.mock.calls[0][0].features).toHaveLength(1);
    expect(opts.onVehicles.mock.calls[0][0].features[0].properties.icon).toBe(
      'bus-live'
    );

    vehiclePosition.mockResolvedValue(vehicleJson(-78.87, 42.9));
    await vi.advanceTimersByTimeAsync(AAL_POLL_INTERVAL_MS);
    expect(opts.onVehicles).toHaveBeenCalledTimes(2);
    expect(
      opts.onVehicles.mock.calls[1][0].features[0].geometry.coordinates
    ).toEqual([-78.87, 42.9]);
  });

  test('retries the route on a later tick after it fails', async () => {
    route.mockRejectedValueOnce(new Error('503'));
    const opts = options();
    renderHook(o => useAalShuttle(o), { initialProps: opts });
    await settle();
    expect(opts.onRoute).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(AAL_POLL_INTERVAL_MS * 3);
    expect(opts.onRoute).toHaveBeenCalledTimes(1);
  });

  test('a failed request leaves the marker alone', async () => {
    const opts = options();
    renderHook(o => useAalShuttle(o), { initialProps: opts });
    await settle();
    expect(opts.onVehicles).toHaveBeenCalledTimes(1);

    vehiclePosition.mockRejectedValue(new Error('offline'));
    await vi.advanceTimersByTimeAsync(AAL_POLL_INTERVAL_MS);
    expect(vehiclePosition).toHaveBeenCalledTimes(2);
    expect(opts.onVehicles).toHaveBeenCalledTimes(1);
  });

  test('an empty answer publishes an empty collection', async () => {
    vehiclePosition.mockResolvedValue({});
    const opts = options();
    renderHook(o => useAalShuttle(o), { initialProps: opts });
    await settle();

    expect(opts.onVehicles).toHaveBeenCalledTimes(1);
    expect(opts.onVehicles.mock.calls[0][0].features).toEqual([]);
  });

  test('unmounting clears the marker and stops polling', async () => {
    const opts = options();
    const { unmount } = renderHook(o => useAalShuttle(o), {
      initialProps: opts,
    });
    await settle();
    unmount();

    const last = opts.onVehicles.mock.calls.at(-1)[0];
    expect(last.features).toEqual([]);

    const calls = vehiclePosition.mock.calls.length;
    await vi.advanceTimersByTimeAsync(AAL_POLL_INTERVAL_MS * 3);
    expect(vehiclePosition.mock.calls.length).toBe(calls);
  });
});
