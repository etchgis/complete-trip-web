/**
 * Reads the driver tablet presence answers for the call center card.
 *
 * The presence service is the one place that decides whether a vehicle is live.
 * This file only turns its answers into things the card can print. It never
 * decides liveness itself.
 */

// The plain sentence for each not_live reason the service sends. A reason that
// starts with "sharing_off:" carries the tablet's own detail after the colon,
// which the call center does not need, so it maps to one sentence.
const REASON_KEYS = {
  no_shift_today: 'reasonNoShiftToday',
  on_break: 'reasonOnBreak',
  shift_ended: 'reasonShiftEnded',
  off_duty: 'reasonOffDuty',
  no_gps: 'reasonNoGps',
  app_background: 'reasonAppBackground',
  location_off: 'reasonLocationOff',
  permission_denied: 'reasonPermissionDenied',
  sharing_off: 'reasonSharingOff',
  silent: 'reasonSilent',
  signed_out: 'reasonSignedOut',
};

// What to say when the service sends a state with no reason we know.
const STATE_FALLBACK_KEYS = {
  live: 'detailLive',
  degraded: 'detailDegraded',
  not_live: 'reasonOther',
  unknown: 'detailUnknown',
};

const STATE_LABEL_KEYS = {
  live: 'stateLive',
  degraded: 'stateDegraded',
  not_live: 'stateNotLive',
  unknown: 'stateUnknown',
};

const STATE_TONES = {
  live: 'green',
  degraded: 'orange',
  not_live: 'red',
  unknown: 'gray',
};

// The service says the answer is unknown when its own evaluation is older than
// this, and the page applies the same bound to what it was served.
export const VERDICT_STALE_MS = 45 * 1000;

const KNOWN_STATES = Object.keys(STATE_LABEL_KEYS);

const toMs = value => {
  if (typeof value === 'number' && isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return isFinite(parsed) ? parsed : null;
  }
  return null;
};

export function reasonKey(reason, state) {
  if (typeof reason === 'string' && reason) {
    const base = reason.split(':')[0];
    if (REASON_KEYS[base]) return REASON_KEYS[base];
  }
  return STATE_FALLBACK_KEYS[state] || 'reasonOther';
}

/**
 * Cleans the verdict answer into the fields the card prints.
 *
 * An answer the page cannot read, or one whose evaluation is old, is shown as
 * unknown on our side, the same rule the service applies.
 */
export function readVerdict(body, now) {
  if (!body || typeof body !== 'object' || KNOWN_STATES.indexOf(body.state) === -1) {
    return null;
  }
  const evaluatedAt = toMs(body.evaluatedAt);
  const stale = evaluatedAt !== null && now - evaluatedAt > VERDICT_STALE_MS;
  const state = stale ? 'unknown' : body.state;
  const reason = stale ? null : body.reason || null;
  const side = stale ? 'ours' : body.side === 'device' || body.side === 'ours' ? body.side : null;
  const lastHeardAt = toMs(body.lastHeardAt);
  const shift = body.shift && typeof body.shift === 'object' ? body.shift : null;
  const device = body.device && typeof body.device === 'object' ? body.device : null;

  return {
    state,
    tone: STATE_TONES[state],
    labelKey: STATE_LABEL_KEYS[state],
    reasonKey: reasonKey(reason, state),
    reason,
    side,
    sinceMs: toMs(body.since),
    lastHeardMs: lastHeardAt === null ? null : Math.max(0, now - lastHeardAt),
    shift: shift
      ? {
        driver: shift.rosterDriverId || null,
        startedMs: toMs(shift.startedAt),
        state: shift.state || null,
      }
      : null,
    device: device ? readDevice(device) : null,
  };
}

const NETWORK_KEYS = { wifi: 'networkWifi', cell: 'networkCell', none: 'networkNone' };
const PERMISSION_KEYS = {
  precise: 'permissionPrecise',
  approximate: 'permissionApproximate',
  denied: 'permissionDenied',
};

