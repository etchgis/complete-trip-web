import RootStore, { StoreProvider } from '../context/RootStore';

import { ChakraProvider } from '@chakra-ui/react';
import { ShuttleServiceStatus } from '../components/ShuttleServiceStatus/ShuttleServiceStatus';
import {
  deriveStatus,
  readAvailability,
  readVehicle,
} from '../models/shuttle-status';
import { TestWrapper } from '../setupTests';
import { mount } from '@cypress/react18';
import { theme } from '../theme';

const status = ({ service = {}, position = {} } = {}) => ({
  service: { state: 'running', ...service },
  position: {
    state: 'reporting',
    location: { title: 'Main St at Utica', coordinates: [-78.86, 42.89] },
    // A reporting shuttle is one the feed heard from seconds ago. Anything
    // older than a minute is classified out of date before it reaches the card,
    // so a fixture that pairs the two is a state production cannot produce.
    ageMs: 25 * 1000,
    ageBasis: 'contact',
    ...position,
  },
});

const render = value =>
  mount(
    <TestWrapper>
      <ShuttleServiceStatus status={value} />
    </TestWrapper>
  );

const renderInSpanish = value => {
  const store = new RootStore();
  store.uiStore.setUI({ language: 'es' });
  return mount(
    <StoreProvider store={store}>
      <ChakraProvider theme={theme}>
        <ShuttleServiceStatus status={value} />
      </ChakraProvider>
    </StoreProvider>
  );
};

const HOURS = [{ start: '10:30', end: '14:30' }];

// The card as the model builds it from raw vehicle feed entries, for a service
// inside its hours. Going through the model means the card sees exactly what
// the feeds would produce.
const fromFeed = vehicles => {
  const now = Date.now();
  return deriveStatus({
    poll: {
      availability: readAvailability({ isAvailable: true, todayHours: HOURS }),
      vehicleFeedOk: true,
      vehicle: readVehicle({ vehicles }),
      title: 'Main St at Utica',
      requestedAt: now,
    },
    history: {},
    now,
  });
};

const offDutyReport = (ageSeconds, coordinates = [-78.86, 42.89]) => ({
  vehicleId: 'off-duty',
  coordinates,
  ageSeconds,
  onDuty: false,
});

