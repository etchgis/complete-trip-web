import { describe, expect, test } from 'vitest';

import genLocales from '../models/locales';

import {
  CONTACT_STALE_MS,
  FEED_REPORT_WINDOW_MS,
  advanceAge,
  ageOf,
  carryReportAge,
  deriveStatus,
  deriveVerdict,
  describeAge,
  readAvailability,
  readClock,
  readVehicle,
  summarizeDutyPeriods,
} from '../models/shuttle-status';

const NOW = 1757600000000;

const feedWith = vehicle => ({ vehicles: [vehicle] });

const driverVehicle = (overrides = {}) => ({
  vehicleId: 'v1',
  coordinates: [-78.86, 42.89],
  speed: 12,
  heading: 90,
  timestamp: NOW - 30000,
  source: 'mobile-app',
  location: {
    coordinates: [-78.86, 42.89],
    heading: 90,
    speed: 12,
    timestamp: NOW - 30000,
  },
  stale: false,
  ageSeconds: 30,
  lastSeenTs: NOW - 30000,
  ...overrides,
});

const poll = (overrides = {}) => ({
  availability: null,
  vehicleFeedOk: true,
  vehicle: null,
  title: null,
  requestedAt: NOW,
  ...overrides,
});

const available = (overrides = {}) => ({
  isAvailable: true,
  todayHours: [{ start: '10:30', end: '14:30' }],
  hoursDisplay: '10:30 AM - 2:30 PM',
  ...overrides,
});

