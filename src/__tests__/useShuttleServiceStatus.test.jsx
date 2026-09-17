// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { cleanup, renderHook, waitFor } from '@testing-library/react';

import useShuttleServiceStatus, {
  GEOCODE_TIMEOUT_MS,
  POLL_INTERVAL_MS,
} from '../hooks/useShuttleServiceStatus';

const reverse = vi.fn();
const availability = vi.fn();
const vehicles = vi.fn();

vi.mock('../services/transport', () => ({
  geocoder: { reverse: (...args) => reverse(...args) },
}));

vi.mock('../services/transport/shuttle', () => ({
  default: {
    availability: (...args) => availability(...args),
    vehicles: (...args) => vehicles(...args),
  },
}));

const AVAILABLE = {
  isAvailable: true,
  todayHours: [{ start: '10:30', end: '14:30' }],
  hoursDisplay: '10:30 AM - 2:30 PM',
};

const at = (coordinates, ageSeconds = 5) => ({
  vehicles: [
    {
      vehicleId: 'v1',
      coordinates,
      location: { coordinates, timestamp: Date.now() - ageSeconds * 1000 },
      stale: false,
      ageSeconds,
    },
  ],
});

const options = (overrides = {}) => ({
  enabled: true,
  serviceId: 'service',
  tripId: 'A1',
  organizationId: 'org',
  ...overrides,
});

// Every dependency of the polling effect is in the key, so changing one runs a
// fresh poll immediately without waiting out the interval.
const render = (props = {}) =>
  renderHook(opts => useShuttleServiceStatus(opts), {
    initialProps: options(props),
  });

// Lets pending answers, address lookups and state updates finish without
// moving the fake clock.
const settle = async () => {
  for (let i = 0; i < 5; i += 1) {
    await vi.advanceTimersByTimeAsync(0);
  }
};

