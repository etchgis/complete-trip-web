import { Badge, Box, Divider, Text } from '@chakra-ui/react';

import {
  CONTACT_STALE_MS,
  FEED_REPORT_WINDOW_MS,
  deriveVerdict,
  describeAge,
} from '../../models/shuttle-status';
import { formatWindows, readNextService } from '../../models/shuttle-hours';
import useTranslation from '../../models/useTranslation';

const VERDICT_BADGES = {
  loading: { key: 'stateChecking', colorScheme: 'gray' },
  running: { key: 'serviceRunning', colorScheme: 'green' },
  // The shuttle is still on the feed but standing still, which is what a stop
  // or a layover looks like. Worth saying, not worth alarming anyone over.
  'running-position-old': { key: 'serviceRunningPositionOld', colorScheme: 'blue' },
  // The schedule says the shuttle is out but it has dropped off the feed, so
  // the badge stops being the reassuring half of that on its own.
  'running-no-contact': { key: 'serviceRunningNoContact', colorScheme: 'orange' },
  // The page cannot see the shuttle at all, so the honest answer is that we do
  // not know, not that it is running.
  'running-tracking-unavailable': {
    key: 'serviceRunningTrackingUnavailable',
    colorScheme: 'gray',
  },
  // The schedule counts the service as running, but no shuttle with a working
  // driver is reporting and the one that is has a driver who reported off
  // duty, so the badge cannot be the green "running" one.
  'running-driver-off-duty': {
    key: 'serviceScheduledDriverOffDuty',
    colorScheme: 'orange',
  },
  'no-driver': { key: 'serviceNoDriver', colorScheme: 'red' },
  'not-running': { key: 'serviceNotRunning', colorScheme: 'red' },
  unknown: { key: 'serviceUnknown', colorScheme: 'gray' },
};

// The sentence under the badge. It is chosen from the same verdict as the badge,
// so the two can never disagree: a badge that stops short of "running" never
// sits over a line that says the service is running.
const VERDICT_DETAILS = {
  loading: 'checkingDetail',
  running: 'serviceRunningDetail',
  // The position line below explains why the position is old. The service
  // itself is running, so this line says so.
  'running-position-old': 'serviceRunningDetail',
  'running-no-contact': 'serviceRunningNoContactDetail',
  'running-tracking-unavailable': 'serviceRunningTrackingUnavailableDetail',
  'running-driver-off-duty': 'serviceScheduledDriverOffDutyDetail',
  'no-driver': 'serviceNoDriverDetail',
  'not-running': 'serviceNotRunningDetail',
  unknown: 'serviceUnknownDetail',
};

// Verdicts for a service that is stopped, where the reason the check gave is
// worth saying in place of the general line.
const STOPPED_VERDICTS = ['no-driver', 'not-running'];

// Why the service is stopped, said in the agent's own language. The check sends
// its own sentence for each of these, but it only writes English, so the card
// says it from the code instead of pasting the sentence into a translated one.
const STOPPAGE_DETAILS = {
  outside_hours: 'serviceOutsideHoursDetail',
  day_not_scheduled: 'serviceDayNotScheduledDetail',
  service_alert: 'serviceAlertDetail',
};

// Stoppages that come from the published schedule alone. For these the next
// scheduled window is when service resumes. A dispatcher alert or a missing
// driver can stop service in the middle of a window, and the check then names
// the window already under way, so it is not shown for those.
const SCHEDULE_STOPPAGES = ['outside_hours', 'day_not_scheduled'];

const POSITION_DETAILS = {
  reporting: 'positionReportingDetail',
  'out-of-date': 'positionOutOfDateDetail',
  'off-duty': 'positionOffDutyDetail',
  'no-contact': 'positionNoContactDetail',
  'no-report': 'positionNoReportDetail',
  unreachable: 'positionUnreachableDetail',
};

// Whether the position on screen is the shuttle's current whereabouts rather
// than the last place it was seen. An off-duty report counts only while it is
// as fresh as a reporting one.
function isCurrentPosition(position) {
  if (position.state === 'reporting') return true;
  return (
    position.state === 'off-duty' &&
    typeof position.ageMs === 'number' &&
    position.ageMs <= CONTACT_STALE_MS
  );
}

