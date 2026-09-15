// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { cleanup, renderHook, waitFor } from '@testing-library/react';

import useServiceAvailability, {
  availabilityVerdict,
  checkServiceAvailability,
} from '../hooks/useServiceAvailability';
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

  test('a time that is not a time is unknown', async () => {
    const { result } = renderHook(() => useServiceAvailability('hds', 'soon'));
    await waitFor(() => expect(result.current).toBe('unknown'));
    expect(availability).not.toHaveBeenCalled();
  });
});
