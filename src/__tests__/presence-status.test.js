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

describe('reasonKey', () => {
  const copy = genLocales().presence.en;
  const reasons = [
    'no_shift_today', 'on_break', 'shift_ended', 'off_duty', 'no_gps',
    'app_background', 'location_off', 'permission_denied', 'sharing_off:native',
    'silent', 'signed_out',
  ];

  test.each(reasons)('%s has its own short sentence', reason => {
    const key = reasonKey(reason, 'not_live');
    expect(key).not.toBe('reasonOther');
    expect(copy[key]).toMatch(/\.$/);
  });

  test('an unrecognized reason falls back to the state', () => {
    expect(reasonKey('brand_new', 'not_live')).toBe('reasonOther');
    expect(reasonKey(null, 'degraded')).toBe('detailDegraded');
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
    expect(v.reason).toBeNull();
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