describe('readVehicle', () => {
  test('reads the position, the server measured age and the fix time', () => {
    const vehicle = readVehicle(feedWith(driverVehicle()));
    expect(vehicle.coordinates).toEqual([-78.86, 42.89]);
    expect(vehicle.contactAgeMs).toBe(30000);
    expect(vehicle.fixTimestamp).toBe(NOW - 30000);
    expect(vehicle.stale).toBe(false);
  });

  test('returns null when the feed reports no vehicle', () => {
    expect(readVehicle({ vehicles: [] })).toBe(null);
    expect(readVehicle({})).toBe(null);
    expect(readVehicle(null)).toBe(null);
  });

  test('returns null when a vehicle carries no coordinates', () => {
    const vehicle = driverVehicle();
    delete vehicle.coordinates;
    delete vehicle.location.coordinates;
    expect(readVehicle(feedWith(vehicle))).toBe(null);
  });

  test('reads past an entry with no coordinates to one that has them', () => {
    const parked = driverVehicle({ vehicleId: 'v0', ageSeconds: 5 });
    delete parked.coordinates;
    delete parked.location.coordinates;
    const vehicle = readVehicle({
      vehicles: [parked, driverVehicle({ ageSeconds: 40 })],
    });
    expect(vehicle).not.toBe(null);
    expect(vehicle.contactAgeMs).toBe(40000);
  });

  test('takes the freshest vehicle, not the first one listed', () => {
    // The feed answers with every vehicle the organization's drivers are signed
    // into, in no particular order. At a shift change a vehicle parked at the
    // depot and the one carrying riders are both in the list.
    const ghost = driverVehicle({
      vehicleId: 'parked',
      ageSeconds: 280,
      coordinates: [-78.9, 42.95],
      location: { coordinates: [-78.9, 42.95], timestamp: NOW - 280000 },
    });
    const live = driverVehicle({ vehicleId: 'live', ageSeconds: 8 });

    expect(readVehicle({ vehicles: [ghost, live] }).coordinates).toEqual(
      live.coordinates
    );
    expect(readVehicle({ vehicles: [live, ghost] }).coordinates).toEqual(
      live.coordinates
    );
  });

  test('takes a working shuttle over a fresher one whose driver went off duty', () => {
    // One tablet has just gone off duty while the shuttle carrying riders last
    // reported 40 seconds ago. The working one is the shuttle an agent can
    // tell a rider about.
    const offDuty = driverVehicle({
      vehicleId: 'break',
      ageSeconds: 5,
      onDuty: false,
      coordinates: [-78.9, 42.95],
      location: { coordinates: [-78.9, 42.95], timestamp: NOW - 5000 },
    });
    const working = driverVehicle({ vehicleId: 'working', ageSeconds: 40, onDuty: true });

    [[offDuty, working], [working, offDuty]].forEach(vehicles => {
      const chosen = readVehicle({ vehicles });
      expect(chosen.onDuty).toBe(true);
      expect(chosen.contactAgeMs).toBe(40000);
    });
  });

  test('counts a vehicle that sends no duty state as working', () => {
    const offDuty = driverVehicle({ vehicleId: 'break', ageSeconds: 5, onDuty: false });
    const olderApp = driverVehicle({ vehicleId: 'older-app', ageSeconds: 50 });
    expect(readVehicle({ vehicles: [offDuty, olderApp] }).onDuty).toBe(null);
  });

  test('takes the freshest of several working shuttles', () => {
    const vehicles = [
      driverVehicle({ vehicleId: 'a', ageSeconds: 200, onDuty: true }),
      driverVehicle({ vehicleId: 'b', ageSeconds: 3, onDuty: false }),
      driverVehicle({ vehicleId: 'c', ageSeconds: 70, onDuty: true }),
    ];
    expect(readVehicle({ vehicles }).contactAgeMs).toBe(70000);
  });

  test('falls back to the freshest off-duty report when no working shuttle is in the window', () => {
    const vehicles = [
      driverVehicle({ vehicleId: 'late', ageSeconds: 20, onDuty: false }),
      driverVehicle({ vehicleId: 'early', ageSeconds: 90, onDuty: false }),
      // Past the feed window, so it says nothing about a shuttle out now.
      driverVehicle({ vehicleId: 'gone', ageSeconds: 400, onDuty: true }),
    ];
    const chosen = readVehicle({ vehicles });
    expect(chosen.onDuty).toBe(false);
    expect(chosen.contactAgeMs).toBe(20000);
  });

  test('prefers any vehicle with an age over one the feed gave no age for', () => {
    const unaged = driverVehicle({ vehicleId: 'unaged' });
    delete unaged.ageSeconds;
    const aged = driverVehicle({ vehicleId: 'aged', ageSeconds: 200 });
    expect(readVehicle({ vehicles: [unaged, aged] }).contactAgeMs).toBe(200000);
  });

  test('skips an entry whose coordinates are not numbers', () => {
    const text = driverVehicle({
      coordinates: ['-78.86', '42.89'],
      location: { coordinates: ['-78.86', '42.89'], timestamp: NOW },
    });
    const empty = driverVehicle({
      coordinates: [null, NaN],
      location: { coordinates: [null, NaN], timestamp: NOW },
    });
    expect(readVehicle(feedWith(text))).toBe(null);
    expect(readVehicle(feedWith(empty))).toBe(null);
  });

  test('reports a missing server age as absent rather than as zero', () => {
    const vehicle = driverVehicle();
    delete vehicle.ageSeconds;
    expect(readVehicle(feedWith(vehicle)).contactAgeMs).toBe(null);
  });
});

