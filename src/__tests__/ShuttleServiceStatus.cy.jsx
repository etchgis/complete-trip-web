import RootStore, { StoreProvider } from '../context/RootStore';

import { ChakraProvider } from '@chakra-ui/react';
import { ShuttleServiceStatus } from '../components/ShuttleServiceStatus/ShuttleServiceStatus';
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
    cy.get('[data-testid="shuttle-scheduled-hours"]')
      .should('have.text', 'Horario programado hoy: 10:30 - 14:30')
      .and('not.contain.text', 'PM');
    cy.get('[data-testid="shuttle-next-service"]')
      .should('contain.text', 'lunes')
      .and('contain.text', '10:30 - 14:30');
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
