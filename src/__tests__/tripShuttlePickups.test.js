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

  test('keeps the plans when the check cannot be read', async () => {
    const trip = makeTrip();
    const late = shuttlePlan(LATE_PICKUP);
    generate.mockImplementation((request, preferences, queryId) =>
      Promise.resolve({ id: queryId, plans: [late, busPlan] })
    );
    availability.mockRejectedValue('down');

    await expect(trip.generatePlans()).resolves.toEqual([late, busPlan]);
  });
});