// The copy names the window the feed will answer for, so the bound an agent
// reads is the one the request actually asked for.
const FEED_WINDOW_MINUTES = Math.round(FEED_REPORT_WINDOW_MS / 60000);

/**
 * The shuttle card a call center agent reads while a rider is on the phone.
 *
 * The badge is the verdict: whether this rider can be told the shuttle is
 * coming. Below it the two things that verdict is built from are kept apart,
 * because they can disagree: whether the service is meant to be running, and
 * where the shuttle is and how old that position is. Every line is driven by
 * the status object, which never reports a number the feeds do not support.
 */
export const ShuttleServiceStatus = ({ status }) => {
  const { t } = useTranslation();
  if (!status) return null;

  const { service, position } = status;
  const verdict = deriveVerdict(service, position);
  const badge = VERDICT_BADGES[verdict.state] || VERDICT_BADGES.unknown;
  const locationDetail = positionDetail(t, position);
  const hours = formatWindows(t, service.todayHours);
  // Whether the schedule itself has service closed. This is what says no shuttle
  // is out, so it is what hides the position block and the repeated hours footer.
  // The next-service line below depends on the schedule also sending a usable
  // next window, which it may not, so the closed state cannot be read off the
  // formatted line: doing so would show a stale position whenever the window is
  // missing or malformed.
  const scheduleClosed = SCHEDULE_STOPPAGES.indexOf(service.reason) !== -1;
  // When set, names when service resumes. Null when closed but the schedule sent
  // no usable next window, in which case only the line is dropped, not the hide.
  const nextService = scheduleClosed
    ? formatNextService(t, service.nextAvailable)
    : null;

  return (
    <Box data-testid="shuttle-service-status">
      <Badge
        colorScheme={badge.colorScheme}
        whiteSpace={'normal'}
        data-testid="shuttle-service-badge"
        data-tone={badge.colorScheme}
      >
        {badgeText(t, verdict, badge)}
      </Badge>

      {/* Only the service line announces itself. The age below changes every
          minute and would otherwise interrupt a screen reader constantly. */}
      <Text
        mt={2}
        fontSize={14}
        textAlign={'left'}
        role="status"
        aria-live="polite"
        data-testid="shuttle-service-detail"
      >
        {verdictDetail(t, verdict, service)}
      </Text>

      {nextService && (
        <Text mt={2} fontSize={14} textAlign={'left'} data-testid="shuttle-next-service">
          {nextService}
        </Text>
      )}

      {/* A dispatcher writes this notice by hand and only writes it in English,
          so it is shown as its own line and marked as English rather than being
          run into a sentence the agent is reading in another language. */}
      {service.notice && (
        <Text
          mt={2}
          fontSize={14}
          textAlign={'left'}
          data-testid="shuttle-service-notice"
        >
          {t('shuttleStatus.serviceNoticeLabel')}{' '}
          <Text as="span" lang="en">
            {[service.notice.header, service.notice.description]
              .filter(Boolean)
              .join(' - ')}
          </Text>
        </Text>
      )}

      {/* While the schedule has the service closed there is no shuttle out to
          locate, so the whole location block is left off rather than reporting a
          stale or missing position. It stays for every state where a shuttle is
          meant to be running, including a driver on break, so a waiting rider can
          still be told where it was. */}
      {!scheduleClosed && (
        <>
          <Divider mt={2} mb={2} />

          <Text fontSize={16} textAlign={'left'} fontWeight={'bold'}>
            {t(
              isCurrentPosition(position)
                ? 'shuttleStatus.currentLocation'
                : 'shuttleStatus.lastKnownLocation'
            )}
          </Text>
          <Text fontSize={16} textAlign={'left'} data-testid="shuttle-location">
            {locationText(t, position)}
          </Text>
          {locationDetail && (
            <Text fontSize={14} textAlign={'left'} data-testid="shuttle-location-detail">
              {locationDetail}
            </Text>
          )}
        </>
      )}

      {/* The next-service line already states today's window, so the footer
          would only repeat it. It is kept for the running and mid-window states,
          where there is no next-service line and it tells the agent when today's
          service ends. */}
      {hours && !scheduleClosed && (
        <>
          <Divider mt={2} mb={2} />
          <Text fontSize={14} textAlign={'left'} data-testid="shuttle-scheduled-hours">
            {t('shuttleStatus.scheduledHours', { hours })}
          </Text>
        </>
      )}
    </Box>
  );
};