beforeEach(() => {
  reverse.mockReset();
  availability.mockReset().mockResolvedValue(AVAILABLE);
  vehicles.mockReset().mockResolvedValue(at([-78.86, 42.89]));
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('addresses', () => {
  test('does not put the address of one place under the position of another', async () => {
    // The shuttle moves, the geocoder refuses the new position, and the address
    // we hold belongs to the corner it has already left. Showing it would have
    // an agent tell a rider standing on the new corner that the shuttle is
    // somewhere else.
    reverse
      .mockResolvedValueOnce([{ title: 'Main St at Utica' }])
      .mockRejectedValueOnce(new Error('429'));

    const { result, rerender } = render();
    await waitFor(() =>
      expect(result.current.position.location?.title).toBe('Main St at Utica')
    );

    vehicles.mockResolvedValue(at([-78.88, 42.9]));
    rerender(options({ tripId: 'A2' }));

    await waitFor(() =>
      expect(result.current.position.location?.coordinates).toEqual([
        -78.88, 42.9,
      ])
    );
    expect(result.current.position.location.title).toBe(null);
  });

  test('a geocoder that never answers does not hold up the status', async () => {
    vi.useFakeTimers();
    reverse.mockImplementation(() => new Promise(() => {}));

    const { result } = render();
    await settle();
    // The card shows the position before any address is known.
    expect(result.current.position.state).toBe('reporting');
    expect(result.current.position.location.title).toBe(null);

    // The shuttle keeps moving and every poll still goes out and lands.
    vehicles.mockResolvedValue(at([-78.87, 42.9]));
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
    await settle();
    expect(result.current.position.location.coordinates).toEqual([-78.87, 42.9]);

    vehicles.mockResolvedValue(at([-78.88, 42.91]));
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
    await settle();
    expect(vehicles).toHaveBeenCalledTimes(3);
    expect(result.current.position.location.coordinates).toEqual([-78.88, 42.91]);
  });

  test('gives up on an address after the timeout and asks again on a later poll', async () => {
    vi.useFakeTimers();
    reverse
      .mockImplementationOnce(() => new Promise(() => {}))
      .mockResolvedValue([{ title: 'Main St at Utica' }]);

    const { result } = render();
    await settle();
    expect(reverse).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(GEOCODE_TIMEOUT_MS);
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS - GEOCODE_TIMEOUT_MS);
    await settle();
    expect(reverse).toHaveBeenCalledTimes(2);
    expect(result.current.position.location.title).toBe('Main St at Utica');
  });

  test('asks the geocoder again for a position it has not resolved', async () => {
    reverse.mockResolvedValue([{ title: 'Main St at Utica' }]);

    const { rerender } = render();
    await waitFor(() => expect(reverse).toHaveBeenCalledTimes(1));

    vehicles.mockResolvedValue(at([-78.88, 42.9]));
    rerender(options({ tripId: 'A2' }));
    await waitFor(() => expect(reverse).toHaveBeenCalledTimes(2));

    // Back where it was. The address is already known, so nothing is asked.
    vehicles.mockResolvedValue(at([-78.86, 42.89]));
    rerender(options({ tripId: 'A3' }));
    await waitFor(() => expect(reverse).toHaveBeenCalledTimes(2));
  });
});

describe('the map marker', () => {
  // What the map is showing now. The marker is published again when a late
  // address arrives, so the last call is the one on screen.
  const marker = onFeature =>
    onFeature.mock.calls[onFeature.mock.calls.length - 1][0].features;

  test('a failed request leaves the shuttle on the map', async () => {
    // The card says the page could not reach the tracking, and the map beside
    // it has to agree. Clearing the marker tells an agent the shuttle is gone.
    reverse.mockResolvedValue([{ title: 'Main St at Utica' }]);
    const onFeature = vi.fn();

    const { result, rerender } = render({ onFeature });
    await waitFor(() => expect(onFeature).toHaveBeenCalled());
    expect(marker(onFeature)).toHaveLength(1);

    vehicles.mockRejectedValue(new Error('503'));
    rerender(options({ tripId: 'A2', onFeature }));

    await waitFor(() =>
      expect(result.current.position.state).toBe('unreachable')
    );
    expect(onFeature.mock.calls.every(call => call[0].features.length === 1)).toBe(
      true
    );
  });

  test('a map that throws does not stop the card from updating', async () => {
    // The map throws when its shuttle layer has not been added yet.
    reverse.mockResolvedValue([{ title: 'Main St at Utica' }]);
    const onFeature = vi.fn(() => {
      throw new TypeError("Cannot read properties of undefined (reading 'setData')");
    });

    const { result } = render({ onFeature });
    await waitFor(() => expect(onFeature).toHaveBeenCalled());
    await waitFor(() =>
      expect(result.current.position.state).toBe('reporting')
    );
    expect(result.current.service.state).toBe('running');
    expect(result.current.position.location.title).toBe('Main St at Utica');
  });

  test('puts an address that arrives late on the marker, not only on the card', async () => {
    vi.useFakeTimers();
    let name;
    reverse.mockImplementation(
      () => new Promise(resolve => {
        name = () => resolve([{ title: 'Main St at Utica' }]);
      })
    );
    const onFeature = vi.fn();

    const { result } = render({ onFeature });
    await settle();
    expect(onFeature).toHaveBeenCalledTimes(1);
    expect(onFeature.mock.calls[0][0].features[0].properties.title).toBe(null);

    name();
    await settle();
    expect(result.current.position.location.title).toBe('Main St at Utica');
    const last = onFeature.mock.calls[onFeature.mock.calls.length - 1][0];
    expect(last.features[0].properties.title).toBe('Main St at Utica');
    expect(last.features[0].geometry.coordinates).toEqual([-78.86, 42.89]);
  });

  test('an answer reporting nothing does clear the shuttle from the map', async () => {
    const onFeature = vi.fn();
    reverse.mockResolvedValue([{ title: 'Main St at Utica' }]);

    const { rerender } = render({ onFeature });
    await waitFor(() => expect(onFeature).toHaveBeenCalled());

    vehicles.mockResolvedValue({ vehicles: [] });
    rerender(options({ tripId: 'A2', onFeature }));

    await waitFor(() => expect(marker(onFeature)).toHaveLength(0));
  });
});

describe('bad data', () => {
  test('coordinates that are not numbers do not leave the card checking', async () => {
    vehicles.mockResolvedValue({
      vehicles: [
        {
          vehicleId: 'v1',
          coordinates: ['-78.86', '42.89'],
          location: { coordinates: ['-78.86', '42.89'] },
          ageSeconds: 5,
        },
      ],
    });

    const { result } = render();
    await waitFor(() => expect(result.current.position.state).toBe('no-report'));
    expect(result.current.service.state).toBe('running');
    expect(reverse).not.toHaveBeenCalled();
  });
});

describe('ages', () => {
  test('the age of the same report does not go backward between polls', async () => {
    vi.useFakeTimers();
    reverse.mockResolvedValue([{ title: 'Main St at Utica' }]);
    const reportedAt = Date.now() - 100000;
    const report = ageSeconds => ({
      vehicles: [
        {
          vehicleId: 'v1',
          coordinates: [-78.86, 42.89],
          location: { coordinates: [-78.86, 42.89], timestamp: reportedAt },
          isStale: true,
          lastSeenTs: reportedAt,
          ageSeconds,
        },
      ],
    });

    // The first answer is slow, so the server measured the report as older
    // than it was when the request went out. The second answers at once.
    vehicles.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve(report(104)), 4000))
    );
    const { result } = render();
    await vi.advanceTimersByTimeAsync(4000);
    await settle();
    const before = result.current.position.ageMs;
    expect(before).toBe(108000);

    vehicles.mockResolvedValue(report(110));
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS - 4000);
    await settle();
    expect(result.current.position.ageMs).toBeGreaterThanOrEqual(before);
    expect(result.current.position.ageMs).toBe(114000);
  });

  test('a hidden tab does not age the position it is holding', async () => {
    vi.useFakeTimers();
    reverse.mockResolvedValue([{ title: 'Main St at Utica' }]);
    const visibility = vi
      .spyOn(document, 'visibilityState', 'get')
      .mockReturnValue('visible');

    const { result } = render();
    await settle();
    expect(result.current.position.state).toBe('reporting');
    const before = result.current.position.ageMs;

    visibility.mockReturnValue('hidden');
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 18);
    expect(result.current.position.state).toBe('reporting');
    expect(result.current.position.ageMs).toBe(before);
  });
});

