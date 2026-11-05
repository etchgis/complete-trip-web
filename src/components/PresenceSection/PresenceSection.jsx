import { Badge, Box, Divider, Text } from '@chakra-ui/react';

import { formatAge } from '../ShuttleServiceStatus/ShuttleServiceStatus';
import useTranslation from '../../models/useTranslation';

const clock = (t, ms, timeZone) =>
  new Date(ms).toLocaleTimeString(t('shuttleStatus.dateLocale'), {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  });

/**
 * The driver tablet sections of the call center card.
 *
 * These sit below the existing card and never change it. The badge above them
 * still comes from the booking gate; this says what the presence service knows
 * about the tablet. Every part draws only on what the service sent, and a part
 * it did not send is left off.
 */
export const PresenceSection = ({ presence, timeZone }) => {
  const { t } = useTranslation();
  if (!presence) return null;

  const { loading, verdict, timeline, rides, signedIn, now } = presence;
  const at = ms => clock(t, ms, timeZone);

  return (
    <Box data-testid="presence-section">
      <Divider mt={2} mb={2} />
      <Text fontSize={16} textAlign={'left'} fontWeight={'bold'}>
        {t('presence.sectionTitle')}
      </Text>

      {!verdict && (
        <Text mt={1} fontSize={14} textAlign={'left'} data-testid="presence-unavailable">
          {t(loading ? 'presence.checking' : 'presence.unavailable')}
        </Text>
      )}

      {verdict && (
        <>
          <Badge
            mt={1}
            colorScheme={verdict.tone}
            whiteSpace={'normal'}
            data-testid="presence-badge"
            data-tone={verdict.tone}
          >
            {t(`presence.${verdict.labelKey}`)}
          </Badge>
          <Text
            mt={1}
            fontSize={14}
            textAlign={'left'}
            role="status"
            aria-live="polite"
            data-testid="presence-reason"
          >
            {t(`presence.${verdict.reasonKey}`)}
          </Text>
          {verdict.sinceMs !== null && (
            <Text fontSize={14} textAlign={'left'} data-testid="presence-since">
              {t('presence.sinceTime', { time: at(verdict.sinceMs) })}
            </Text>
          )}
          {verdict.lastHeardMs !== null && (
            <Text fontSize={14} textAlign={'left'} data-testid="presence-last-heard">
              {t('presence.lastHeard', { age: formatAge(t, verdict.lastHeardMs) })}
            </Text>
          )}
          {verdict.side === 'ours' && (
            <Text fontSize={14} textAlign={'left'} data-testid="presence-side">
              {t('shuttleStatus.positionUnreachableDetail')}
            </Text>
          )}
          {verdict.side === 'device' && (
            <Text fontSize={14} textAlign={'left'} data-testid="presence-side">
              {t('presence.sideDevice')}
            </Text>
          )}

          {signedIn && (
            <>
              <Text mt={2} fontSize={16} textAlign={'left'} fontWeight={'bold'}>
                {t('presence.shiftLabel')}
              </Text>
              <Text fontSize={14} textAlign={'left'} data-testid="presence-shift">
                {shiftText(t, verdict.shift, at)}
              </Text>
            </>
          )}

          {signedIn && verdict.device && verdict.device.length > 0 && (
            <>
              <Text mt={2} fontSize={16} textAlign={'left'} fontWeight={'bold'}>
                {t('presence.deviceLabel')}
              </Text>
              <Box data-testid="presence-device">
                {verdict.device.map(fact => (
                  <Text key={fact.key} fontSize={14} textAlign={'left'}>
                    {t(`presence.${fact.key}`, {
                      ...fact.values,
                      ...(fact.valueKey ? { value: t(`presence.${fact.valueKey}`) } : {}),
                    })}
                  </Text>
                ))}
              </Box>
            </>
          )}
        </>
      )}

      {signedIn && (
      <>
      <Text mt={2} fontSize={16} textAlign={'left'} fontWeight={'bold'}>
        {t('presence.timelineLabel')}
      </Text>
      <Box data-testid="presence-timeline">
        {timeline === null ? (
          <Text fontSize={14} textAlign={'left'}>
            {t(loading ? 'presence.checking' : 'presence.timelineUnavailable')}
          </Text>
        ) : (
          timelineLines(t, timeline, at).map((line, i) => (
            <Text key={i} fontSize={14} textAlign={'left'}>
              {line}
            </Text>
          ))
        )}
      </Box>
      </>
      )}

      {signedIn && rides && rides.length > 0 && (
        <>
          <Text mt={2} fontSize={16} textAlign={'left'} fontWeight={'bold'}>
            {t('presence.ridesLabel')}
          </Text>
          <Box data-testid="presence-rides">
            {rides.map(ride => (
              <Box key={ride.id} mb={1} data-testid="presence-ride" data-ride-id={ride.id}>
                {ride.pickupMs !== null && (
                  <Text fontSize={14} textAlign={'left'} fontWeight={'bold'}>
                    {t('presence.ridePickup', { time: at(ride.pickupMs) })}
                  </Text>
                )}
                {ride.atRisk && (
                  <Text fontSize={14} textAlign={'left'} data-testid="presence-ride-at-risk">
                    <Badge colorScheme="red" mr={1} whiteSpace={'normal'}>
                      {ride.atRisk.sinceMs !== null
                        ? t('presence.rideAtRisk', { time: at(ride.atRisk.sinceMs) })
                        : t('presence.rideAtRiskNoTime')}
                    </Badge>
                    {t(
                      ride.atRisk.hasReason
                        ? `presence.${ride.atRisk.reasonKey}`
                        : 'presence.rideAtRiskNoReason'
                    )}
                  </Text>
                )}
                {ride.unseen && (
                  <Text fontSize={14} textAlign={'left'} data-testid="presence-ride-unseen">
                    <Badge colorScheme="orange" mr={1} whiteSpace={'normal'}>
                      {t('presence.rideUnseen')}
                    </Badge>
                    {ride.unseen.sinceMs !== null &&
                      t('presence.rideUnseenSince', { time: at(ride.unseen.sinceMs) })}
                  </Text>
                )}
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

function shiftText(t, shift, at) {
  if (!shift) return t('presence.noShift');
  if (shift.startedMs === null) return t('presence.noShift');
  return t('presence.shiftStarted', { time: at(shift.startedMs) });
}

function timelineLines(t, timeline, at) {
  const rows = [];
  for (const e of timeline.shift) {
    if (e.kind === 'start') {
      rows.push([e.startMs, t('presence.timelineShiftStart', { time: at(e.startMs) })]);
    } else if (e.kind === 'end') {
      rows.push([e.startMs, t('presence.timelineShiftEnd', { time: at(e.startMs) })]);
    } else {
      rows.push([
        e.startMs,
        e.endMs === null
          ? t('presence.timelineBreakOpen', { start: at(e.startMs) })
          : t('presence.timelineBreak', { start: at(e.startMs), end: at(e.endMs) }),
      ]);
    }
  }
  for (const p of timeline.periods) {
    const base = p.reporting ? 'timelineReporting' : 'timelineNotReporting';
    rows.push([
      p.startMs,
      p.endMs === null
        ? t(`presence.${base}Open`, { start: at(p.startMs) })
        : t(`presence.${base}`, { start: at(p.startMs), end: at(p.endMs) }),
    ]);
  }
  if (rows.length === 0) return [t('presence.timelineEmpty')];
  return rows.sort((a, b) => a[0] - b[0]).map(r => r[1]);
}

export default PresenceSection;
