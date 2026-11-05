import { describe, expect, test } from 'vitest';

import genLocales from '../models/locales';
import {
  VERDICT_STALE_MS,
  readMarkedRides,
  readTimeline,
  readVerdict,
  reasonKey,
} from '../models/presence-status';

const NOW = 1757600000000;
const iso = ms => new Date(ms).toISOString();

const verdictBody = (overrides = {}) => ({
  vehicleId: 'v1',
  state: 'not_live',
  reason: 'app_background',
  since: iso(NOW - 4 * 60000),
  evaluatedAt: iso(NOW - 5000),
  side: 'device',
  lastHeardAt: iso(NOW - 90000),
  shift: { id: 's1', rosterDriverId: 'Pat', startedAt: iso(NOW - 3600000), state: 'open' },
  device: {
    appVersion: '1.40.0',
    locPermission: 'precise',
    batteryPct: 41.6,
    network: 'cell',
    powerSaver: true,
  },
  ...overrides,
});

// The English sentence for every reason the presence service can send. The
// call center card, minitron and megatron each assert this same list, so a
// reason reads the same in all three.
const CANONICAL_SENTENCES = [
  ['no_shift_today', 'No driver has started a shift today.'],
  ['on_break', 'The driver is on a break.'],
  ['shift_ended', 'The driver ended the shift.'],
  ['off_duty', 'The driver marked themselves off duty.'],
  ['no_gps', 'The tablet cannot get a GPS position.'],
  ['app_background', 'The driver app is not on the tablet screen.'],
  ['location_off', 'Location is turned off on the tablet.'],
  ['permission_denied', 'The driver app is not allowed to use location.'],
  ['silent', 'The tablet has stopped checking in.'],
  ['signed_out', 'The driver is signed out of the app.'],
  ['fix_stale', 'The tablet is checking in, but its GPS position is getting old.'],
  ['checkins_missing', 'The tablet has stopped checking in and its GPS position is getting old.'],
  ['evaluator_stale', 'Our system has not refreshed the tablet status recently, so we cannot tell.'],
  ['db_unhealthy', 'Our system cannot read the tablet status right now.'],
  ['receiver_unhealthy', 'Our system is not receiving tablet updates right now.'],
  ['canary_failed', 'Our system failed its own check, so the tablet status cannot be trusted right now.'],
  ['untrusted', 'The tablet is not signed in as a trusted device, so its status is not counted.'],
  ['sharing_off:sleeping_app', 'The tablet has put the driver app to sleep.'],
  ['sharing_off:service_stopped', 'The location service for the driver app has stopped on the tablet.'],
  ['sharing_off:power_saver', 'Power saver on the tablet is limiting location sharing.'],
  ['sharing_off:no_network', 'The tablet has no network connection.'],
  ['sharing_off:mock_location', 'The tablet is sending a test location instead of a real one.'],
  ['sharing_off:something_new', 'Location sharing is turned off on the tablet.'],
  ['not_listed', 'Tablet status is not published for this vehicle.'],
  ['brand_new_reason', 'The tablet is not reporting.'],
];

describe('reasonKey', () => {
  const en = genLocales().presence.en;
  const es = genLocales().presence.es;

  test.each(CANONICAL_SENTENCES)('%s reads as the canonical sentence', (reason, sentence) => {
    expect(en[reasonKey(reason, 'not_live')]).toBe(sentence);
  });

  test('every reason has a Spanish sentence of its own', () => {
    CANONICAL_SENTENCES.forEach(([reason]) => {
      const key = reasonKey(reason, 'not_live');
      expect(es[key]).toBeTruthy();
      if (key !== 'reasonOther') expect(es[key]).not.toBe(en[key]);
    });
  });

  test('an unrecognized reason falls back to the state', () => {
    expect(reasonKey('brand_new', 'not_live')).toBe('reasonOther');
    expect(reasonKey(null, 'degraded')).toBe('detailDegraded');
    expect(reasonKey('brand_new', 'unknown')).toBe('detailUnknown');
  });
});

describe('at-risk ride reasons', () => {
  const en = genLocales().presence.en;
  const body = reason => ({ rides: [{ id: 'r1', datetime: iso(NOW), atRisk: { since: iso(NOW), reason } }] });

  test.each([
    ['no_live_vehicle', 'No shuttle tablet is reporting for this ride.'],
    ['no_vehicle_accepted', 'No driver accepted this ride.'],
    ['offer_declined', 'The driver declined this ride.'],
    ['off_duty', 'The driver marked themselves off duty.'],
  ])('%s reads as a sentence', (reason, sentence) => {
    const ride = readMarkedRides(body(reason))[0].atRisk;
    expect(ride.hasReason).toBe(true);
    expect(en[ride.reasonKey]).toBe(sentence);
  });

  test('a reason the page does not know is left to the general sentence', () => {
    expect(readMarkedRides(body('brand_new'))[0].atRisk.hasReason).toBe(false);
  });
});