describe('polling', () => {
  test('does not ask again while the last question is unanswered', async () => {
    vi.useFakeTimers();
    let answer;
    vehicles.mockImplementation(
      () => new Promise(resolve => { answer = resolve; })
    );

    render();
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 4);
    expect(vehicles).toHaveBeenCalledTimes(1);

    answer(at([-78.86, 42.89]));
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
    expect(vehicles).toHaveBeenCalledTimes(2);
  });

  test('backs off instead of retrying a broken feed every ten seconds', async () => {
    vi.useFakeTimers();
    vehicles.mockRejectedValue(new Error('503'));

    render();
    await vi.advanceTimersByTimeAsync(0);
    expect(vehicles).toHaveBeenCalledTimes(1);

    // The next few ticks come and go without another request.
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
    expect(vehicles).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2);
    expect(vehicles).toHaveBeenCalledTimes(2);
  });

  test('a failing availability check does not slow down the vehicle feed', async () => {
    vi.useFakeTimers();
    availability.mockRejectedValue(new Error('503'));

    render();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 3);
    expect(availability).toHaveBeenCalledTimes(2);
    expect(vehicles).toHaveBeenCalledTimes(4);
  });

  test('a failing vehicle feed does not slow down the availability check', async () => {
    vi.useFakeTimers();
    vehicles.mockRejectedValue(new Error('503'));

    const { result } = render();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 3);
    expect(vehicles).toHaveBeenCalledTimes(2);
    expect(availability).toHaveBeenCalledTimes(4);
    expect(result.current.service.state).toBe('running');
    expect(result.current.position.state).toBe('unreachable');
  });

  test('coming back to the tab asks again even while backing off', async () => {
    vi.useFakeTimers();
    vehicles.mockRejectedValue(new Error('503'));
    const visibility = vi
      .spyOn(document, 'visibilityState', 'get')
      .mockReturnValue('visible');

    render();
    // Three failures in a row push the next attempt well past a minute out.
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 7);
    expect(vehicles).toHaveBeenCalledTimes(3);

    visibility.mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(1000);

    vehicles.mockResolvedValue(at([-78.86, 42.89]));
    visibility.mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(0);
    expect(vehicles).toHaveBeenCalledTimes(4);
  });

  test('a tab nobody is looking at does not poll', async () => {
    vi.useFakeTimers();
    const visibility = vi
      .spyOn(document, 'visibilityState', 'get')
      .mockReturnValue('hidden');

    render();
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 6);
    expect(vehicles).not.toHaveBeenCalled();

    // Coming back to it shows the shuttle now, not at the next tick.
    visibility.mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    await vi.advanceTimersByTimeAsync(0);
    expect(vehicles).toHaveBeenCalledTimes(1);
  });
});