describe('readAvailability', () => {
  test('reads a running service', () => {
    const availability = readAvailability(available());
    expect(availability.running).toBe(true);
    expect(availability.configured).toBe(true);
    expect(availability.todayHours).toEqual([{ start: '10:30', end: '14:30' }]);
    expect(availability.notice).toBe(null);
  });

  test('an available answer with no hours in it is not a configured service', () => {
    // The check answers "available" with no hours when it holds no
    // configuration for the service, which is what a failed configuration load
    // looks like from here.
    const availability = readAvailability({
      isAvailable: true,
      todayHours: [],
      hoursDisplay: 'Hours not configured',
    });
    expect(availability.configured).toBe(false);
    expect(availability.todayHours).toEqual([]);
  });

  test('keeps only hours that are real clock times', () => {
    const closed = readAvailability({
      isAvailable: false,
      reason: 'day_not_scheduled',
      details: 'Service does not operate on this day',
      todayHours: [],
      hoursDisplay: 'Closed today',
    });
    expect(closed.todayHours).toEqual([]);

    const garbled = readAvailability(
      available({
        todayHours: [{ start: '10:30', end: '14:30' }, { start: 'noon', end: 5 }],
      })
    );
    expect(garbled.todayHours).toEqual([{ start: '10:30', end: '14:30' }]);
  });

  test('keeps a dispatcher warning that does not stop the service', () => {
    // A detour or reduced service arrives on a running answer, with no details
    // of its own, only the alert.
    const detour = readAvailability(
      available({
        activeAlert: {
          id: 'detour-main-st',
          effect: 'DETOUR',
          headerText: { text: 'Detour on Main St' },
          descriptionText: { text: 'Stops between Utica and Ferry are skipped.' },
        },
      })
    );
    expect(detour.running).toBe(true);
    expect(detour.notice).toEqual({
      header: 'Detour on Main St',
      description: 'Stops between Utica and Ferry are skipped.',
    });
  });

  test('does not repeat the driver off duty alert as a notice', () => {
    const offDuty = readAvailability({
      isAvailable: false,
      reason: 'service_alert',
      details: 'Nobody is driving',
      activeAlert: {
        id: 'driver-off-duty-nfta-1',
        headerText: { text: 'Community Shuttle Not Running' },
      },
      todayHours: [{ start: '10:30', end: '14:30' }],
    });
    expect(offDuty.notice).toBe(null);
  });

  test('reads when the service is next scheduled', () => {
    const closed = readAvailability({
      isAvailable: false,
      reason: 'outside_hours',
      todayHours: [{ start: '10:30', end: '14:30' }],
      nextAvailable: {
        date: '2026-09-16',
        window: { start: '10:30', end: '14:30' },
      },
    });
    expect(closed.nextAvailable).toEqual({
      date: '2026-09-16',
      window: { start: '10:30', end: '14:30' },
    });

    const garbled = readAvailability({
      isAvailable: false,
      reason: 'outside_hours',
      todayHours: [],
      nextAvailable: { date: 'tomorrow', window: { start: '10:30' } },
    });
    expect(garbled.nextAvailable).toBe(null);
  });

  test('separates a driver off duty stoppage from the published hours', () => {
    const offDuty = readAvailability({
      isAvailable: false,
      reason: 'service_alert',
      details: 'Nobody is driving',
      activeAlert: { id: 'driver-off-duty-nfta-1' },
      todayHours: [{ start: '10:30', end: '14:30' }],
      hoursDisplay: '10:30 AM - 2:30 PM',
    });
    expect(offDuty.reason).toBe('no-driver');

    const outsideHours = readAvailability({
      isAvailable: false,
      reason: 'outside_hours',
      todayHours: [{ start: '10:30', end: '14:30' }],
      hoursDisplay: '10:30 AM - 2:30 PM',
    });
    expect(outsideHours.reason).toBe('outside_hours');
  });

  test('returns null for a body that does not answer the question', () => {
    expect(readAvailability({})).toBe(null);
    expect(readAvailability(null)).toBe(null);
  });
});

describe('readClock', () => {
  test('splits a schedule time into the pieces each language prints', () => {
    expect(readClock('14:30')).toEqual({
      hour: 14,
      hour12: 2,
      minute: '30',
      meridiem: 'PM',
    });
    expect(readClock('00:05')).toEqual({
      hour: 0,
      hour12: 12,
      minute: '05',
      meridiem: 'AM',
    });
  });

  test('refuses anything that is not a clock time', () => {
    expect(readClock('25:00')).toBe(null);
    expect(readClock('noon')).toBe(null);
    expect(readClock(1030)).toBe(null);
  });
});

