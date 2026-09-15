import { beforeEach, describe, expect, test, vi } from 'vitest';

import Trip from '../context/Trip';

const generate = vi.fn();
const availability = vi.fn();

vi.mock('../models/trip-plan', () => ({
  default: { generate: (...args) => generate(...args) },
}));

vi.mock('../services/transport/shuttle', () => ({
  default: { availability: (...args) => availability(...args) },
}));

const OPEN = {
  isAvailable: true,
  todayHours: [{ start: '10:30', end: '14:30' }],
};

const CLOSED = {
  isAvailable: false,
  reason: 'outside_hours',
  todayHours: [{ start: '10:30', end: '14:30' }],
  nextAvailable: { date: '2026-09-16', window: { start: '10:30', end: '14:30' } },
};

// An arrive-by trip for 2:45 PM. The shuttle plan picks the rider up at
// 2:40 PM, after the shuttle closes, even though nothing about the arrival
// time says so.
const ARRIVE = new Date(2026, 8, 15, 14, 45).getTime();
const LATE_PICKUP = new Date(2026, 8, 15, 14, 40).getTime();
const EARLY_PICKUP = new Date(2026, 8, 15, 14, 10).getTime();

const shuttlePlan = pickup => ({
  legs: [{ mode: 'HAIL', startTime: pickup, endTime: pickup + 300000 }],
});
const busPlan = { legs: [{ mode: 'BUS', startTime: ARRIVE - 1800000 }] };

beforeEach(() => {
  generate.mockReset();
  availability.mockReset();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

// Lets a search that has been answered run all the way to its end.
const flush = async () => {
  for (let i = 0; i < 5; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise(resolve => setTimeout(resolve, 0));
  }
};

const makeTrip = () => {
  const trip = new Trip({ preferences: {} });
  trip.updateWhenAction('arrive');
  trip.updateWhen(new Date(ARRIVE));
  return trip;
};

describe('planning a trip with the community shuttle', () => {
  test('drops a plan whose shuttle pickup is outside the shuttle hours', async () => {
    const trip = makeTrip();
    const late = shuttlePlan(LATE_PICKUP);
    const early = shuttlePlan(EARLY_PICKUP);
    generate.mockImplementation((request, preferences, queryId) =>
      Promise.resolve({ id: queryId, plans: [late, early, busPlan] })
    );
    availability.mockImplementation((id, at) =>
      Promise.resolve(at === LATE_PICKUP ? CLOSED : OPEN)
    );

    const plans = await trip.generatePlans();

    expect(plans).toEqual([early, busPlan]);
    expect(availability).not.toHaveBeenCalledWith(expect.anything(), ARRIVE);
    expect(availability).toHaveBeenCalledWith(expect.anything(), LATE_PICKUP);
    expect(trip.generatingPlans).toBe(false);
  });

  test('says which shuttle was dropped, when it runs and when it is next open', async () => {
    const trip = makeTrip();
    generate.mockImplementation((request, preferences, queryId) =>
      Promise.resolve({ id: queryId, plans: [shuttlePlan(LATE_PICKUP)] })
    );
    availability.mockResolvedValue(CLOSED);

    await trip.generatePlans();

    expect(trip.plans).toEqual([]);
    expect(trip.shuttleNotice.closed.service.key).toBe('hail');
    expect(trip.shuttleNotice.closed.at).toBe(LATE_PICKUP);
    expect(trip.shuttleNotice.closed.availability.todayHours).toEqual([
      { start: '10:30', end: '14:30' },
    ]);
    expect(trip.shuttleNotice.closed.availability.nextAvailable.date).toBe(
      '2026-09-16'
    );
    expect(trip.shuttleNotice.unconfirmed).toEqual([]);
  });

  test('keeps the plans and says the hours were not confirmed when the check cannot be read', async () => {
    const trip = makeTrip();
    const late = shuttlePlan(LATE_PICKUP);
    generate.mockImplementation((request, preferences, queryId) =>
      Promise.resolve({ id: queryId, plans: [late, busPlan] })
    );
    availability.mockRejectedValue('down');

    await expect(trip.generatePlans()).resolves.toEqual([late, busPlan]);
    expect(trip.shuttleNotice.closed).toBe(null);
    expect(trip.shuttleNotice.unconfirmed).toEqual(['hail']);
  });

  test('an older search finishing leaves the spinner and the plans to the newer one', async () => {
    const trip = makeTrip();
    const older = shuttlePlan(EARLY_PICKUP);
    const newer = busPlan;
    availability.mockResolvedValue(OPEN);

    let finishOlder;
    let finishNewer;
    generate
      .mockImplementationOnce((request, preferences, queryId) =>
        new Promise(resolve => {
          finishOlder = () => resolve({ id: queryId, plans: [older] });
        })
      )
      .mockImplementationOnce((request, preferences, queryId) =>
        new Promise(resolve => {
          finishNewer = () => resolve({ id: queryId, plans: [newer] });
        })
      );

    // Each search is identified by the clock, so two searches in the same
    // millisecond would be the same search.
    let clock = new Date(2026, 8, 15, 13, 0).getTime();
    vi.spyOn(Date, 'now').mockImplementation(() => {
      clock += 1;
      return clock;
    });

    trip.generatePlans();
    const second = trip.generatePlans();

    finishOlder();
    await flush();
    expect(trip.generatingPlans).toBe(true);
    expect(trip.plans).toEqual([]);

    finishNewer();
    await second;
    expect(trip.generatingPlans).toBe(false);
    expect(trip.plans).toEqual([newer]);
  });
});