describe('ShuttleServiceStatus', () => {
  it('says the service is running and how old the position is', () => {
    render(status());
    cy.get('[data-testid="shuttle-service-badge"]').should(
      'have.text',
      'Service running'
    );
    cy.get('[data-testid="shuttle-location"]').should(
      'have.text',
      'Main St at Utica'
    );
    cy.get('[data-testid="shuttle-location-detail"]').should(
      'contain.text',
      'Last heard from less than a minute ago.'
    );
  });

  it('does not show a green running badge over an off-duty report', () => {
    // Built through the model, so the card sees exactly what the feeds would
    // produce for a service inside its hours whose shuttle reported off duty.
    render(fromFeed([offDutyReport(25 * 60)]));
    cy.get('[data-testid="shuttle-service-badge"]')
      .should('not.have.attr', 'data-tone', 'green')
      .and('not.have.text', 'Service running');
    cy.contains('Last known location').should('exist');
    cy.contains('Current location').should('not.exist');

    render(fromFeed([offDutyReport(30)]));
    cy.get('[data-testid="shuttle-service-badge"]')
      .should('have.text', 'Service scheduled - driver off duty')
      .and('have.attr', 'data-tone', 'orange');
    cy.get('[data-testid="shuttle-location-detail"]').should(
      'contain.text',
      'The driver has marked themselves off duty.'
    );
  });

  it('does not say the service is running under a driver off duty badge', () => {
    render(fromFeed([offDutyReport(30)]));
    cy.get('[data-testid="shuttle-service-badge"]').should(
      'have.text',
      'Service scheduled - driver off duty'
    );
    cy.get('[data-testid="shuttle-service-detail"]')
      .should('not.contain.text', 'running now')
      .and('contain.text', 'we cannot confirm a shuttle is on its way');
  });

  it('heads an off-duty report older than a minute as the last known location', () => {
    // Only a report as fresh as a reporting shuttle's is where the vehicle is
    // now. Between one and five minutes the feed still serves it, so it is
    // still an off-duty report, but it is no longer current.
    [90, 3 * 60, 4 * 60 + 50].forEach(ageSeconds => {
      render(fromFeed([offDutyReport(ageSeconds)]));
      cy.get('[data-testid="shuttle-service-badge"]').should(
        'have.text',
        'Service scheduled - driver off duty'
      );
      cy.contains('Last known location').should('exist');
      cy.contains('Current location').should('not.exist');
    });
  });

  it('shows a working shuttle as running when another tablet has just gone off duty', () => {
    render(
      fromFeed([
        offDutyReport(5, [-78.9, 42.95]),
        {
          vehicleId: 'working',
          coordinates: [-78.86, 42.89],
          ageSeconds: 40,
          onDuty: true,
        },
      ])
    );
    cy.get('[data-testid="shuttle-service-badge"]')
      .should('have.text', 'Service running')
      .and('have.attr', 'data-tone', 'green');
    cy.get('[data-testid="shuttle-service-detail"]').should(
      'have.text',
      'The shuttle service is running now.'
    );
    cy.get('[data-testid="shuttle-location-detail"]')
      .should('contain.text', 'The shuttle is reporting.')
      .and('not.contain.text', 'off duty');
  });

  it('never says the service is running under a badge that stops short of it', () => {
    const positions = [
      { state: 'no-contact', ageMs: 8 * 60000 },
      { state: 'no-report', location: null, ageMs: null, ageBasis: null },
      { state: 'unreachable', location: null, ageMs: null, ageBasis: null },
      { state: 'off-duty', ageMs: 30000 },
    ];
    positions.forEach(position => {
      render(status({ position }));
      cy.get('[data-testid="shuttle-service-badge"]')
        .should('not.have.attr', 'data-tone', 'green')
        .and('not.have.attr', 'data-tone', 'blue');
      cy.get('[data-testid="shuttle-service-detail"]')
        .should('not.contain.text', 'running now')
        .and('contain.text', 'we cannot confirm a shuttle is on its way');
    });

    // A position that is only old still has a running service behind it.
    render(status({ position: { state: 'out-of-date', ageMs: 4 * 60000 } }));
    cy.get('[data-testid="shuttle-service-detail"]').should(
      'have.text',
      'The shuttle service is running now.'
    );
  });

  it('separates a driver off duty from the service being closed', () => {
    render(status({ service: { state: 'no-driver' } }));
    cy.get('[data-testid="shuttle-service-badge"]').should(
      'have.text',
      'No driver on duty'
    );
    cy.get('[data-testid="shuttle-service-detail"]').should(
      'contain.text',
      'every driver has marked themselves off duty'
    );
  });

  it('keeps the last known location with its age when contact is lost', () => {
    render(status({ position: { state: 'no-contact', ageMs: 8 * 60000 } }));
    cy.contains('Last known location').should('exist');
    cy.get('[data-testid="shuttle-location"]').should(
      'have.text',
      'Main St at Utica'
    );
    cy.get('[data-testid="shuttle-location-detail"]')
      .should('contain.text', 'The shuttle has stopped reporting')
      .and('contain.text', 'Last heard from 8 minutes ago.');
  });

  it('stops the badge reading as reassuring while nothing has heard from the shuttle', () => {
    // The schedule can go on saying the service is running for hours after a
    // tablet dies. The badge is the only colored thing on the card and it is
    // what gets read under time pressure, so it has to carry both halves.
    render(status());
    cy.get('[data-testid="shuttle-service-badge"]').should(
      'have.attr',
      'data-tone',
      'green'
    );

    render(status({ position: { state: 'no-contact', ageMs: 35 * 60000 } }));
    cy.get('[data-testid="shuttle-service-badge"]')
      .should('have.text', 'Service running - no contact for 35 min')
      .and('have.attr', 'data-tone', 'orange');
  });

  it('says the shuttle is not reporting when it never has', () => {
    render(
      status({
        position: {
          state: 'no-report',
          location: null,
          ageMs: null,
          ageBasis: null,
        },
      })
    );
    cy.get('[data-testid="shuttle-service-badge"]')
      .should('have.text', 'Service running - shuttle not reporting')
      .and('have.attr', 'data-tone', 'orange');
  });

  it('states the feed window rather than when the page opened', () => {
    render(
      status({
        position: {
          state: 'no-report',
          location: null,
          ageMs: null,
          ageBasis: null,
        },
      })
    );
    cy.get('[data-testid="shuttle-location"]').should(
      'have.text',
      'None reported in the last 5 minutes.'
    );
    cy.get('[data-testid="shuttle-location-detail"]')
      .should(
        'contain.text',
        'The shuttle has not reported in the last 5 minutes.'
      )
      .and('contain.text', 'whether it was running earlier today')
      .and('not.contain.text', 'this page opened');
  });

  it('does not raise the alarm for a parked shuttle the feed still serves', () => {
    // The driver app sends nothing while the vehicle stands still, so every
    // layover produces a position more than a minute old.
    render(status({ position: { state: 'out-of-date', ageMs: 4 * 60000 } }));
    cy.get('[data-testid="shuttle-service-badge"]')
      .should('have.text', 'Service running - position 4 min old')
      .and('have.attr', 'data-tone', 'blue');
    cy.get('[data-testid="shuttle-location-detail"]').should(
      'contain.text',
      'It does not send one while standing still'
    );
  });

  it('says the same length of time in the badge and in the detail', () => {
    render(status({ position: { state: 'no-contact', ageMs: 2 * 3600000 } }));
    cy.get('[data-testid="shuttle-service-badge"]').should(
      'have.text',
      'Service running - no contact for 2 hrs'
    );
    cy.get('[data-testid="shuttle-location-detail"]').should(
      'contain.text',
      'Last heard from 2 hrs ago.'
    );

    render(
      status({ position: { state: 'no-contact', ageMs: 2 * 3600000 + 5 * 60000 } })
    );
    cy.get('[data-testid="shuttle-service-badge"]').should(
      'have.text',
      'Service running - no contact for 2 hrs 5 min'
    );
    cy.get('[data-testid="shuttle-location-detail"]').should(
      'contain.text',
      'Last heard from 2 hrs 5 min ago.'
    );
  });

  it('does not claim nothing was reported while it is still checking', () => {
    render({
      service: { state: 'loading' },
      position: { state: 'loading', location: null, ageMs: null, ageBasis: null },
    });
    cy.get('[data-testid="shuttle-service-badge"]').should('have.text', 'Checking');
    cy.get('[data-testid="shuttle-location"]')
      .should('have.text', 'Looking for the shuttle.')
      .and('not.contain.text', 'None reported');
  });

  it('does not claim nothing was reported when it could not ask', () => {
    render(
      status({
        position: {
          state: 'unreachable',
          location: null,
          ageMs: null,
          ageBasis: null,
        },
      })
    );
    cy.get('[data-testid="shuttle-location"]')
      .should('have.text', 'Location unavailable right now.')
      .and('not.contain.text', 'None reported');
    cy.get('[data-testid="shuttle-location-detail"]').should(
      'contain.text',
      'We could not reach the shuttle tracking.'
    );
  });

  it('shows a position older than a minute with its real age', () => {
    render(status({ position: { state: 'out-of-date', ageMs: 4 * 60000 } }));
    cy.get('[data-testid="shuttle-location"]').should(
      'have.text',
      'Main St at Utica'
    );
    cy.get('[data-testid="shuttle-location-detail"]').should(
      'contain.text',
      'Last heard from 4 minutes ago.'
    );
  });

  it('blames itself, not the shuttle, when the feed cannot be reached', () => {
    render(
      status({
        service: { state: 'unknown' },
        position: { state: 'unreachable', ageMs: null, ageBasis: null },
      })
    );
    cy.get('[data-testid="shuttle-location-detail"]').should(
      'contain.text',
      'The problem is on our side, not necessarily with the shuttle.'
    );
  });

  it('does not confirm the service is running when it cannot see the shuttle', () => {
    // The page's own failure is not a warning about the service, but it is not
    // a sighting either, so the badge says it does not know.
    render(
      status({ position: { state: 'unreachable', ageMs: null, ageBasis: null } })
    );
    cy.get('[data-testid="shuttle-service-badge"]')
      .should('have.text', 'Service running - tracking unavailable')
      .and('have.attr', 'data-tone', 'gray');
  });

  it('says why the service is closed in its own words, not the schedule service\'s', () => {
    render(
      status({
        service: {
          state: 'not-running',
          reason: 'outside_hours',
          details: 'Operating hours: 10:30 AM - 2:30 PM',
          todayHours: HOURS,
        },
        position: { state: 'no-report', location: null, ageMs: null },
      })
    );
    cy.get('[data-testid="shuttle-service-detail"]')
      .should(
        'have.text',
        'The shuttle service is outside its operating hours right now.'
      )
      .and('not.contain.text', 'Operating hours:');
    cy.get('[data-testid="shuttle-service-notice"]').should('not.exist');
    // The hours belong on the card once, under their own heading.
    cy.get('[data-testid="shuttle-scheduled-hours"]').should(
      'have.text',
      'Scheduled hours today: 10:30 AM - 2:30 PM'
    );
  });

  it('sets a dispatcher notice apart as its own line, marked as English', () => {
    render(
      status({
        service: {
          state: 'not-running',
          reason: 'service_alert',
          details: 'The shuttle is out of service for the parade until 3 PM.',
          notice: {
            header: null,
            description: 'The shuttle is out of service for the parade until 3 PM.',
          },
        },
        position: { state: 'no-report', location: null, ageMs: null },
      })
    );
    cy.get('[data-testid="shuttle-service-detail"]').should(
      'have.text',
      'The shuttle service is stopped right now.'
    );
    cy.get('[data-testid="shuttle-service-notice"]')
      .should('contain.text', 'Notice from the service:')
      .find('[lang="en"]')
      .should('have.text', 'The shuttle is out of service for the parade until 3 PM.');
  });

  it('shows a dispatcher warning while the service is running', () => {
    render(
      status({
        service: {
          notice: {
            header: 'Detour on Main St',
            description: 'Stops between Utica and Ferry are skipped.',
          },
        },
      })
    );
    cy.get('[data-testid="shuttle-service-badge"]').should(
      'have.text',
      'Service running'
    );
    cy.get('[data-testid="shuttle-service-notice"]')
      .should('contain.text', 'Notice from the service:')
      .find('[lang="en"]')
      .should(
        'have.text',
        'Detour on Main St - Stops between Utica and Ferry are skipped.'
      );
  });

  it('says when the service is next scheduled while it is not running', () => {
    render(
      status({
        service: {
          state: 'not-running',
          reason: 'outside_hours',
          todayHours: HOURS,
          nextAvailable: { date: '2026-09-16', window: HOURS[0] },
        },
        position: { state: 'no-report', location: null, ageMs: null },
      })
    );
    cy.get('[data-testid="shuttle-next-service"]').should(
      'have.text',
      'Next scheduled service: Wednesday, September 16, 10:30 AM - 2:30 PM'
    );
  });

  it('states the window once outside hours, in the next-service line only', () => {
    render(
      status({
        service: {
          state: 'not-running',
          reason: 'outside_hours',
          todayHours: HOURS,
          nextAvailable: { date: '2026-09-16', window: HOURS[0] },
        },
        position: { state: 'no-report', location: null, ageMs: null },
      })
    );
    cy.get('[data-testid="shuttle-next-service"]').should(
      'contain.text',
      '10:30 AM - 2:30 PM'
    );
    // The footer would only repeat the window the next-service line already
    // shows, so it is hidden here.
    cy.get('[data-testid="shuttle-scheduled-hours"]').should('not.exist');
    cy.get('[data-testid="shuttle-service-status"]')
      .invoke('text')
      .then(text => {
        const matches = text.match(/10:30 AM - 2:30 PM/g) || [];
        expect(matches).to.have.length(1);
      });
  });

  it('leaves off the location block when the schedule has service closed', () => {
    render(
      status({
        service: {
          state: 'not-running',
          reason: 'outside_hours',
          todayHours: HOURS,
          nextAvailable: { date: '2026-09-16', window: HOURS[0] },
        },
        position: { state: 'no-report', location: null, ageMs: null },
      })
    );
    cy.get('[data-testid="shuttle-next-service"]').should('exist');
    cy.get('[data-testid="shuttle-location"]').should('not.exist');
    cy.get('[data-testid="shuttle-location-detail"]').should('not.exist');
    cy.contains('Last known location').should('not.exist');
    cy.contains('Current location').should('not.exist');
  });

  it('leaves off the location block when closed even with no next window', () => {
    // The schedule has service closed but sent no usable next window, so the
    // next-service line cannot render. The location block must still be hidden:
    // no shuttle is out, so a last known location would be stale.
    render(
      status({
        service: {
          state: 'not-running',
          reason: 'outside_hours',
          todayHours: HOURS,
          nextAvailable: null,
        },
        position: {
          state: 'no-contact',
          location: { title: 'Main St at Utica', coordinates: [-78.86, 42.89] },
          ageMs: 8 * 60000,
          ageBasis: 'contact',
        },
      })
    );
    cy.get('[data-testid="shuttle-next-service"]').should('not.exist');
    cy.get('[data-testid="shuttle-location"]').should('not.exist');
    cy.get('[data-testid="shuttle-location-detail"]').should('not.exist');
    cy.contains('Last known location').should('not.exist');
    cy.contains('Current location').should('not.exist');
    // The footer must not reappear as a stand-in for the missing line.
    cy.get('[data-testid="shuttle-scheduled-hours"]').should('not.exist');
  });

  it('keeps the location block while the service is running', () => {
    render(status({ service: { state: 'running', todayHours: HOURS } }));
    cy.get('[data-testid="shuttle-location"]').should(
      'have.text',
      'Main St at Utica'
    );
    cy.contains('Current location').should('exist');
  });

  it('keeps the location block when a driver is off duty mid-service', () => {
    // A driver on break stops the service without the schedule closing it, so a
    // waiting rider still needs to see where the shuttle was.
    render(fromFeed([offDutyReport(90)]));
    cy.get('[data-testid="shuttle-next-service"]').should('not.exist');
    cy.get('[data-testid="shuttle-location"]').should('exist');
    cy.contains('Last known location').should('exist');

    render(status({ service: { state: 'no-driver' } }));
    cy.get('[data-testid="shuttle-next-service"]').should('not.exist');
    cy.get('[data-testid="shuttle-location"]').should(
      'have.text',
      'Main St at Utica'
    );
  });

  it('shows the scheduled hours footer while the service is running', () => {
    render(status({ service: { state: 'running', todayHours: HOURS } }));
    cy.get('[data-testid="shuttle-next-service"]').should('not.exist');
    cy.get('[data-testid="shuttle-scheduled-hours"]').should(
      'have.text',
      'Scheduled hours today: 10:30 AM - 2:30 PM'
    );
  });

  it('does not name a next window when a dispatcher or a missing driver stopped service', () => {
    // The check names the window already under way in that case, which would
    // read as service coming back later today.
    ['service_alert', 'no-driver'].forEach(reason => {
      render(
        status({
          service: {
            state: reason === 'no-driver' ? 'no-driver' : 'not-running',
            reason,
            todayHours: HOURS,
            nextAvailable: { date: '2026-09-15', window: HOURS[0] },
          },
          position: { state: 'no-report', location: null, ageMs: null },
        })
      );
      cy.get('[data-testid="shuttle-service-badge"]').should('exist');
      cy.get('[data-testid="shuttle-next-service"]').should('not.exist');
    });
  });

  it('prints hours the Spanish way and does not overstate a closed day', () => {
    renderInSpanish(
      status({
        service: {
          state: 'not-running',
          reason: 'day_not_scheduled',
          todayHours: HOURS,
          nextAvailable: { date: '2026-09-21', window: HOURS[0] },
        },
        position: { state: 'no-report', location: null, ageMs: null },
      })
    );
    cy.get('[data-testid="shuttle-service-badge"]').should(
      'have.text',
      'Servicio no disponible'
    );
    // The next-service line carries the window, so the footer stays hidden and
    // the Spanish hours show once, there.
    cy.get('[data-testid="shuttle-scheduled-hours"]').should('not.exist');
    cy.get('[data-testid="shuttle-next-service"]')
      .should('contain.text', 'lunes')
      .and('contain.text', '10:30 - 14:30')
      .and('not.contain.text', 'PM');
  });

  it('shows coordinates rather than the word unknown when the address is missing', () => {
    render(
      status({
        position: { location: { title: null, coordinates: [-78.86, 42.89] } },
      })
    );
    cy.get('[data-testid="shuttle-location"]').should(
      'have.text',
      'Address unavailable for 42.89000, -78.86000'
    );
  });
});