function badgeText(t, verdict, badge) {
  if (verdict.state === 'running-no-contact') {
    const since = formatDuration(t, verdict.ageMs);
    if (!since) return t('shuttleStatus.serviceRunningNotReporting');
    return t('shuttleStatus.serviceRunningNoContact', { since });
  }
  if (verdict.state === 'running-position-old') {
    const age = formatDuration(t, verdict.ageMs);
    if (!age) return t('shuttleStatus.serviceRunning');
    return t('shuttleStatus.serviceRunningPositionOld', { age });
  }
  return t(`shuttleStatus.${badge.key}`);
}

function verdictDetail(t, verdict, service) {
  const stoppage =
    STOPPED_VERDICTS.indexOf(verdict.state) !== -1 && service.reason
      ? STOPPAGE_DETAILS[service.reason]
      : null;
  const key = stoppage || VERDICT_DETAILS[verdict.state] || VERDICT_DETAILS.unknown;
  return t(`shuttleStatus.${key}`);
}

// The location line says what the page knows about where the shuttle is, and
// never claims the shuttle reported nothing when the page has not managed to
// ask.
function locationText(t, position) {
  const location = position.location;
  if (location) {
    if (location.title) return location.title;
    // We have a position but no street name for it. The coordinates are still
    // more use to an agent than the word "unknown".
    return t('shuttleStatus.addressUnavailable', {
      lat: location.coordinates[1].toFixed(5),
      lng: location.coordinates[0].toFixed(5),
    });
  }
  if (position.state === 'loading') return t('shuttleStatus.locationChecking');
  if (position.state === 'no-report') {
    return t('shuttleStatus.noLocation', { minutes: FEED_WINDOW_MINUTES });
  }
  return t('shuttleStatus.locationUnavailable');
}

function positionDetail(t, position) {
  const key = POSITION_DETAILS[position.state];
  if (!key) return null;

  if (position.state === 'no-report') {
    return t(`shuttleStatus.${key}`, { minutes: FEED_WINDOW_MINUTES });
  }
  const age = formatAge(t, position.ageMs);
  if (!age) return t(`shuttleStatus.${key}`);

  // The wording says which clock produced the age, so an agent is never told a
  // position is fresh when all we know is when we last heard from the device.
  const ageKey =
    position.ageBasis === 'fix'
      ? 'reportedAge'
      : position.ageBasis === 'contact'
        ? 'contactAge'
        : 'observedAge';
  return `${t(`shuttleStatus.${key}`)} ${t(`shuttleStatus.${ageKey}`, { age })}`;
}

// An age as a point in the past, such as "8 minutes ago" or "2 hrs 5 min ago".
// Past an hour it is built from the same duration the badge shows, so the two
// always agree.
function formatAge(t, ageMs) {
  const parts = describeAge(ageMs);
  if (!parts) return null;
  if (parts.unit === 'moment') return t('shuttleStatus.ageMoment');
  if (parts.unit === 'overADay') return t('shuttleStatus.ageOverADay');
  if (parts.unit === 'minutes') {
    return t('shuttleStatus.ageMinutes', { count: parts.minutes });
  }
  return t('shuttleStatus.ageAgo', { duration: formatDuration(t, ageMs) });
}

// The same span of time worded as a length rather than as a point in the past,
// so it reads correctly after "no contact for".
function formatDuration(t, ageMs) {
  const parts = describeAge(ageMs);
  if (!parts) return null;
  if (parts.unit === 'moment') return t('shuttleStatus.durationMoment');
  if (parts.unit === 'overADay') return t('shuttleStatus.durationOverADay');
  if (parts.unit === 'minutes') {
    return t('shuttleStatus.durationMinutes', { minutes: parts.minutes });
  }
  if (parts.minutes === 0) {
    return t('shuttleStatus.durationHours', { count: parts.hours });
  }
  return t('shuttleStatus.durationHoursMinutes', {
    count: parts.hours,
    minutes: parts.minutes,
  });
}

// When the service is next scheduled, so an agent can tell a rider when to call
// back.
function formatNextService(t, next) {
  const service = readNextService(t, next);
  return service ? t('shuttleStatus.nextService', service) : null;
}
