import RootStore, { StoreProvider } from '../context/RootStore';

import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import { Second } from '../components/ScheduleTripModal/ScheduleTripModal';
import { TransitRoutes } from '../components/TransitRoutes/TransitRoutes';
import config from '../config';
import { mount } from '@cypress/react18';
import { theme } from '../theme';

// Every shuttle booking decision comes from the service's availability check,
// never from hours written into the app.
const CHECK_URL = `${config.SERVICES.skids.url}/services/availability/${config.HDS_SERVICE_ID}/check*`;

const OPEN = {
  isAvailable: true,
  todayHours: [{ start: '10:30', end: '14:30' }],
  hoursDisplay: '10:30 AM - 2:30 PM',
};

const CLOSED = {
  isAvailable: false,
  reason: 'outside_hours',
  details: 'Operating hours: 10:30 AM - 2:30 PM',
  todayHours: [{ start: '10:30', end: '14:30' }],
  hoursDisplay: '10:30 AM - 2:30 PM',
};

const withStore = (store, children) => (
  <MemoryRouter>
    <StoreProvider store={store}>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </StoreProvider>
  </MemoryRouter>
);

const mountRoutes = onShuttlePress => {
  const store = new RootStore();
  store.uiStore.setUX('webapp');
  store.mapStore.setMapState('routesLoading', false);
  store.mapStore.setMapState('routes', [
    {
      mode: 'shuttle',
      service: config.HDS_SERVICE_ID,
      name: 'NFTA Community Shuttle',
    },
  ]);
  mount(withStore(store, <TransitRoutes onShuttlePress={onShuttlePress} />));
};

const mountModes = when => {
  const store = new RootStore();
  store.trip.create();
  store.trip.updateWhen(when);
  mount(
    withStore(
      store,
      <Second
        setStep={() => {}}
        trip={store.trip}
        setSelectedTrip={() => {}}
      />
    )
  );
};

// The browser clock is pinned to a time on the other side of the check's
// answer from any fixed business-hours guess, so the test only passes when the
// check decides.
const pinClock = (hour, minute = 0) =>
  cy.clock(new Date(2026, 8, 15, hour, minute).getTime(), ['Date']);

describe('booking the community shuttle from the route list', () => {
  it('tells the rider it is not available when the check says it is closed', () => {
    pinClock(9);
    cy.intercept('GET', CHECK_URL, CLOSED).as('check');
    const onShuttlePress = cy.stub().as('press');
    mountRoutes(onShuttlePress);

    cy.get('[data-testid="map-route-list-button"]').click();
    cy.wait('@check');
    cy.contains('Sorry, but this shuttle is not available at this time.').should(
      'be.visible'
    );
    cy.get('@press').should('not.have.been.called');
  });

  it('starts the booking when the check says it is running', () => {
    pinClock(7, 30);
    cy.intercept('GET', CHECK_URL, OPEN).as('check');
    const onShuttlePress = cy.stub().as('press');
    mountRoutes(onShuttlePress);

    cy.get('[data-testid="map-route-list-button"]').click();
    cy.wait('@check');
    cy.get('@press').should('have.been.calledOnce');
  });

  it('does not turn a failed check into "not available"', () => {
    pinClock(7, 30);
    cy.intercept('GET', CHECK_URL, { statusCode: 503, body: { message: 'down' } }).as(
      'check'
    );
    const onShuttlePress = cy.stub().as('press');
    mountRoutes(onShuttlePress);

    cy.get('[data-testid="map-route-list-button"]').click();
    cy.wait('@check');
    cy.get('@press').should('have.been.calledOnce');
  });
});

describe('choosing the community shuttle for a trip', () => {
  it('asks about the time the rider picked and hides the shuttle when it is closed then', () => {
    const when = new Date(2026, 8, 15, 9, 0, 0);
    cy.intercept('GET', CHECK_URL, CLOSED).as('check');
    mountModes(when);

    cy.wait('@check')
      .its('request.url')
      .should('contain', `timestamp=${when.getTime()}`);
    cy.get('#mode-checkbox-bus').should('exist');
    cy.get('#mode-checkbox-hail').should('not.exist');
  });

  it('offers the shuttle when the check says it runs at that time', () => {
    cy.intercept('GET', CHECK_URL, OPEN).as('check');
    mountModes(new Date(2026, 8, 15, 7, 30, 0));

    cy.wait('@check');
    cy.get('#mode-checkbox-hail').should('exist');
  });
});