describe('carryReportAge', () => {
  test('the same report never reads younger on a later poll', () => {
    // The first request took four seconds to answer, so its round trip counts
    // as age. The second answered at once. Without carrying the larger age the
    // shuttle would appear to have reported more recently than it did.
    const report = { lastSeenTs: NOW - 100000 };
    const first = {
      vehicle: readVehicle(feedWith(driverVehicle({ ...report, ageSeconds: 104 }))),
      requestedAt: NOW,
    };
    const second = {
      vehicle: readVehicle(feedWith(driverVehicle({ ...report, ageSeconds: 110 }))),
      requestedAt: NOW + 10000,
    };
    const kept = carryReportAge(first, second);
    expect(kept.contactAgeMs).toBe(114000);

    const shownBefore = deriveStatus({
      poll: poll({ vehicle: first.vehicle, requestedAt: first.requestedAt }),
      history: {},
      now: NOW + 10000,
    }).position.ageMs;
    const shownAfter = deriveStatus({
      poll: poll({ vehicle: kept, requestedAt: second.requestedAt }),
      history: {},
      now: NOW + 10000,
    }).position.ageMs;
    expect(shownAfter).toBeGreaterThanOrEqual(shownBefore);
  });

  test('a new report starts from its own age', () => {
    const first = {
      vehicle: readVehicle(
        feedWith(driverVehicle({ lastSeenTs: NOW - 100000, ageSeconds: 100 }))
      ),
      requestedAt: NOW,
    };
    const second = {
      vehicle: readVehicle(
        feedWith(driverVehicle({ lastSeenTs: NOW + 8000, ageSeconds: 2 }))
      ),
      requestedAt: NOW + 10000,
    };
    expect(carryReportAge(first, second).contactAgeMs).toBe(2000);
  });

  test('a report with no times is aged from when the page first saw it', () => {
    const raw = driverVehicle();
    delete raw.ageSeconds;
    delete raw.lastSeenTs;
    delete raw.timestamp;
    delete raw.location.timestamp;
    const first = { vehicle: readVehicle(feedWith(raw)), requestedAt: NOW };
    const kept = carryReportAge(
      { vehicle: carryReportAge(null, first), requestedAt: NOW },
      { vehicle: readVehicle(feedWith(raw)), requestedAt: NOW + 30000 }
    );
    const status = deriveStatus({
      poll: poll({ vehicle: kept, requestedAt: NOW + 30000 }),
      history: {},
      now: NOW + 40000,
    });
    expect(status.position.ageBasis).toBe('observation');
    expect(status.position.ageMs).toBe(40000);
  });
});

describe('ages', () => {
  test('an age is never negative when a clock runs ahead', () => {
    expect(ageOf(NOW + 90000, NOW)).toBe(0);
    expect(advanceAge(0, NOW + 90000, NOW)).toBe(0);
  });

  test('a server measured age keeps counting from the moment it arrived', () => {
    expect(advanceAge(30000, NOW, NOW + 45000)).toBe(75000);
  });

  test('an absent timestamp produces no age rather than a zero', () => {
    expect(ageOf(undefined, NOW)).toBe(null);
    expect(advanceAge(null, NOW, NOW)).toBe(null);
  });

  test('describes an age in the units the copy uses', () => {
    expect(describeAge(45000)).toEqual({ unit: 'moment' });
    expect(describeAge(25 * 60000)).toEqual({ unit: 'minutes', minutes: 25 });
    expect(describeAge(65 * 60000)).toEqual({
      unit: 'hoursMinutes',
      hours: 1,
      minutes: 5,
    });
  });

  test('refuses to quote a number beyond a day', () => {
    expect(describeAge(25 * 60 * 60000)).toEqual({ unit: 'overADay' });
  });
});

describe('summarizeDutyPeriods', () => {
  test('an absent list is unavailable, not an empty day', () => {
    expect(summarizeDutyPeriods(undefined, NOW).available).toBe(false);
    expect(summarizeDutyPeriods([], NOW).available).toBe(true);
  });

  test('totals closed and open stretches and marks the open one', () => {
    const summary = summarizeDutyPeriods(
      [
        { start: NOW - 5 * 3600000, end: NOW - 3 * 3600000 },
        { start: NOW - 2 * 3600000, end: null },
      ],
      NOW
    );
    expect(summary.segments).toHaveLength(2);
    expect(summary.segments[1].end).toBe(null);
    expect(summary.ongoing).toBe(true);
    expect(summary.totalMs).toBe(4 * 3600000);
  });

  test('a stretch cannot end in the future', () => {
    const summary = summarizeDutyPeriods(
      [{ start: NOW - 3600000, end: NOW + 3600000 }],
      NOW
    );
    expect(summary.segments[0].end).toBe(NOW);
    expect(summary.totalMs).toBe(3600000);
  });

  test('drops entries with no start or a backwards range', () => {
    const summary = summarizeDutyPeriods(
      [{ end: NOW }, { start: NOW, end: NOW - 1000 }, null],
      NOW
    );
    expect(summary.segments).toHaveLength(0);
  });
});

