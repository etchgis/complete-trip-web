// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { cleanup, renderHook, waitFor } from '@testing-library/react';

import useServiceAvailability, {
  AVAILABILITY_CHECK_TIMEOUT_MS,
  MAX_PARALLEL_CHECKS,
  availabilityVerdict,
  checkServiceAvailability,
  screenShuttlePickups,
} from '../hooks/useServiceAvailability';
import config from '../config';
import { readAvailability } from '../models/shuttle-status';

const availability = vi.fn();

vi.mock('../services/transport/shuttle', () => ({
  default: {
    availability: (...args) => availability(...args),
  },
}));

const OPEN = {
  isAvailable: true,
  todayHours: [{ start: '10:30', end: '14:30' }],
};

const CLOSED = {
  isAvailable: false,
  reason: 'outside_hours',
  todayHours: [{ start: '10:30', end: '14:30' }],
};

beforeEach(() => {
  availability.mockReset().mockResolvedValue(OPEN);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('availabilityVerdict', () => {
  test('reads running and closed answers', () => {
    expect(availabilityVerdict(readAvailability(OPEN))).toBe('available');
    expect(availabilityVerdict(readAvailability(CLOSED))).toBe('unavailable');
  });

  test('a service with no hours on record is unknown, not available', () => {
    expect(
      availabilityVerdict(readAvailability({ isAvailable: true, todayHours: [] }))
    ).toBe('unknown');
    expect(availabilityVerdict(null)).toBe('unknown');
  });
});

describe('checkServiceAvailability', () => {
  test('passes the time along and reads a closed answer', async () => {
    availability.mockResolvedValue(CLOSED);
    await expect(checkServiceAvailability('hds', 1757600000000)).resolves.toBe(
      'unavailable'
    );
    expect(availability).toHaveBeenCalledWith('hds', 1757600000000);
  });

  test('a failed request is unknown rather than closed', async () => {
    availability.mockRejectedValue('Could not read shuttle availability');
    await expect(checkServiceAvailability('hds')).resolves.toBe('unknown');
  });

  test('a check that does not answer in time is unknown', async () => {
    vi.useFakeTimers();
    try {
      availability.mockImplementation(() => new Promise(() => {}));
      let verdict = null;
      checkServiceAvailability('hds').then(answer => {
        verdict = answer;
      });
      await vi.advanceTimersByTimeAsync(AVAILABILITY_CHECK_TIMEOUT_MS - 1);
      expect(verdict).toBe(null);
      await vi.advanceTimersByTimeAsync(1);
      expect(verdict).toBe('unknown');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('screenShuttlePickups', () => {
  const HDS = config.HDS_SERVICE_ID;
  const UB = config.UB_SHUTTLE_SERVICE_ID;

  const pickupAt = time => ({
    legs: [
      { mode: 'WALK', startTime: time - 300000 },
      { mode: 'HAIL', startTime: time },
    ],
  });
  const busOnly = { legs: [{ mode: 'BUS', startTime: 1757600000000 }] };

  const askedFor = serviceId =>
    availability.mock.calls.filter(call => call[0] === serviceId).map(call => call[1]);

  test('checks each shuttle plan at its pickup time and drops the closed ones', async () => {
    const open = new Date(2026, 8, 15, 12, 0).getTime();
    const closed = new Date(2026, 8, 15, 15, 0).getTime();
    availability.mockImplementation((id, at) =>
      Promise.resolve(at === closed ? CLOSED : OPEN)
    );

    const plans = [pickupAt(open), pickupAt(closed), busOnly];
    const screened = await screenShuttlePickups(plans);

    expect(screened.plans).toEqual([plans[0], busOnly]);
    expect(screened.closed.at).toBe(closed);
    expect(screened.closed.service.key).toBe('hail');
    expect(screened.closed.availability.reason).toBe('outside_hours');
    expect(askedFor(HDS).sort()).toEqual([open, closed].sort());
    expect(availability).toHaveBeenCalledTimes(2);
  });

  test('checks every shuttle leg of a plan, not only the first', async () => {
    // A plan that rides the shuttle, then a train, then the shuttle again. The
    // second ride is after the shuttle closes, so the plan cannot be kept.
    const first = new Date(2026, 8, 15, 14, 0).getTime();
    const second = new Date(2026, 8, 15, 14, 45).getTime();
    availability.mockImplementation((id, at) =>
      Promise.resolve(at === second ? CLOSED : OPEN)
    );
    const plan = {
      legs: [
        { mode: 'HAIL', startTime: first },
        { mode: 'TRAM', startTime: first + 900000 },
        { mode: 'HAIL', startTime: second },
      ],
    };

    const screened = await screenShuttlePickups([plan]);

    expect(screened.plans).toEqual([]);
    expect(askedFor(HDS).sort()).toEqual([first, second].sort());
  });

  test('asks the service the leg rides, not always the community shuttle', async () => {
    const at = new Date(2026, 8, 15, 9, 0).getTime();
    availability.mockImplementation(id => Promise.resolve(id === UB ? CLOSED : OPEN));
    const plan = {
      legs: [
        { mode: 'HAIL', startTime: at },
        { mode: 'ubshuttle', startTime: at + 600000 },
      ],
    };

    const screened = await screenShuttlePickups([plan]);

    expect(screened.plans).toEqual([]);
    expect(screened.closed.service.key).toBe('ubshuttle');
    expect(askedFor(HDS)).toEqual([at]);
    expect(askedFor(UB)).toEqual([at + 600000]);
  });

  test('asks once for the same service and pickup minute', async () => {
    const at = new Date(2026, 8, 15, 11, 0).getTime();
    const plans = [
      pickupAt(at),
      pickupAt(at + 20000),
      { legs: [{ mode: 'HAIL', startTime: at }, { mode: 'HAIL', startTime: at + 30000 }] },
    ];

    await screenShuttlePickups(plans);

    expect(availability).toHaveBeenCalledTimes(1);
    expect(askedFor(HDS)).toEqual([at]);
  });

  test('keeps a search under the concurrency cap', async () => {
    let live = 0;
    let most = 0;
    availability.mockImplementation(
      () => new Promise(resolve => {
        live += 1;
        most = Math.max(most, live);
        setTimeout(() => {
          live -= 1;
          resolve(OPEN);
        }, 0);
      })
    );
    const start = new Date(2026, 8, 15, 11, 0).getTime();
    const plans = Array.from({ length: 20 }, (_, i) => pickupAt(start + i * 60000));

    await screenShuttlePickups(plans);

    expect(availability).toHaveBeenCalledTimes(20);
    expect(most).toBeLessThanOrEqual(MAX_PARALLEL_CHECKS);
  });

  test('keeps every plan of a service whose check failed, even ones called closed', async () => {
    // Dropping the 2:35 pickup while keeping the 2:40 one whose check timed out
    // would show the rider a later shuttle than the one taken away.
    const closed = new Date(2026, 8, 15, 14, 35).getTime();
    const unanswered = new Date(2026, 8, 15, 14, 40).getTime();
    availability.mockImplementation((id, at) =>
      at === unanswered ? Promise.reject('down') : Promise.resolve(CLOSED)
    );

    const plans = [pickupAt(closed), pickupAt(unanswered)];
    const screened = await screenShuttlePickups(plans);

    expect(screened.plans).toEqual(plans);
    expect(screened.closed).toBe(null);
    expect(screened.unconfirmed).toEqual(['hail']);
  });

  test('a failed check for one service does not keep another service open', async () => {
    const at = new Date(2026, 8, 15, 9, 0).getTime();
    availability.mockImplementation(id =>
      id === UB ? Promise.reject('down') : Promise.resolve(CLOSED)
    );
    const plans = [pickupAt(at), { legs: [{ mode: 'ubshuttle', startTime: at }] }];

    const screened = await screenShuttlePickups(plans);

    expect(screened.plans).toEqual([plans[1]]);
    expect(screened.closed.service.key).toBe('hail');
    expect(screened.unconfirmed).toEqual(['ubshuttle']);
  });

  test('asks nothing when no plan uses a shuttle', async () => {
    const screened = await screenShuttlePickups([busOnly]);
    expect(screened.plans).toEqual([busOnly]);
    expect(screened.closed).toBe(null);
    expect(screened.unconfirmed).toEqual([]);
    expect(availability).not.toHaveBeenCalled();
  });
});

describe('useServiceAvailability', () => {
  test('asks about the picked time to the minute and reports the answer', async () => {
    const picked = new Date(2026, 8, 15, 9, 0, 42);
    availability.mockResolvedValue(CLOSED);

    const { result } = renderHook(() => useServiceAvailability('hds', picked));
    expect(result.current).toBe('loading');
    await waitFor(() => expect(result.current).toBe('unavailable'));
    expect(availability).toHaveBeenCalledWith(
      'hds',
      new Date(2026, 8, 15, 9, 0, 0).getTime()
    );
  });

  test('asks again when the picked time changes and does not reuse the old answer', async () => {
    availability.mockResolvedValueOnce(CLOSED);
    const { result, rerender } = renderHook(
      ({ when }) => useServiceAvailability('hds', when),
      { initialProps: { when: new Date(2026, 8, 15, 9, 0) } }
    );
    await waitFor(() => expect(result.current).toBe('unavailable'));

    let answer;
    availability.mockImplementationOnce(
      () => new Promise(resolve => { answer = resolve; })
    );
    rerender({ when: new Date(2026, 8, 15, 11, 0) });
    expect(result.current).toBe('loading');

    answer(OPEN);
    await waitFor(() => expect(result.current).toBe('available'));
    expect(availability).toHaveBeenCalledTimes(2);
  });

  test('asks nothing when there is no time to ask about', () => {
    const { result } = renderHook(() => useServiceAvailability('hds', null));
    expect(result.current).toBe('not-asked');
    expect(availability).not.toHaveBeenCalled();
  });

  test('a time that is not a time is unknown', async () => {
    const { result } = renderHook(() => useServiceAvailability('hds', 'soon'));
    await waitFor(() => expect(result.current).toBe('unknown'));
    expect(availability).not.toHaveBeenCalled();
  });
});