describe('readVerdict', () => {
  test('reads a fresh answer', () => {
    const v = readVerdict(verdictBody(), NOW);
    expect(v.state).toBe('not_live');
    expect(v.side).toBe('device');
    expect(v.lastHeardMs).toBe(90000);
    expect(v.shift.driver).toBeUndefined();
    expect(v.device.map(f => f.key)).toEqual([
      'factAppVersion', 'factLocation', 'factBattery', 'factNetwork', 'factPowerSaver',
    ]);
    expect(v.device[2].values.pct).toBe(42);
  });

  test('an answer older than the stale bound is unknown and on our side', () => {
    const v = readVerdict(
      verdictBody({ state: 'live', evaluatedAt: iso(NOW - VERDICT_STALE_MS - 1000) }),
      NOW
    );
    expect(v.state).toBe('unknown');
    expect(v.side).toBe('ours');
    expect(v.reason).toBe('evaluator_stale');
  });

  test('leaves off device facts the tablet did not send', () => {
    const v = readVerdict(verdictBody({ device: { appVersion: '1.40.0' } }), NOW);
    expect(v.device.map(f => f.key)).toEqual(['factAppVersion']);
    expect(readVerdict(verdictBody({ device: null }), NOW).device).toBeNull();
  });

  test('an unreadable answer is null', () => {
    expect(readVerdict(null, NOW)).toBeNull();
    expect(readVerdict({ state: 'weird' }, NOW)).toBeNull();
  });
});

describe('readTimeline', () => {
  const events = [
    { at: iso(NOW - 600000), type: 'state', state: 'not_live', reason: 'on_break' },
    { at: iso(NOW - 3600000), type: 'shift_start' },
    { at: iso(NOW - 3590000), type: 'state', state: 'live' },
    { at: iso(NOW - 660000), type: 'break' },
    { at: iso(NOW - 300000), type: 'resume' },
    { at: iso(NOW - 200000), type: 'state', state: 'degraded' },
  ];

  test('builds shift lines and reporting periods in time order', () => {
    const tl = readTimeline({ events });
    expect(tl.shift.map(s => s.kind)).toEqual(['start', 'break']);
    expect(tl.shift[1].endMs).toBe(NOW - 300000);
    expect(tl.periods.map(p => [p.reporting, p.endMs === null])).toEqual([
      [true, false],
      [false, false],
      [true, true],
    ]);
    expect(tl.periods[1].reason).toBe('on_break');
  });

  test('live then degraded is one reporting period', () => {
    const tl = readTimeline({
      events: [
        { at: iso(NOW - 3000), type: 'state', state: 'live' },
        { at: iso(NOW - 2000), type: 'state', state: 'degraded' },
      ],
    });
    expect(tl.periods).toHaveLength(1);
  });

  test('a missing list is unavailable, not an empty day', () => {
    expect(readTimeline(null)).toBeNull();
    expect(readTimeline({ events: [] })).toEqual({ shift: [], periods: [] });
  });
});

describe('readMarkedRides', () => {
  test('keeps only rides that are at risk or unseen', () => {
    const rides = readMarkedRides({
      rides: [
        { id: 'a', datetime: iso(NOW), atRisk: { since: iso(NOW - 1000), reason: 'silent' } },
        { id: 'b', datetime: iso(NOW), atRisk: null },
        { id: 'c', datetime: iso(NOW), notice: { state: 'unseen', since: iso(NOW - 5000) } },
        { id: 'd', datetime: iso(NOW), notice: { state: 'accepted' } },
      ],
    });
    expect(rides.map(r => r.id)).toEqual(['a', 'c']);
    expect(rides[0].atRisk.reasonKey).toBe('reasonSilent');
    expect(rides[1].unseen.sinceMs).toBe(NOW - 5000);
  });

  test('a missing list marks nothing', () => {
    expect(readMarkedRides(null)).toEqual([]);
  });
});

describe('presence copy', () => {
  const copy = genLocales().presence;
  test('has the same keys in both languages', () => {
    expect(Object.keys(copy.es).sort()).toEqual(Object.keys(copy.en).sort());
  });
  test('uses plain ASCII in English', () => {
    for (const value of Object.values(copy.en)) {
      expect(value).toMatch(/^[\x20-\x7e]+$/);
    }
  });
});