describe('deriveStatus service', () => {
  test('is unknown, not stopped, when the schedule cannot be read', () => {
    const status = deriveStatus({ poll: poll(), history: {}, now: NOW });
    expect(status.service.state).toBe('unknown');
  });

  test('an available service with no configured hours is unknown, not running', () => {
    const status = deriveStatus({
      poll: poll({
        availability: readAvailability({
          isAvailable: true,
          todayHours: [],
          hoursDisplay: 'Hours not configured',
        }),
      }),
      history: {},
      now: NOW,
    });
    expect(status.service.state).toBe('unknown');
  });

  test('reports a driver off duty separately from closed hours', () => {
    const offDuty = deriveStatus({
      poll: poll({
        availability: { running: false, configured: true, reason: 'no-driver' },
      }),
      history: {},
      now: NOW,
    });
    expect(offDuty.service.state).toBe('no-driver');

    const closed = deriveStatus({
      poll: poll({
        availability: {
          running: false,
          configured: true,
          reason: 'outside_hours',
        },
      }),
      history: {},
      now: NOW,
    });
    expect(closed.service.state).toBe('not-running');
  });
});

describe('deriveStatus position', () => {
  test('a fresh vehicle is reporting, aged by the server measurement', () => {
    const status = deriveStatus({
      poll: poll({
        vehicle: readVehicle(feedWith(driverVehicle())),
        title: 'Main St',
      }),
      history: {},
      now: NOW + 5000,
    });
    expect(status.position.state).toBe('reporting');
    expect(status.position.ageBasis).toBe('contact');
    expect(status.position.ageMs).toBe(35000);
    expect(status.position.location.title).toBe('Main St');
  });

  test('a vehicle past the contact window is reported as out of date', () => {
    const vehicle = readVehicle(
      feedWith(driverVehicle({ ageSeconds: CONTACT_STALE_MS / 1000 + 30 }))
    );
    const status = deriveStatus({
      poll: poll({ vehicle, title: 'Main St' }),
      history: {},
      now: NOW,
    });
    expect(status.position.state).toBe('out-of-date');
    expect(status.position.location.title).toBe('Main St');
  });

  test('a position the page is still holding goes out of date as time passes', () => {
    // Polls are not evenly spaced. A failed request backs the next one off and
    // a background tab stops asking, so a position that arrived fresh can be
    // the newest thing on screen minutes later.
    const vehicle = readVehicle(feedWith(driverVehicle({ ageSeconds: 20 })));
    const status = deriveStatus({
      poll: poll({ vehicle, title: 'Main St' }),
      history: {},
      now: NOW + 3 * 60000,
    });
    expect(status.position.state).toBe('out-of-date');
    expect(status.position.location.title).toBe('Main St');
  });

  test('the feed saying stale marks the position out of date on its own', () => {
    const vehicle = readVehicle(
      feedWith(driverVehicle({ stale: true, ageSeconds: 5 }))
    );
    const status = deriveStatus({
      poll: poll({ vehicle }),
      history: {},
      now: NOW,
    });
    expect(status.position.state).toBe('out-of-date');
  });

  test('a position the feed serves past its own window has dropped off the feed', () => {
    const vehicle = readVehicle(
      feedWith(
        driverVehicle({
          isStale: true,
          ageSeconds: FEED_REPORT_WINDOW_MS / 1000 + 60,
        })
      )
    );
    const status = deriveStatus({
      poll: poll({ vehicle, title: 'Main St' }),
      history: {},
      now: NOW,
    });
    expect(status.position.state).toBe('no-contact');
    expect(status.position.location.title).toBe('Main St');
  });

  test('an empty feed with nothing held is no-report, not lost contact', () => {
    const status = deriveStatus({ poll: poll(), history: {}, now: NOW });
    expect(status.position.state).toBe('no-report');
    expect(status.position.location).toBe(null);
  });

  test('a position older than this page is shown normally, with its real age', () => {
    // The feed serves positions from before the page opened. One of those must
    // render as a position, never as "nothing reported".
    const vehicle = readVehicle(feedWith(driverVehicle({ ageSeconds: 240 })));
    const status = deriveStatus({
      poll: poll({ vehicle, title: 'Main St' }),
      history: {},
      now: NOW,
    });
    expect(status.position.state).not.toBe('no-report');
    expect(status.position.location.title).toBe('Main St');
    expect(status.position.ageMs).toBe(240000);
  });

  test('an empty feed after a sighting keeps the last location and its age', () => {
    const status = deriveStatus({
      poll: poll(),
      history: {
        lastVehicle: readVehicle(feedWith(driverVehicle({ ageSeconds: 10 }))),
        lastAskedAt: NOW - 300000,
        lastTitle: 'Main St',
      },
      now: NOW,
    });
    expect(status.position.state).toBe('no-contact');
    expect(status.position.location.title).toBe('Main St');
    expect(status.position.ageMs).toBe(310000);
    expect(status.position.ageBasis).toBe('contact');
  });

  test('a failed feed request is unreachable, not the shuttle stopping', () => {
    const status = deriveStatus({
      poll: poll({ vehicleFeedOk: false }),
      history: {},
      now: NOW,
    });
    expect(status.position.state).toBe('unreachable');
  });

  test('an off duty report inside the feed window outranks an out of date position', () => {
    const vehicle = readVehicle(
      feedWith(driverVehicle({ onDuty: false, isStale: true, ageSeconds: 120 }))
    );
    const status = deriveStatus({
      poll: poll({ vehicle }),
      history: {},
      now: NOW,
    });
    expect(status.position.state).toBe('off-duty');
  });

  test('an off duty report older than the feed window is lost contact, not off duty', () => {
    const vehicle = readVehicle(
      feedWith(driverVehicle({ onDuty: false, ageSeconds: 600 }))
    );
    const status = deriveStatus({
      poll: poll({ vehicle }),
      history: {},
      now: NOW,
    });
    expect(status.position.state).toBe('no-contact');
    expect(status.position.ageMs).toBe(600000);
  });

  test('falls back to the device fix time when the server sends no age', () => {
    const raw = driverVehicle();
    delete raw.ageSeconds;
    const status = deriveStatus({
      poll: poll({ vehicle: readVehicle(feedWith(raw)) }),
      history: {},
      now: NOW,
    });
    expect(status.position.ageBasis).toBe('fix');
    expect(status.position.ageMs).toBe(30000);
  });

  test('falls back to when this page saw it when the feed sends no time at all', () => {
    const raw = driverVehicle();
    delete raw.ageSeconds;
    delete raw.timestamp;
    delete raw.location.timestamp;
    const status = deriveStatus({
      poll: poll({ vehicle: readVehicle(feedWith(raw)) }),
      history: {},
      now: NOW + 20000,
    });
    expect(status.position.ageBasis).toBe('observation');
    expect(status.position.ageMs).toBe(20000);
  });
});

