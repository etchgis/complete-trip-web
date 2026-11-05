import { Box } from '@chakra-ui/react';
import { mount } from '@cypress/react18';

import { PresenceSection } from '../components/PresenceSection/PresenceSection';
import { ShuttleServiceStatus } from '../components/ShuttleServiceStatus/ShuttleServiceStatus';
import {
  readMarkedRides,
  readTimeline,
  readVerdict,
} from '../models/presence-status';
import { TestWrapper } from '../setupTests';

const ZONE = 'America/New_York';
const NOW = Date.parse('2026-11-04T15:30:00Z');
const iso = minutesAgo => new Date(NOW - minutesAgo * 60000).toISOString();

const verdictBody = (overrides = {}) => ({
  vehicleId: 'v1',
  state: 'live',
  reason: null,
  since: iso(150),
  evaluatedAt: iso(0.1),
  side: null,
  lastHeardAt: iso(0.2),
  shift: { id: 's1', rosterDriverId: 'Pat', startedAt: iso(200), state: 'open' },
  device: {
    appVersion: '1.40.0',
    locPermission: 'precise',
    batteryPct: 64,
    network: 'wifi',
    powerSaver: false,
  },
  ...overrides,
});

const timelineBody = {
  events: [
    { at: iso(200), type: 'shift_start' },
    { at: iso(199), type: 'state', state: 'live' },
    { at: iso(120), type: 'break' },
    { at: iso(120), type: 'state', state: 'not_live', reason: 'on_break' },
    { at: iso(90), type: 'resume' },
    { at: iso(90), type: 'state', state: 'live' },
  ],
};

const ridesBody = [
  {
    id: 'r1',
    datetime: iso(-10),
    atRisk: { since: iso(6), reason: 'silent' },
  },
  { id: 'r2', datetime: iso(-40), notice: { state: 'unseen', since: iso(3) } },
  { id: 'r3', datetime: iso(-70), atRisk: null },
];

const presenceState = ({ verdict = verdictBody(), timeline = timelineBody, rides = ridesBody, loading = false, signedIn = true } = {}) => ({
  loading,
  signedIn,
  verdict: verdict && readVerdict(verdict, NOW),
  timeline: timeline && readTimeline(timeline),
  rides: rides ? readMarkedRides(rides) : null,
  now: NOW,
});

const render = value =>
  mount(
    <TestWrapper>
      <Box width="420px" p={2}>
        <PresenceSection presence={value} timeZone={ZONE} />
      </Box>
    </TestWrapper>
  );