// Only the facts the tablet actually sent. A missing one is left off, never
// printed as zero or off.
function readDevice(device) {
  const facts = [];
  if (device.appVersion) {
    facts.push({ key: 'factAppVersion', values: { version: device.appVersion } });
  }
  if (PERMISSION_KEYS[device.locPermission]) {
    facts.push({ key: 'factLocation', valueKey: PERMISSION_KEYS[device.locPermission] });
  }
  if (typeof device.batteryPct === 'number' && isFinite(device.batteryPct)) {
    facts.push({ key: 'factBattery', values: { pct: Math.round(device.batteryPct) } });
  }
  if (NETWORK_KEYS[device.network]) {
    facts.push({ key: 'factNetwork', valueKey: NETWORK_KEYS[device.network] });
  }
  if (typeof device.powerSaver === 'boolean') {
    facts.push({
      key: 'factPowerSaver',
      valueKey: device.powerSaver ? 'powerSaverOn' : 'powerSaverOff',
    });
  }
  return facts;
}

const LIVE_STATES = ['live', 'degraded'];

/**
 * Turns the day's events into shift lines and reporting periods.
 *
 * Events are sorted by time. A shift event is `shift_start`, `break`, `resume`
 * or `shift_end`. A `state` event carries the verdict state the vehicle moved
 * into. Live and degraded both count as reporting, because the gate counts them
 * as open. A period with no end is still going on.
 */
export function readTimeline(body) {
  const raw = body && Array.isArray(body.events) ? body.events : null;
  if (!raw) return null;

  const events = raw
    .map(e => ({ ...e, atMs: toMs(e && e.at) }))
    .filter(e => e.atMs !== null)
    .sort((a, b) => a.atMs - b.atMs);

  const shift = [];
  let openBreak = null;
  const periods = [];
  let openPeriod = null;

  for (const e of events) {
    if (e.type === 'shift_start') shift.push({ kind: 'start', startMs: e.atMs });
    else if (e.type === 'shift_end') {
      if (openBreak) {
        openBreak.endMs = e.atMs;
        openBreak = null;
      }
      shift.push({ kind: 'end', startMs: e.atMs });
    } else if (e.type === 'break') {
      openBreak = { kind: 'break', startMs: e.atMs, endMs: null };
      shift.push(openBreak);
    } else if (e.type === 'resume' && openBreak) {
      openBreak.endMs = e.atMs;
      openBreak = null;
    } else if (e.type === 'state' && KNOWN_STATES.indexOf(e.state) !== -1) {
      const reporting = LIVE_STATES.indexOf(e.state) !== -1;
      if (openPeriod && openPeriod.reporting === reporting) continue;
      if (openPeriod) openPeriod.endMs = e.atMs;
      openPeriod = {
        reporting,
        startMs: e.atMs,
        endMs: null,
        reason: reporting ? null : e.reason || null,
      };
      periods.push(openPeriod);
    }
  }
  return { shift, periods };
}

/**
 * The rides the card should mark. A ride is marked when autoscout says it is at
 * risk or the driver has not seen its notice. Anything else is left out.
 */
export function readMarkedRides(body) {
  const list = Array.isArray(body) ? body : body && Array.isArray(body.rides) ? body.rides : null;
  if (!list) return [];
  return list
    .map(ride => {
      const atRisk = ride && ride.atRisk && typeof ride.atRisk === 'object' ? ride.atRisk : null;
      const unseen = !!(ride && ride.notice && ride.notice.state === 'unseen');
      if (!atRisk && !unseen) return null;
      return {
        id: ride.id,
        pickupMs: toMs(ride.datetime),
        atRisk: atRisk
          ? {
            sinceMs: toMs(atRisk.since),
            reasonKey: reasonKey(atRisk.reason, 'not_live'),
            hasReason: !!(atRisk.reason && REASON_KEYS[String(atRisk.reason).split(':')[0]]),
          }
          : null,
        unseen: unseen ? { sinceMs: toMs(ride.notice.since) } : null,
      };
    })
    .filter(Boolean);
}