describe('deriveVerdict', () => {
  const running = { state: 'running' };

  test('a running service whose shuttle dropped off the feed is not a clean green badge', () => {
    // The duty signal the schedule rests on only ever hears drivers sign on, so
    // a dead tablet leaves the service reading as running for hours.
    ['no-contact', 'no-report'].forEach(state => {
      const verdict = deriveVerdict(running, { state, ageMs: 20 * 60000 });
      expect(verdict.state).toBe('running-no-contact');
    });
  });

  test('a parked shuttle the feed still serves is not reported as lost', () => {
    // The driver app sends nothing while the vehicle stands still, so every
    // stop longer than a minute produces a stale position.
    const parked = deriveStatus({
      poll: poll({
        availability: readAvailability(available()),
        vehicle: readVehicle(feedWith(driverVehicle({ isStale: true, ageSeconds: 90 }))),
      }),
      history: {},
      now: NOW,
    });
    const verdict = deriveVerdict(parked.service, parked.position);
    expect(verdict.state).toBe('running-position-old');
    expect(verdict.ageMs).toBe(90000);
  });

  test('carries how long since contact, and nothing when there never was any', () => {
    expect(
      deriveVerdict(running, { state: 'no-contact', ageMs: 20 * 60000 }).ageMs
    ).toBe(20 * 60000);
    expect(
      deriveVerdict(running, { state: 'no-report', ageMs: null }).ageMs
    ).toBe(null);
  });

  test('a running service whose driver reported off duty is not a green running badge', () => {
    ['off-duty report', 'old off-duty report'].forEach((name, i) => {
      const status = deriveStatus({
        poll: poll({
          availability: readAvailability(available()),
          vehicle: readVehicle(
            feedWith(driverVehicle({ onDuty: false, ageSeconds: i === 0 ? 30 : 1500 }))
          ),
        }),
        history: {},
        now: NOW,
      });
      const verdict = deriveVerdict(status.service, status.position);
      expect(verdict.state, name).not.toBe('running');
    });
    expect(
      deriveVerdict(running, { state: 'off-duty', ageMs: 30000 }).state
    ).toBe('running-driver-off-duty');
  });

  test('a working shuttle keeps the service running when another tablet just went off duty', () => {
    const verdictFor = vehicles => {
      const status = deriveStatus({
        poll: poll({
          availability: readAvailability(available()),
          vehicle: readVehicle({ vehicles }),
        }),
        history: {},
        now: NOW,
      });
      return deriveVerdict(status.service, status.position).state;
    };
    const offDuty = driverVehicle({ vehicleId: 'break', ageSeconds: 5, onDuty: false });

    expect(
      verdictFor([offDuty, driverVehicle({ vehicleId: 'live', ageSeconds: 40, onDuty: true })])
    ).toBe('running');
    expect(
      verdictFor([offDuty, driverVehicle({ vehicleId: 'parked', ageSeconds: 180, onDuty: true })])
    ).toBe('running-position-old');
    expect(verdictFor([offDuty])).toBe('running-driver-off-duty');
  });

  test('a shuttle that is reporting leaves the service verdict alone', () => {
    expect(deriveVerdict(running, { state: 'reporting', ageMs: 5000 }).state)
      .toBe('running');
  });

  test('a running service is not confirmed when the page cannot see the shuttle', () => {
    expect(
      deriveVerdict(running, { state: 'unreachable', ageMs: null }).state
    ).toBe('running-tracking-unavailable');
    expect(
      deriveVerdict(running, { state: 'unreachable', ageMs: 5 * 60000 }).state
    ).toBe('running-tracking-unavailable');
  });

  test('a service that is not running says so on its own', () => {
    expect(
      deriveVerdict({ state: 'no-driver' }, { state: 'no-contact', ageMs: 1 })
        .state
    ).toBe('no-driver');
    expect(
      deriveVerdict({ state: 'unknown' }, { state: 'no-report', ageMs: null })
        .state
    ).toBe('unknown');
  });
});