describe('PresenceSection', () => {
  it('shows a live tablet with its shift and facts', () => {
    render(presenceState());
    cy.get('[data-testid="presence-badge"]').should('have.text', 'Tablet reporting').and('have.attr', 'data-tone', 'green');
    cy.get('[data-testid="presence-reason"]').should('have.text', 'The tablet is sending its position.');
    cy.get('[data-testid="presence-last-heard"]').should('contain.text', 'Last heard from the tablet less than a minute ago.');
    cy.get('[data-testid="presence-shift"]').should('have.text', 'Started 7:10 AM');
    cy.get('[data-testid="presence-device"]')
      .should('contain.text', 'App version 1.40.0')
      .and('contain.text', 'Location permission: precise')
      .and('contain.text', 'Battery 64%')
      .and('contain.text', 'Network: Wi-Fi')
      .and('contain.text', 'Power saver: off');
    cy.get('[data-testid="presence-side"]').should('not.exist');
    cy.screenshot('presence/live', { capture: 'viewport' });
  });

  it('says the problem is on the device side', () => {
    render(presenceState({
      verdict: verdictBody({ state: 'not_live', reason: 'app_background', side: 'device', lastHeardAt: iso(7) }),
      rides: null,
    }));
    cy.get('[data-testid="presence-badge"]').should('have.attr', 'data-tone', 'red');
    cy.get('[data-testid="presence-reason"]').should('have.text', 'The driver app is not on the tablet screen.');
    cy.get('[data-testid="presence-side"]').should('contain.text', 'not our systems');
    cy.get('[data-testid="presence-since"]').should('have.text', 'Since 8:00 AM');
    cy.get('[data-testid="presence-rides"]').should('not.exist');
    cy.screenshot('presence/device-side', { capture: 'viewport' });
  });

  it('reuses the trained wording when the problem is on our side', () => {
    render(presenceState({
      verdict: verdictBody({ state: 'unknown', side: 'ours', evaluatedAt: iso(5) }),
    }));
    cy.get('[data-testid="presence-badge"]').should('have.text', 'Tablet status unknown');
    cy.get('[data-testid="presence-side"]').should(
      'have.text',
      'We could not reach the shuttle tracking. The problem is on our side, not necessarily with the shuttle.'
    );
  });

  it('leaves off device facts and shift the service did not send', () => {
    render(presenceState({ verdict: verdictBody({ device: null, shift: null, lastHeardAt: null }) }));
    cy.get('[data-testid="presence-device"]').should('not.exist');
    cy.get('[data-testid="presence-last-heard"]').should('not.exist');
    cy.get('[data-testid="presence-shift"]').should('have.text', 'No shift is open.');
  });

  it('lists the day as shift and reporting lines', () => {
    render(presenceState());
    cy.get('[data-testid="presence-timeline"]')
      .should('contain.text', 'Shift started 7:10 AM')
      .and('contain.text', 'Break 8:30 AM - 9:00 AM')
      .and('contain.text', 'Not reporting 8:30 AM - 9:00 AM')
      .and('contain.text', 'Reporting since 9:00 AM');
  });

  it('says so when the timeline is unavailable', () => {
    render(presenceState({ timeline: null }));
    cy.get('[data-testid="presence-timeline"]').should('have.text', "Today's timeline is not available right now.");
  });

  it('marks at risk and unseen rides and no others', () => {
    render(presenceState());
    cy.get('[data-testid="presence-ride"]').should('have.length', 2);
    cy.get('[data-ride-id="r1"] [data-testid="presence-ride-at-risk"]')
      .should('contain.text', 'At risk since 10:24 AM')
      .and('contain.text', 'The tablet has stopped checking in.');
    cy.get('[data-ride-id="r2"] [data-testid="presence-ride-unseen"]')
      .should('contain.text', 'The driver has not seen this ride yet.')
      .and('contain.text', 'Not seen by the driver since 10:27 AM.');
    cy.screenshot('presence/rides', { capture: 'viewport' });
  });

  it('reads as unavailable when the verdict could not be read', () => {
    render(presenceState({ verdict: null }));
    cy.get('[data-testid="presence-unavailable"]').should('have.text', 'The driver tablet status is not available right now.');
  });

  it('adds sections below the existing card without changing it', () => {
    const status = {
      service: { state: 'running' },
      position: {
        state: 'reporting',
        location: { title: 'Main St at Utica', coordinates: [-78.86, 42.89] },
        ageMs: 25000,
        ageBasis: 'contact',
      },
    };
    mount(
      <TestWrapper>
        <Box width="420px" p={2}>
          <ShuttleServiceStatus status={status} />
          <PresenceSection presence={presenceState()} timeZone={ZONE} />
        </Box>
      </TestWrapper>
    );
    cy.get('[data-testid="shuttle-service-badge"]').should('have.text', 'Service running');
    cy.get('[data-testid="shuttle-service-status"]').next('[data-testid="presence-section"]').should('exist');
    cy.screenshot('presence/full-card', { capture: 'viewport' });
  });

  it('shows only the badge lines when not signed in', () => {
    render(presenceState({
      signedIn: false,
      timeline: null,
      rides: null,
      verdict: verdictBody({ state: 'not_live', reason: 'silent', side: 'device', shift: undefined, device: undefined }),
    }));
    cy.get('[data-testid="presence-badge"]').should('have.attr', 'data-tone', 'red');
    cy.get('[data-testid="presence-reason"]').should('exist');
    cy.get('[data-testid="presence-since"]').should('exist');
    cy.get('[data-testid="presence-last-heard"]').should('exist');
    cy.get('[data-testid="presence-side"]').should('exist');
    cy.get('[data-testid="presence-shift"]').should('not.exist');
    cy.get('[data-testid="presence-device"]').should('not.exist');
    cy.get('[data-testid="presence-timeline"]').should('not.exist');
    cy.get('[data-testid="presence-rides"]').should('not.exist');
  });

  it('never shows the driver name', () => {
    render(presenceState());
    cy.get('[data-testid="presence-section"]').should('not.contain.text', 'Pat');
  });

  it('hides shift, details, timeline and rides when signed out even if sent', () => {
    render(presenceState({ signedIn: false }));
    cy.get('[data-testid="presence-shift"]').should('not.exist');
    cy.get('[data-testid="presence-timeline"]').should('not.exist');
    cy.get('[data-testid="presence-rides"]').should('not.exist');
  });
});