describe('the card copy', () => {
  const copy = genLocales().shuttleStatus;

  const values = strings =>
    Object.values(strings).flatMap(value =>
      typeof value === 'string' ? [value] : Object.values(value)
    );

  test('says the same things in both languages', () => {
    expect(Object.keys(copy.es).sort()).toEqual(Object.keys(copy.en).sort());
  });

  test('does not tell a Spanish speaking rider the shift is over', () => {
    // "Reported off duty" can be a lunch break with service resuming after it.
    // "Ha terminado su turno" tells a rider standing at a stop to go home.
    expect(copy.es.serviceNoDriverDetail).not.toContain('terminado su turno');
    expect(copy.es.positionOffDutyDetail).not.toContain('terminado su turno');
  });

  test('does not overstate a closed day or a missing driver in Spanish', () => {
    expect(copy.es.serviceNotRunning).toBe('Servicio no disponible');
    expect(copy.es.serviceNoDriver).toBe('No hay conductor de turno');
    expect(copy.es.positionNoReportDetail).toContain('m\u00e1s temprano hoy');
    expect(values(copy.es).join(' ')).not.toMatch(/\bAM\b|\bPM\b/);
  });

  test('talks about the shuttle, not about this page or its plumbing', () => {
    values(copy.en).forEach(value => {
      expect(value).not.toMatch(/\bfeeds?\b/i);
      expect(value).not.toMatch(/this page/i);
    });
    values(copy.es).forEach(value => {
      expect(value).not.toMatch(/esta p\u00e1gina/i);
      expect(value).not.toMatch(/los datos del veh\u00edculo/i);
    });
  });
});
